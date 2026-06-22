import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from models.chat import Conversation, Message
from models.user import User, UserRole


# ─────────────────────── Super Admin Helpers ───────────────────────

def is_super_admin(user: User) -> bool:
    """Super admin: an ADMIN with no company (the platform-level admin)."""
    return user.role == UserRole.ADMIN and not user.company_name


# ─────────────────────── User Discovery ────────────────────────────

def get_chattable_users(db: Session, current_user: User, search: Optional[str] = None) -> List[User]:
    """
    Strict 3-tier hierarchy:
    ┌────────────────────────────────────────────────────────────────────┐
    │ Tier 1 — Super Admin (ADMIN, no company_name)                     │
    │   Sees: Company Admins ONLY (ADMIN role WITH a company).          │
    │   Does NOT see regular users or other super admins.               │
    ├────────────────────────────────────────────────────────────────────┤
    │ Tier 2 — Company Admin (ADMIN, has company_name)                  │
    │   Sees: All members of own company + Super Admin(s).              │
    ├────────────────────────────────────────────────────────────────────┤
    │ Tier 3 — Regular User (USER role)                                 │
    │   Sees: Own company members ONLY. Super Admin EXCLUDED.           │
    └────────────────────────────────────────────────────────────────────┘
    Self is always excluded from every tier.
    """
    # Base filter shared by all tiers
    base = db.query(User).filter(
        User.id != current_user.id,
        User.is_active == True,  # noqa: E712
    )

    if is_super_admin(current_user):
        # Tier 1: SA sees only Company Admins (ADMIN + has a company_name)
        query = base.filter(
            User.role == UserRole.ADMIN,
            User.company_name != None,  # noqa: E711
        )

    elif current_user.role == UserRole.ADMIN and current_user.company_name:
        # Tier 2: Company Admin sees own company members + Super Admin(s)
        query = base.filter(
            or_(
                # All users in the same company
                User.company_name == current_user.company_name,
                # Super Admin: ADMIN with no company_name
                and_(User.role == UserRole.ADMIN, User.company_name == None),  # noqa: E711
            )
        )

    else:
        # Tier 3: Regular User — own company only, Super Admin strictly excluded
        if not current_user.company_name:
            return []
        query = base.filter(
            User.company_name == current_user.company_name,
        )

    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                User.first_name.ilike(term),
                User.last_name.ilike(term),
                User.email.ilike(term),
            )
        )

    return query.order_by(User.first_name).all()


# Keep old name as alias for backward-compat
def get_company_users(db: Session, current_user: User, search: Optional[str] = None) -> List[User]:
    return get_chattable_users(db, current_user, search)


# ─────────────────────── Conversation CRUD ─────────────────────────

def _company_label(a: User, b: User) -> str:
    """
    Determine the company_name label for a conversation.
    Super-admin conversations get a special sentinel so the
    NOT-NULL constraint is satisfied.
    """
    if a.company_name and b.company_name and a.company_name == b.company_name:
        return a.company_name
    # Cross-company (super-admin involved): use the non-super-admin user's company,
    # or fall back to a sentinel.
    company = a.company_name or b.company_name or "__platform__"
    return company


def _user_can_access_convo(convo: Conversation, user: User) -> bool:
    """Check if user is a participant in the conversation (super-admin bypasses company isolation)."""
    is_participant = (
        str(convo.participant_a_id) == str(user.id) or
        str(convo.participant_b_id) == str(user.id)
    )
    return is_participant


def get_or_create_conversation(db: Session, current_user: User, other_user_id: uuid.UUID) -> Optional[Conversation]:
    """Get or create a 1-on-1 conversation. Super admins can chat cross-company."""
    other_user = db.query(User).filter(User.id == other_user_id, User.is_active == True).first()
    if not other_user:
        return None

    # Access check: either super-admin is involved, or same-company users
    current_is_sa = is_super_admin(current_user)
    other_is_sa = is_super_admin(other_user)

    if not current_is_sa and not other_is_sa:
        # Neither is super admin → must be same company
        if not current_user.company_name or current_user.company_name != other_user.company_name:
            return None

    a_id = current_user.id
    b_id = other_user.id

    # Look for an existing conversation (order-independent)
    convo = db.query(Conversation).filter(
        or_(
            and_(Conversation.participant_a_id == a_id, Conversation.participant_b_id == b_id),
            and_(Conversation.participant_a_id == b_id, Conversation.participant_b_id == a_id),
        )
    ).first()

    if not convo:
        convo = Conversation(
            company_name=_company_label(current_user, other_user),
            participant_a_id=a_id,
            participant_b_id=b_id,
        )
        db.add(convo)
        db.commit()
        db.refresh(convo)

    return convo


def get_conversations_for_user(db: Session, current_user: User) -> List[Conversation]:
    """Get all conversations the user participates in (company-isolated for regular users)."""
    base_filter = or_(
        Conversation.participant_a_id == current_user.id,
        Conversation.participant_b_id == current_user.id,
    )

    if is_super_admin(current_user):
        # Super admin sees ALL conversations they are a participant in
        return (
            db.query(Conversation)
            .filter(base_filter)
            .order_by(Conversation.created_at.desc())
            .all()
        )

    # Regular user: further restrict to their company (or cross-company convos they're in)
    return (
        db.query(Conversation)
        .filter(base_filter)
        .order_by(Conversation.created_at.desc())
        .all()
    )


def get_messages(
    db: Session,
    conversation_id: uuid.UUID,
    current_user: User,
    skip: int = 0,
    limit: int = 50,
) -> List[Message]:
    """Get messages for a conversation. Verifies membership."""
    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id,
    ).first()

    if not convo or not _user_can_access_convo(convo, current_user):
        return []

    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_message(
    db: Session,
    conversation_id: uuid.UUID,
    sender: User,
    content: str,
    image_url: Optional[str] = None,
) -> Optional[Message]:
    """Create a message in a conversation. Verifies membership."""
    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id,
    ).first()

    if not convo or not _user_can_access_convo(convo, sender):
        return None

    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender.id,
        content=content,
        image_url=image_url,
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
        Message.is_read == False,  # noqa: E712
    ).update({"is_read": True})
    db.commit()


def count_unread(db: Session, conversation_id: uuid.UUID, user: User) -> int:
    return db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != user.id,
        Message.is_read == False,  # noqa: E712
    ).count()
