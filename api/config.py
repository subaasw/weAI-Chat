import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
SECRET_KEY = os.environ.get("SECRET_KEY")
APP_URL = os.environ.get("APP_URL")
