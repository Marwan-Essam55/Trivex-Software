import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Uuid, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from database.session import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    company_name = Column(String, nullable=False, index=True)
    participant_a_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    participant_b_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    participant_a = relationship("User", foreign_keys=[participant_a_id])
    participant_b = relationship("User", foreign_keys=[participant_b_id])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

    # Ensure each pair only has one conversation per company
    __table_args__ = (
        UniqueConstraint("company_name", "participant_a_id", "participant_b_id", name="uq_conversation_pair"),
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    conversation_id = Column(Uuid, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
