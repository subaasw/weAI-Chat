from typing import Optional, List
from enum import Enum
from datetime import datetime

import uuid
from pydantic import BaseModel

class UserLoginModel(BaseModel):
    email: str
    password: str

class UserRegisterModel(BaseModel):
    email: str
    fullName: str
    password: str
    confirmPassword: str

class UserUpdateProfile(BaseModel):
    email: Optional[str] = None
    fullname: Optional[str] = None

class Role(str, Enum):
    user = "user"
    assistant = "assistant"

class ChatHistoryItem(BaseModel):
    role: Role
    content: str

class CreateChatMessageModel(BaseModel):
    message: str

class UserChatMessagesModel(BaseModel):
    message: str
    history: List[ChatHistoryItem]

class ConversationCreateModel(BaseModel):
    title: Optional[str] = None

class ConversationRenameModel(BaseModel):
    title: str

class ConversationModel(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class ConversationDetailModel(ConversationModel):
    messages: List[CreateChatMessageModel] = []
