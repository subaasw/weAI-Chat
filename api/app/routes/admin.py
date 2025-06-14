import os
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse 
from sqlmodel import Session, delete, select, func

from core.db import get_session
from core.db.models import (TrainingDocs, TrainingWebsite, Users, Conversations, ChatMessages, TrainingStatus, UserType)
from core.schema import TrainingDocsModel, TrainingWebsiteModel, AdminChatTesting
from core.config import UPLOAD_DIR, PROCESSED_DIR
from services.markdown_converter import convert_to_markdown
from services.rag.retriever import ChromaDBManager
from services.crawler import crawl_website
from services.chat_with_gemini import chat_with_gemini_stream

admin_router = APIRouter(prefix="/admin")

cromadb = ChromaDBManager()
SessionDep = Annotated[Session, Depends(get_session)]

@admin_router.post("/train/docs")
async def training_documents(doc: TrainingDocsModel, session: SessionDep):
    upload_file_path = UPLOAD_DIR + f"/{doc.filename}"
    if not os.path.exists(upload_file_path):
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="File not found!")
    
    content = convert_to_markdown(upload_file_path)
    doc = TrainingDocs(mime_type=doc.mime_type, status=TrainingStatus.completed, size=doc.size, file_name=doc.filename, character_count=len(content))

    session.add(doc)
    session.commit()
    session.refresh(doc)

    with open(f"{PROCESSED_DIR}/{str(doc.id)}.md", "w") as file:
        file.write(content)
    file.close()

    cromadb.upsert(
        documents=[content],
        documentId=str(doc.id),
    )

    return doc

@admin_router.get("/train/docs")
async def get_docs(session: SessionDep):
    docs = session.exec(select(TrainingDocs)).fetchall()

    return docs

@admin_router.delete("/train/docs/{docId}")
async def remove_doc(docId: str, session: SessionDep):
    cromadb.delete([docId])

    statement = select(TrainingDocs).where(TrainingDocs.id == uuid.UUID(docId))
    doc = session.exec(statement).one_or_none()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found!")
    
    upload_file_path = UPLOAD_DIR + f"/{doc.file_name}"
    processed_file_path = f"{PROCESSED_DIR}/{docId}.md"

    if os.path.exists(upload_file_path):
        os.remove(upload_file_path)

    if os.path.exists(processed_file_path):
        os.remove(processed_file_path)

    session.delete(doc)
    session.commit()

    return {"success": True, "message": "successfully removed!"}

@admin_router.post("/train/websites")
async def training_website(website: TrainingWebsiteModel, session: SessionDep):
    statement = select(TrainingWebsite).where(TrainingWebsite.url == website.url)
    existsing = session.exec(statement).one_or_none()

    if existsing:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="website already crawled")
    
    websites = await crawl_website(website.url)

    main_website = TrainingWebsite(url=website.url, status=TrainingStatus.completed, character_count=len(websites[0]['content']))
    session.add(main_website)
    session.commit()
    session.refresh(main_website)

    with open(f"{PROCESSED_DIR}/{str(main_website.id)}.md", "w") as file:
        file.write(websites[0]['content'])
    file.close()

    cromadb.upsert(documents=[websites[0]['content']], documentId=str(main_website.id))
    for w in websites[1:]:
        new_website = TrainingWebsite(url=w['link'], parent_id=main_website.id, status=TrainingStatus.completed, character_count=len(w['content']))
        session.add(new_website)
        session.commit()

        cromadb.upsert(documents=[w['content']], documentId=str(new_website.id))
        with open(f"{PROCESSED_DIR}/{str(new_website.id)}.md", "w") as file:
            file.write(w['content'])
        file.close()

    return websites

@admin_router.get("/train/websites")
async def get_websites(session: SessionDep):
    websites = session.exec(select(TrainingWebsite)).fetchall()

    return websites

@admin_router.delete("/train/websites/{websiteId}")
async def remove_website(websiteId: str, session: SessionDep):
    cromadb.delete(ids=[websiteId])

    processed_file_path = f"{PROCESSED_DIR}/{websiteId}.md"
    if os.path.exists(processed_file_path):
        os.remove(processed_file_path)

    statement = delete(TrainingWebsite).where(TrainingWebsite.id == uuid.UUID(websiteId))

    session.exec(statement)
    session.commit()

    return {"success": True, "message": "successfully removed!"}

@admin_router.get("/users")
async def get_users(session: SessionDep):
    users = session.exec(select(Users)).fetchall()

    result = []
    for user in users:
        if user.type == UserType.admin:
            continue

        conv_count_stmt = (
            select(func.count())
            .select_from(Conversations)
            .where(Conversations.user_id == user.id)
        )
        conv_count = session.exec(conv_count_stmt).one()

        msg_count_stmt = (
            select(func.count())
            .select_from(ChatMessages)
            .join(Conversations)
            .where(Conversations.user_id == user.id)
        )
        msg_count = session.exec(msg_count_stmt).one()

        result.append({
            "userId": user.id,
            "name": user.name,
            "email": user.email,
            "totalConversations": conv_count,
            "totalMessages": msg_count,
            "createdAt": user.created_at
        })

    return result

@admin_router.get("/conversations")
async def get_conversations(session: SessionDep):
    conversations = session.exec(
        select(Conversations, Users)
        .join(Users, Users.id == Conversations.user_id)
    ).fetchall()

    results = []
    for conversation, user in conversations:
        message_count_stmt = (
            select(func.count())
            .select_from(ChatMessages)
            .where(ChatMessages.conversation_id == conversation.id)
        )
        total_messages = session.exec(message_count_stmt).one()

        results.append({
            "conversationId": conversation.id,
            "title": conversation.title,
            "createdAt": conversation.created_at,
            "userId": user.id,
            "userName": user.name,
            "totalMessages": total_messages,
        })

    return results

@admin_router.get("/conversations/{conversationId}")
async def get_conversation_messages(conversationId: str, session: SessionDep):
    stmt = (
        select(
            Users.id.label("userId"),
            Users.name,
            Conversations.title,
            ChatMessages.id.label("messageId"),
            ChatMessages.content,
            ChatMessages.created_at,
            ChatMessages.sender
        )
        .join(Users, Conversations.user_id == Users.id)
        .join(ChatMessages, ChatMessages.conversation_id == Conversations.id)
        .where(Conversations.id == uuid.UUID(conversationId))
    )

    results = session.exec(stmt).fetchmany()
    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    conversation_info = {
        "userId": results[0].userId,
        "userName": results[0].name,
        "title": results[0].title,
        "messages": []
    }

    for row in results:
        conversation_info["messages"].append({
            "id": row.messageId,
            "content": row.content,
            "createdAt": row.created_at,
            "sender": row.sender
        })

    return conversation_info

@admin_router.post("/testing")
async def chat_testing(payload: AdminChatTesting):
    return StreamingResponse(
        chat_with_gemini_stream(payload.message, payload.history),
        media_type="text/event-stream"
    )

@admin_router.get("/dashboard")
async def admin_dashboard(session: SessionDep):
    user_count = session.exec(select(func.count()).select_from(Users)).one()
    conversation_count = session.exec(select(func.count()).select_from(Conversations)).one()
    training_url_count = session.exec(select(func.count()).select_from(TrainingWebsite)).one()
    training_doc_count = session.exec(select(func.count()).select_from(TrainingDocs)).one()
    chat_message_count = session.exec(select(func.count()).select_from(ChatMessages)).one()

    result = {
        "users": user_count,
        "conversations": conversation_count,
        "sources": training_url_count + training_doc_count,
        "messages": chat_message_count
    }

    return result
