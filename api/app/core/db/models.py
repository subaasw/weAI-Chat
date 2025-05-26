import time
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List

import uuid
from pydantic import EmailStr
from sqlmodel import (
    SQLModel,
    Field,
    Column,
    Relationship,
    Text,
    String,
    DateTime
)

def make_short_id() -> str:
    return hex(int(time.time()))[2:]


class TimeStampMixin(SQLModel):
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"nullable": False}
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"nullable": False, "onupdate": datetime.now}
    )

class Users(TimeStampMixin, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, primary_key=True, index=True
    )
    email: EmailStr = Field(unique=True, index=True, nullable=False)
    name: str = Field(sa_column=Column("full_name", String(200), nullable=False))
    password: str = Field(sa_column=Column("password_hash", String(255), nullable=False))

    conversations: List["Conversations"] = Relationship(back_populates="owner")


class Conversations(TimeStampMixin, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, primary_key=True, index=True
    )
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    title: Optional[str] = Field(default=None, index=True)

    owner: Optional[Users] = Relationship(back_populates="conversations")
    messages: List["ChatMessages"] = Relationship(back_populates="conversation")


class Sender(str, Enum):
    user = "user"
    assistant = "assistant"


class ChatMessages(TimeStampMixin, table=True):
    __tablename__ = "chat_messages"

    id: str = Field(default_factory=make_short_id, primary_key=True, index=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", nullable=False)
    sender: Sender = Field(nullable=False)
    content: str = Field(sa_column=Column(Text, nullable=False))

    conversation: Optional[Conversations] = Relationship(back_populates="messages")

