from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, Request, status 
from sqlmodel import Session, select

from core.db import get_session
from helpers.cookie import CookieManager
from core.db.models import Users
from core.schema import UserUpdateProfile

user_router = APIRouter(prefix="/user")
SessionDep = Annotated[Session, Depends(get_session)]
cookieManager = CookieManager()

@user_router.put("/profile", response_model=Users)
async def update_profile(
    payload: UserUpdateProfile,
    request: Request,
    session: SessionDep,
):
    uctx = request.state.user

    statement = select(Users).where(Users.id == uctx.id)
    user_record = session.exec(statement).one_or_none()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if payload.email and payload.email != user_record.email:
        dup_stmt = select(Users).where(Users.email == payload.email)
        existing = session.exec(dup_stmt).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Email already exists",
            )
        user_record.email = payload.email

    if payload.fullname is not None:
        user_record.name = payload.fullname

    session.add(user_record)
    session.commit()
    session.refresh(user_record)

    if hasattr(user_record, "password"):
        delattr(user_record, "password")

    return user_record

@user_router.get("/me")
async def current_user(request: Request):
    user = request.state.user

    del user.password
    return user

@user_router.delete("/logout")
async def user_logout(response: Response):
    cookieManager.remove_cookie(response)
    return {"msg": "logout successfully"}
