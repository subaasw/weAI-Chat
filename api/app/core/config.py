import os
from dotenv import load_dotenv

load_dotenv()

def get_env(key: str) -> str:
    return os.environ.get(key) or ""

GEMINI_API_KEY = get_env("GEMINI_API_KEY")
JWT_SECRET_KEY = get_env("JWT_SECRET_KEY")
APP_URL = get_env("APP_URL")

# DB Config
DB_NAME=get_env("DB_NAME")
DB_USER=get_env("DB_USER")
DB_PASSWORD=get_env("DB_PASSWORD")
HOST=get_env("HOST")

# DB URL
DB_CONFIG = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{HOST}:3306/{DB_NAME}"

# Uploads path
CHUNKS_DIR = "uploads/chunk_uploads"
UPLOAD_DIR = "uploads/docs"
PROCESSED_DIR = "uploads/processed_files"

# VECTOR DB PATH
VECTOR_DB_DIR = "vector_db"
