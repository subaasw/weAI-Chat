import os
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, delete, select

from core.db import get_session
from core.db.models import TrainingDocs, TrainingWebsite, Users, Conversations, ChatMessages
from core.schema import TrainingDocsModel, TrainingWebsiteModel
from core.config import UPLOAD_DIR, PROCESSED_DIR
from services.markdown_converter import convert_to_markdown
from services.rag.retriever import ChromaDBManager

admin_router = APIRouter(prefix="/admin")

cromadb = ChromaDBManager()
SessionDep = Annotated[Session, Depends(get_session)]

@admin_router.post("/train/docs")
async def training_documents(doc: TrainingDocsModel, session: SessionDep):
    upload_file_path = UPLOAD_DIR + f"/{doc.filename}"
    if not os.path.exists(upload_file_path):
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="File not found!")
    
    content = convert_to_markdown(upload_file_path)
    doc = TrainingDocs(mime_type=doc.mime_type, size=doc.size, file_name=doc.filename, character_count=len(content))

    session.add(doc)
    session.commit()
    session.refresh(doc)

    with open(f"{PROCESSED_DIR}/{str(doc.id)}.md", "w") as file:
        file.write(content)
    file.close()

    cromadb.upsert(
        documents=[content],
        metadatas=[{"filename": doc.file_name}],
        ids=[str(doc.id)],
    )

    return doc

@admin_router.get("/train/docs")
async def get_docs(session: SessionDep):
    docs = session.exec(select(TrainingDocs)).fetchall()

    return docs

@admin_router.delete("/train/docs/{docId}")
async def remove_doc(docId: str, session: SessionDep):
    statement = delete(TrainingDocs).where(TrainingDocs.id == uuid.UUID(docId))

    session.exec(statement)
    session.commit()

    return {"success": True, "message": "successfully removed!"}

@admin_router.post("/train/websites")
async def training_website(webiste: TrainingWebsiteModel, session: SessionDep):
    website = TrainingWebsite(url=webiste.url)

    session.add(website)
    session.commit()
    session.refresh(website)

    return website

@admin_router.get("/train/websites")
async def get_websites(session: SessionDep):
    websites = session.exec(select(TrainingWebsite)).fetchall()

    return websites

@admin_router.delete("/train/website/{websiteId}")
async def remove_website(websiteId: str, session: SessionDep):
    statement = delete(TrainingWebsite).where(TrainingWebsite.id == uuid.UUID(websiteId))

    session.exec(statement)
    session.commit()

    return {"success": True, "message": "successfully removed!"}


@admin_router.get("/users")
async def get_users(session: SessionDep):
    users = session.exec(select(Users)).fetchall()

    return users

@admin_router.get("/conversations")
async def get_conversations(session: SessionDep):
    conversations = session.exec(select(Conversations)).fetchall()

    return conversations

@admin_router.get("/conversations/{conversationId}")
async def get_conversation_messages(conversationId: str, session: SessionDep):
    statement = select(ChatMessages).where(ChatMessages.conversation_id == uuid.UUID(conversationId))
    messages = session.exec(statement).fetchall()

    return messages
