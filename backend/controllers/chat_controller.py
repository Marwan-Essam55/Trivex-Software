import json
import uuid
from typing import List, Optional, Dict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from core.security import get_current_user, get_db
from models.user import User
from models.chat import Conversation, Message
from schemas.chat_schema import ConversationOut, MessageOut, MessageCreate, ParticipantOut
from services import chat_service

router = APIRouter(prefix="/community", tags=["Community"])


# ─────────────────────────── WebSocket Manager ───────────────────────────

class ConnectionManager:
    def __init__(self):
        # conversation_id -> list of websocket connections
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, conversation_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(conversation_id, []).append(ws)

    def disconnect(self, conversation_id: str, ws: WebSocket):
        convo_list = self.active.get(conversation_id, [])
        if ws in convo_list:
            convo_list.remove(ws)

    async def broadcast(self, conversation_id: str, data: dict):
        dead = []
        for ws in self.active.get(conversation_id, []):
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(conversation_id, ws)


manager = ConnectionManager()


# ─────────────────────────── Helpers ───────────────────────────

def _message_to_dict(msg: Message) -> dict:
    return {
        "id": str(msg.id),
        "conversation_id": str(msg.conversation_id),
        "sender_id": str(msg.sender_id),
        "sender_first_name": msg.sender.first_name,
        "sender_last_name": msg.sender.last_name,
        "sender_profile_picture_url": msg.sender.profile_picture_url,
        "content": msg.content,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat(),
    }


def _build_conversation_out(convo: Conversation, current_user: User, db: Session) -> dict:
    unread = chat_service.count_unread(db, convo.id, current_user)
    last_msg = convo.messages[-1] if convo.messages else None
    return {
        "id": str(convo.id),
        "company_name": convo.company_name,
        "participant_a": _participant_out(convo.participant_a),
        "participant_b": _participant_out(convo.participant_b),
        "last_message": _message_to_dict(last_msg) if last_msg else None,
        "unread_count": unread,
        "created_at": convo.created_at.isoformat(),
    }


def _participant_out(user: User) -> dict:
    return {
        "id": str(user.id),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "profile_picture_url": user.profile_picture_url,
        "title": user.title,
    }


# ─────────────────────────── REST Endpoints ───────────────────────────

@router.get("/users")
def search_company_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search for users within the same company."""
    if not current_user.company_name:
        raise HTTPException(status_code=400, detail="You are not assigned to a company.")
    users = chat_service.get_company_users(db, current_user, search)
    return [_participant_out(u) for u in users]


@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all conversations for the current user."""
    if not current_user.company_name:
        raise HTTPException(status_code=400, detail="You are not assigned to a company.")
    convos = chat_service.get_conversations_for_user(db, current_user)
    return [_build_conversation_out(c, current_user, db) for c in convos]


@router.post("/conversations/{other_user_id}")
def start_or_get_conversation(
    other_user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get or create a conversation with another user in the same company."""
    if not current_user.company_name:
        raise HTTPException(status_code=400, detail="You are not assigned to a company.")
    convo = chat_service.get_or_create_conversation(db, current_user, other_user_id)
    if not convo:
        raise HTTPException(status_code=403, detail="You cannot start a conversation with this user.")
    return _build_conversation_out(convo, current_user, db)


@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Load message history for a conversation."""
    messages = chat_service.get_messages(db, conversation_id, current_user, skip=skip, limit=limit)
    if messages is None:
        raise HTTPException(status_code=403, detail="Access denied.")
    # Mark as read
    chat_service.mark_messages_read(db, conversation_id, current_user)
    return [_message_to_dict(m) for m in messages]


@router.post("/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message (REST fallback). Also broadcasts via WebSocket."""
    msg = chat_service.create_message(db, conversation_id, current_user, payload.content)
    if not msg:
        raise HTTPException(status_code=403, detail="Access denied or conversation not found.")
    return _message_to_dict(msg)


# ─────────────────────────── WebSocket ───────────────────────────

@router.websocket("/ws/{conversation_id}")
async def chat_websocket(
    websocket: WebSocket,
    conversation_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """
    WebSocket endpoint for real-time chat.
    Client must pass their JWT as ?token=<jwt> query param.
    On connect, receive live messages as JSON.
    To send a message, send JSON: {"content": "hello"}
    """
    from core.security import get_current_user as _get_user
    from jose import jwt, JWTError
    from core.security import SECRET_KEY, ALGORITHM
    from services.user_service import get_user_by_email

    # Authenticate via token query param
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        current_user = get_user_by_email(db, email)
        if not current_user:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    # Verify conversation membership
    convo_uuid = uuid.UUID(conversation_id)
    accessible = chat_service.get_messages(db, convo_uuid, current_user, skip=0, limit=1)
    if accessible is None:
        await websocket.close(code=1008)
        return

    await manager.connect(conversation_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                content = parsed.get("content", "").strip()
            except Exception:
                content = data.strip()

            if not content:
                continue

            msg = chat_service.create_message(db, convo_uuid, current_user, content)
            if msg:
                await manager.broadcast(conversation_id, _message_to_dict(msg))
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)
