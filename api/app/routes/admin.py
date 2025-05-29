import os
from typing import Annotated

from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import JSONResponse
from sqlmodel import Session

from core.db import get_session
from core.db.models import TrainingDocs
from core.schema import TrainingDocsModel
from core.config import UPLOAD_DIR, PROCESSED_DIR
from services.markdown_converter import convert_to_markdown
from services.rag.retriever import ChromaDBManager

admin_router = APIRouter(prefix="/admin")

SessionDep = Annotated[Session, Depends(get_session)]

@admin_router.post("/train/docs")
async def training_documents(doc: TrainingDocsModel, request: Request, session: SessionDep):
    userctx = request.state.user

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

    cromadb = ChromaDBManager()
    cromadb.upsert(
        documents=[content],
        metadatas=[{"filename": doc.file_name}],
        ids=[str(doc.id)],
    )

    return doc
