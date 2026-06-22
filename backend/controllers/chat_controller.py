import json
import uuid
from typing import List, Optional, Dict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, File, UploadFile, status
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
        # conversation_id -> {user_id: WebSocket}
        self.active: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, conversation_id: str, user_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(conversation_id, {})[user_id] = ws

    def disconnect(self, conversation_id: str, user_id: str):
        convo_map = self.active.get(conversation_id, {})
        convo_map.pop(user_id, None)

    def get_participants(self, conversation_id: str) -> Dict[str, WebSocket]:
        return self.active.get(conversation_id, {})

    async def broadcast(self, conversation_id: str, data: dict, exclude_user_id: str | None = None):
        """Broadcast a payload to all connected participants of a conversation."""
        dead = []
        for uid, ws in list(self.get_participants(conversation_id).items()):
            if uid == exclude_user_id:
                continue
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(uid)
        for uid in dead:
            self.disconnect(conversation_id, uid)

    async def send_to_user(self, conversation_id: str, user_id: str, data: dict):
        """Send a payload to a specific user in a conversation."""
        ws = self.get_participants(conversation_id).get(user_id)
        if ws:
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(conversation_id, user_id)

    def is_online(self, conversation_id: str, user_id: str) -> bool:
        return user_id in self.get_participants(conversation_id)


manager = ConnectionManager()


# ─────────────────────────── Helpers ───────────────────────────

def _message_to_dict(msg: Message) -> dict:
    return {
        "type": "message",
        "id": str(msg.id),
        "conversation_id": str(msg.conversation_id),
        "sender_id": str(msg.sender_id),
        "sender_first_name": msg.sender.first_name,
        "sender_last_name": msg.sender.last_name,
        "sender_profile_picture_url": msg.sender.profile_picture_url,
        "content": msg.content,
        "image_url": msg.image_url,
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
        # Included so the frontend tier-filter can determine SA vs Company Admin vs User
        "role": user.role.value.lower() if user.role else "user",
        "company_name": user.company_name or "",
    }


def _is_super_admin(user: User) -> bool:
    from models.user import UserRole
    return user.role == UserRole.ADMIN and not user.company_name


# ─────────────────────────── REST Endpoints ───────────────────────────

@router.get("/users")
def search_company_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return chattable users.
    - Super Admin: all active users platform-wide (excluding self).
    - Regular Admin/User: same-company members + the Super Admin.
    """
    if not _is_super_admin(current_user) and not current_user.company_name:
        raise HTTPException(status_code=400, detail="You are not assigned to a company.")
    users = chat_service.get_chattable_users(db, current_user, search)
    return [_participant_out(u) for u in users]


@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all conversations for the current user."""
    if not _is_super_admin(current_user) and not current_user.company_name:
        raise HTTPException(status_code=400, detail="You are not assigned to a company.")
    convos = chat_service.get_conversations_for_user(db, current_user)
    return [_build_conversation_out(c, current_user, db) for c in convos]


