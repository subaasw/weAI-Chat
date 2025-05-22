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
    UniqueConstraint,
)

def make_short_id() -> str:
    """
    Produce a short hex-timestamp ID.
    """
    return hex(int(time.time()))[2:]

class TimeStampMixin(SQLModel):
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            default=datetime.now(timezone.utc),
            nullable=False,
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            "updated_at",
            default=datetime.now(timezone.utc),
            onupdate=datetime.now(timezone.utc),
        )
    )

class Users(TimeStampMixin, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    email: EmailStr = Field(unique=True, index=True, nullable=False)
    name: str = Field(
        sa_column=Column("full_name", nullable=False, length=200)
    )
    password: str = Field(
        sa_column=Column("password_hash", nullable=False, length=255)
    )

    conversations: List["Conversations"] = Relationship(
        back_populates="owner"
    )

class Conversations(TimeStampMixin, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid3,
        primary_key=True,
        index=True,
        nullable=False,
    )
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    title: Optional[str] = Field(default=None, index=True)

    owner: Optional[Users] = Relationship(
        back_populates="conversations"
    )

    messages: List["ChatMessages"] = Relationship(
        back_populates="conversation"
    )

class Sender(str, Enum):
    user = "user"
    bot = "bot"

class ChatMessages(TimeStampMixin, table=True):
    __tablename__ = "chat_messages"
    __table_args__ = (
        UniqueConstraint("conversation_id", "message_uid"),
    )

    id: str = Field(
        default_factory=make_short_id,
        primary_key=True,
        index=True,
        nullable=False,
    )
    conversation_id: uuid.UUID = Field(
        foreign_key="conversations.id", nullable=False
    )
    sender: Sender = Field(nullable=False)
    content: str = Field(nullable=False)

    conversation: Optional[Conversations] = Relationship(
        back_populates="messages"
    ) 
