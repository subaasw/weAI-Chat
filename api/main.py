from fastapi import FastAPI
from routers.auth import auth_router
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from config import SECRET_KEY, APP_URL

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, max_age=3200, same_site="none;Secure")

app.include_router(auth_router, prefix="/v1", tags=["v1"])
