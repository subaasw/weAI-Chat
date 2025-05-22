import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status 
from sqlmodel import Session, select

from core.schema import CreateChatMessageModel, UserChatMessagesModel
from core.db import get_session
from core.db.models import Conversations, ChatMessages

chat_router = APIRouter(prefix="/chat")

SessionDep = Annotated[Session, Depends(get_session)]

@chat_router.post("/")
async def create_chat(chat: CreateChatMessageModel, session: SessionDep, request: Request):
    user_ctx = request.state.user

    if not chat.message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    conversation = Conversations(user_id=user_ctx.id, title="New Chat")
    session.add(conversation)
    Session.commit()
    session.refresh(conversation)

    if not conversation.id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    userMessage = ChatMessages(conversation_id=conversation.id, sender="user", content=chat.message)

    session.add(userMessage)
    session.commit()
    session.refresh(userMessage)

    return userMessage


@chat_router.post("/{conversationId}")
async def conversation_chat(conversationId: str, chat: UserChatMessagesModel, session: SessionDep, request: Request):
    userctx = request.state.user

    statement = select(Conversations).where(Conversations.id == uuid.UUID(conversationId))
    conversation = session.exec(statement).one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="no conversation found"
        )
    
    if conversation.user_id != userctx.id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="not allowed"
        )
    
    userMessage = ChatMessages(conversation_id=conversation.id, sender="user", content=chat.message)

    session.add(userMessage)
    session.commit()
    session.refresh(userMessage)

    return userMessage
    