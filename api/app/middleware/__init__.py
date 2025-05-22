import uuid
from fastapi import Depends, Request, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.db.models import Users
from app.helpers.cookie import CookieManager
from app.helpers.tokens import verify_token

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