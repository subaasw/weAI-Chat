from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from middleware.rate_limit import RateLimitingMiddleware
from routes import routes
from core.db import create_db_and_tables
from core.config import APP_URL

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="WeChat AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitingMiddleware)
app.include_router(routes)
