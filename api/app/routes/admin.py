import os

from fastapi import APIRouter, File, Form, status, UploadFile
from fastapi.responses import JSONResponse

admin_router = APIRouter(prefix="/admin")
