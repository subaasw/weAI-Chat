from fastapi import APIRouter, Depends

from .auth import auth_router
from .users import user_router
from app.middleware import autheticate

routes = APIRouter(prefix="/v1", tags=["v1"])

routes.include_router(auth_router)
routes.include_router(user_router, dependencies=[Depends(autheticate)])
