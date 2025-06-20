import uuid
from fastapi import Depends, Request, HTTPException, status
from sqlmodel import Session, select

from core.db import get_session
from core.db.models import Users, UserType
from helpers.cookie import CookieManager
from helpers.tokens import verify_token

cookie_manager = CookieManager()

async def autheticate(
    request: Request,
    session: Session = Depends(get_session),
) -> Users:
    token = cookie_manager.read_cookie(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    uid = verify_token(token)
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    stmt = select(Users).where(Users.id == uuid.UUID(uid))
    user = session.exec(stmt).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    request.state.user = user
    return user


def require_admin(
        request: Request,
        session: Session = Depends(get_session)
    ) -> Users:
    token = cookie_manager.read_cookie(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    uid = verify_token(token)
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    stmt = select(Users).where(Users.id == uuid.UUID(uid))
    user = session.exec(stmt).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if user.type != UserType.admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    request.state.user = user
    return user
