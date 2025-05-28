import os, mimetypes, time
from pathlib import Path

from fastapi import APIRouter, File, Form, status, UploadFile
from fastapi.responses import JSONResponse

from services.markdown_converter import convert_to_markdown

CHUNKS_DIR = "uploads/chunk_uploads"
Path(CHUNKS_DIR).mkdir(exist_ok=True)

UPLOAD_DIR = "uploads/docs"
Path(UPLOAD_DIR).mkdir(exist_ok=True)

PROCESSED_DIR = "uploads/processed_files"
Path(PROCESSED_DIR).mkdir(exist_ok=True)

upload_router = APIRouter()

def rename_file(path_str: str) -> str:
    path = Path(path_str)

    if not path.is_file():
        raise FileNotFoundError("File not found")

    new_name = f"{path.stem.replace(' ', '_')}_{int(time.time())}{path.suffix}"
    new_path = path.parent / new_name

    path.rename(new_path)
    return str(new_path)

@upload_router.post("/upload/files")
async def upload_chunk_files(
    file: UploadFile = File(...),
    name: str = Form(...),
    chunk_number: int = Form(...),
    total_chunks: int = Form(...)
):
    isLast = (int(chunk_number)) == int(
        total_chunks
    )

    file_name = f"{name}_{chunk_number}"
    chunk_path = f"{Path(CHUNKS_DIR)}/{file_name}"

    with open(chunk_path, "wb") as buffer:
        buffer.write(await file.read())
    buffer.close()

    if isLast:
        upload_path = f"{Path(UPLOAD_DIR)}/{name}"
        with open(upload_path, "wb") as buffer:
            chunk = 1
            while chunk <= total_chunks:
                chunk_file = f"{Path(CHUNKS_DIR)}/{name}_{chunk}"
                with open(chunk_file, "rb") as infile:
                    buffer.write(infile.read())
                    infile.close()
                os.remove(chunk_file)
                chunk += 1
        buffer.close()

        mime_type, _ = mimetypes.guess_type(upload_path)

        return JSONResponse(
            {
                "success": True, 
                "isComplete": True, 
                "size": os.path.getsize(upload_path), 
                "file_name": rename_file(upload_path), 
                "mime_type": mime_type,
                "message": "File Uploaded"
            }, 
            status_code=status.HTTP_200_OK
        )

    return JSONResponse(
        {"success": True, "isComplete": False, "message": "Chunk Uploaded"}, status_code=status.HTTP_200_OK
    )