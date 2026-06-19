from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    sender_first_name: str
    sender_last_name: str
    sender_profile_picture_url: Optional[str] = None
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ParticipantOut(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    profile_picture_url: Optional[str] = None
    title: Optional[str] = None

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: UUID
    company_name: str
    participant_a: ParticipantOut
    participant_b: ParticipantOut
    last_message: Optional[MessageOut] = None
    unread_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
