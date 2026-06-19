import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from models.chat import Conversation, Message
from models.user import User


def get_company_users(db: Session, current_user: User, search: Optional[str] = None) -> List[User]:
    """Get all users in the same company, excluding the current user."""
    company = current_user.company_name
    if not company:
        return []

    query = db.query(User).filter(
        User.company_name == company,
        User.id != current_user.id,
        User.is_active == True
    )

    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.email.ilike(search_term),
            )
        )
    return query.order_by(User.first_name).all()


def get_or_create_conversation(db: Session, current_user: User, other_user_id: uuid.UUID) -> Optional[Conversation]:
    """Get or create a 1-on-1 conversation. Enforces same-company isolation."""
    other_user = db.query(User).filter(User.id == other_user_id).first()
    if not other_user:
        return None
    # Company isolation check
    if other_user.company_name != current_user.company_name:
        return None
    if not current_user.company_name:
        return None

    a_id = current_user.id
    b_id = other_user.id

    # Look for existing conversation in either participant order
    convo = db.query(Conversation).filter(
        Conversation.company_name == current_user.company_name,
        or_(
            and_(Conversation.participant_a_id == a_id, Conversation.participant_b_id == b_id),
            and_(Conversation.participant_a_id == b_id, Conversation.participant_b_id == a_id),
        )
    ).first()

    if not convo:
        convo = Conversation(
            company_name=current_user.company_name,
            participant_a_id=a_id,
            participant_b_id=b_id,
        )
        db.add(convo)
        db.commit()
        db.refresh(convo)

    return convo


def get_conversations_for_user(db: Session, current_user: User) -> List[Conversation]:
    """Get all conversations the user participates in."""
    return db.query(Conversation).filter(
        Conversation.company_name == current_user.company_name,
        or_(
            Conversation.participant_a_id == current_user.id,
            Conversation.participant_b_id == current_user.id,
        )
    ).order_by(Conversation.created_at.desc()).all()


def get_messages(db: Session, conversation_id: uuid.UUID, current_user: User, skip: int = 0, limit: int = 50) -> List[Message]:
    """Get messages for a conversation. Verifies membership."""
    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.company_name == current_user.company_name,
        or_(
            Conversation.participant_a_id == current_user.id,
            Conversation.participant_b_id == current_user.id,
        )
    ).first()
    if not convo:
        return []

    return db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).offset(skip).limit(limit).all()


def create_message(db: Session, conversation_id: uuid.UUID, sender: User, content: str) -> Optional[Message]:
    """Create a message in a conversation. Verifies membership."""
    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.company_name == sender.company_name,
        or_(
            Conversation.participant_a_id == sender.id,
            Conversation.participant_b_id == sender.id,
        )
    ).first()
    if not convo:
        return None

    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender.id,
        content=content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def mark_messages_read(db: Session, conversation_id: uuid.UUID, reader: User):
    """Mark all unread messages in a conversation (not sent by reader) as read."""
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != reader.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()


def count_unread(db: Session, conversation_id: uuid.UUID, user: User) -> int:
    return db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != user.id,
        Message.is_read == False,
    ).count()
