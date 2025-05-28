from fastapi import APIRouter, Depends

from middleware import autheticate, require_admin
from .auth import auth_router
from .users import user_router
from .chat import chat_router
from .admin import admin_router

routes = APIRouter(prefix="/v1", tags=["v1"])

routes.include_router(auth_router)
routes.include_router(user_router, dependencies=[Depends(autheticate)])
routes.include_router(chat_router, dependencies=[Depends(autheticate)])

routes.include_router(admin_router, dependencies=[Depends(require_admin)])