@router.post("/conversations/{other_user_id}")
def start_or_get_conversation(
    other_user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get or create a conversation. Super admins can chat cross-company."""
    if not _is_super_admin(current_user) and not current_user.company_name:
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
def send_message_rest(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message (REST fallback when WebSocket is unavailable)."""
    if not payload.content.strip() and not payload.image_url:
        raise HTTPException(status_code=422, detail="Message must have content or an image.")
    msg = chat_service.create_message(
        db, conversation_id, current_user,
        content=payload.content,
        image_url=payload.image_url,
    )
    if not msg:
        raise HTTPException(status_code=403, detail="Access denied or conversation not found.")
    return _message_to_dict(msg)


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload an image to Cloudinary and return its URL.
    The frontend then sends this URL in the message payload.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    try:
        from services.video_service import upload_image_to_cloudinary
        url = upload_image_to_cloudinary(file)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# ─────────────────────────── WebSocket ───────────────────────────

@router.websocket("/ws/{conversation_id}")
async def chat_websocket(
    websocket: WebSocket,
    conversation_id: str,
    token: str = Query(...),
):
    """
    WebSocket endpoint for real-time chat.
    Client must pass their JWT as ?token=<jwt> query param.

    NOTE: We do NOT inject `get_db` via Depends here.
    `get_db` is a synchronous generator that holds a DB connection open for the
    entire request lifetime. On a long-lived WebSocket this would exhaust the
    connection pool and deadlock all other HTTP requests (including /auth/login).
    Instead we open short-lived sessions per DB operation.

    Incoming JSON payloads (from client):
      {"type": "message", "content": "hello"}
      {"type": "message", "content": "", "image_url": "https://..."}
      {"type": "typing_start"}
      {"type": "typing_stop"}
      {"type": "read"}

    Outgoing JSON events (to clients):
      {"type": "message", ...message fields...}
      {"type": "typing_start", "user_id": "...", "first_name": "..."}
      {"type": "typing_stop",  "user_id": "..."}
      {"type": "read", "conversation_id": "...", "reader_id": "..."}
    """
    from jose import jwt as jose_jwt, JWTError
    from core.security import SECRET_KEY, ALGORITHM
    from services.user_service import get_user_by_email
    from database.session import SessionLocal

    # ── Authenticate via token query param ──────────────────────────
    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        await websocket.close(code=1008)
        return

    # Open a short-lived session just for auth + membership check
    with SessionLocal() as db:
        current_user = get_user_by_email(db, email)
        if not current_user:
            await websocket.close(code=1008)
            return

        convo_uuid = uuid.UUID(conversation_id)
        convo_obj = db.query(Conversation).filter(Conversation.id == convo_uuid).first()
        if not convo_obj or not chat_service._user_can_access_convo(convo_obj, current_user):
            await websocket.close(code=1008)
            return

        # Capture identity — db session will close after this block
        user_id_str = str(current_user.id)
        first_name = current_user.first_name

    await manager.connect(conversation_id, user_id_str, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
            except Exception:
                parsed = {"type": "message", "content": data.strip()}

            event_type = parsed.get("type", "message")

            # ── Typing indicators ──────────────────────────────────────────
            if event_type == "typing_start":
                await manager.broadcast(conversation_id, {
                    "type": "typing_start",
                    "user_id": user_id_str,
                    "first_name": first_name,
                }, exclude_user_id=user_id_str)
                continue

            if event_type == "typing_stop":
                await manager.broadcast(conversation_id, {
                    "type": "typing_stop",
                    "user_id": user_id_str,
                }, exclude_user_id=user_id_str)
                continue

            # ── Read receipt ───────────────────────────────────────────────
            if event_type == "read":
                with SessionLocal() as db:
                    # Re-fetch user to get a fresh ORM object bound to this session
                    from services.user_service import get_user_by_email
                    reader = get_user_by_email(db, email)
                    if reader:
                        chat_service.mark_messages_read(db, convo_uuid, reader)
                await manager.broadcast(conversation_id, {
                    "type": "read",
                    "conversation_id": conversation_id,
                    "reader_id": user_id_str,
                }, exclude_user_id=user_id_str)
                continue

            # ── Regular message ────────────────────────────────────────────
            content = parsed.get("content", "").strip()
            image_url = parsed.get("image_url", None)

            if not content and not image_url:
                continue

            with SessionLocal() as db:
                sender = get_user_by_email(db, email)
                if sender:
                    msg = chat_service.create_message(
                        db, convo_uuid, sender,
                        content=content,
                        image_url=image_url,
                    )
                    if msg:
                        msg_dict = _message_to_dict(msg)
                        # Broadcast to ALL participants (including sender for ID confirmation)
                        await manager.broadcast(conversation_id, msg_dict)

    except WebSocketDisconnect:
        manager.disconnect(conversation_id, user_id_str)
        # Notify partner that typing stopped
        await manager.broadcast(conversation_id, {
            "type": "typing_stop",
            "user_id": user_id_str,
        })


