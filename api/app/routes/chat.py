import uuid
from typing import Annotated
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse 
from sqlmodel import Session, select

from core.schema import CreateChatMessageModel, UserChatMessagesModel
from core.db import get_session
from core.db.models import Conversations, ChatMessages
from services.chat_with_gemini import chat_with_gemini_stream

chat_router = APIRouter(prefix="/chat")

SessionDep = Annotated[Session, Depends(get_session)]

def add_chat_messege_to_db(session: Session, conversation_id: str, botResponse: str):
    if not botResponse:
        return

    botMesssage = ChatMessages(conversation_id=conversation_id, sender="bot", content=botResponse)
    session.add(botMesssage)
    session.commit()
    session.refresh(botMesssage)

    return botMesssage

@chat_router.post("")
async def create_chat(chat: CreateChatMessageModel, session: SessionDep, request: Request, background_tasks: BackgroundTasks):
    user_ctx = request.state.user

    if not chat.message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    conversation = Conversations(user_id=user_ctx.id, title="New Chat")
    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    if not conversation.id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    userMessage = ChatMessages(conversation_id=conversation.id, sender="user", content=chat.message)

    session.add(userMessage)
    session.commit()
    session.refresh(userMessage)

    def event_generator():
        full_response = ""
        for chunk in chat_with_gemini_stream(chat.message):
            text = chunk
            full_response += text
            yield text

        background_tasks.add_task(add_chat_messege_to_db, session, conversation.id, full_response)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@chat_router.get("/conversations")
async def fetch_conversations(session: SessionDep, request: Request):
    userctx = request.state.user

    statement = select(Conversations).where(Conversations.user_id == userctx.id)
    conversations = session.exec(statement).fetchmany()

    return conversations

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
