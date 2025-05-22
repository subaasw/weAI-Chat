import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel
from sqlmodel import Column, DateTime, Field, SQLModel, String
from pydantic import EmailStr

class TimeStampMixin(BaseModel):
    created_at: Optional[datetime] = Field(
        sa_column=Column(
            DateTime,
            default=datetime.now(timezone.utc),
            nullable=False,
        )
    )

    updated_at: Optional[datetime] = Field(
        sa_column=Column(
            DateTime,
            default=datetime.now(timezone.utc),
            onupdate=datetime.now(timezone.utc),
        )
    )

class Users(SQLModel, TimeStampMixin, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: EmailStr = Field(unique=True, index=True)
    name: str = Field(sa_column=Column("full_name", String(200), nullable=False))
    password: str = Field(
        sa_column=Column("password", String(80), nullable=False)
    )


