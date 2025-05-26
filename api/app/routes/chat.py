import json
import uuid
from typing import Annotated
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse 
from sqlmodel import Session, select, delete, update

from core.schema import CreateChatMessageModel, ConversationRenameModel, UserChatMessagesModel
from core.db import get_session
from core.db.models import Conversations, ChatMessages
from services.chat_with_gemini import chat_with_gemini, chat_with_gemini_stream

chat_router = APIRouter(prefix="/chat")

SessionDep = Annotated[Session, Depends(get_session)]

def is_valid_uuid(val):
    try:
        return str(uuid.UUID(str(val))) == str(val)
    except:
        return False

def add_chat_messege_to_db(session: Session, conversation_id: str, botResponse: str):
    if not botResponse:
        return

    botMesssage = ChatMessages(conversation_id=conversation_id, sender="assistant", content=botResponse)
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

    def event_generator(conversationId):
        yield json.dumps({"conversationId": str(conversationId)})

        full_response = ""
        for chunk in chat_with_gemini_stream(chat.message):
            text = chunk
            full_response += text
            yield text

        background_tasks.add_task(add_chat_messege_to_db, session, conversation.id, full_response)

    return StreamingResponse(
        event_generator(conversation.id),
        media_type="text/event-stream"
    )

@chat_router.post("/{conversationId}")
async def conversation_chat(conversationId: str, chat: UserChatMessagesModel, session: SessionDep, request: Request, background_tasks: BackgroundTasks):
    if not is_valid_uuid(conversationId):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid conversation id"
        )
    
    userctx = request.state.user
    conversationId = uuid.UUID(conversationId) if conversationId else conversationId

    statement = select(Conversations).where(Conversations.id == conversationId)
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

    if len(chat.history) == 4:
        title = chat_with_gemini(chat.message, chat.history)
        statement = update(Conversations).where(Conversations.id == conversationId).values(title=title)
        session.exec(statement)
        session.commit()    

    def event_generator():
        full_response = ""
        for chunk in chat_with_gemini_stream(chat.message, chat.history):
            full_response += chunk
            yield chunk

        background_tasks.add_task(add_chat_messege_to_db, session, conversationId, full_response)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

@chat_router.patch("/{conversationId}")
async def rename_conversation(conversationId: str, conv: ConversationRenameModel, session: SessionDep, request: Request):
    if not conv.title:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="title not found"
        )
    
    userctx = request.state.user

    statement = select(Conversations).where(Conversations.id == uuid.UUID(conversationId), Conversations.user_id == userctx.id)
    conversation = session.exec(statement).one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="conversations not found"
        )
    
    conversation.title = conv.title

    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    return conversation

@chat_router.get("/conversations")
async def fetch_conversations(session: SessionDep, request: Request):
    userctx = request.state.user

    statement = select(Conversations).where(Conversations.user_id == userctx.id)
    conversations = session.exec(statement).fetchmany()

    return conversations

@chat_router.get("/{conversationId}")
async def conversation_messages(conversationId: str, session: SessionDep, request: Request):
    userctx = request.state.user

    if not is_valid_uuid(conversationId):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid conversation id"
        )

    conversation = session.exec(select(Conversations).where(Conversations.id == uuid.UUID(conversationId))).one_or_none()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="conversations not found"
        )
    
    if conversation.user_id != userctx.id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="unauthorized"
        )

    statement = select(ChatMessages).where(ChatMessages.conversation_id == conversation.id)
    messages = session.exec(statement).fetchmany()

    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="conversations not found"
        )

    return messages

@chat_router.delete("/{conversationId}")
async def remove_conversation(conversationId: str, session: SessionDep, request: Request):
    userctx = request.state.user

    conversation = session.exec(select(Conversations).where(Conversations.id == uuid.UUID(conversationId))).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    if conversation.user_id != userctx.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to do this operation")

    delete_statement = delete(ChatMessages).where(ChatMessages.conversation_id == uuid.UUID(conversationId))
    session.exec(delete_statement)
    session.commit()

    session.delete(conversation)
    session.commit()

    return {"message": "Messages deleted successfully"}
