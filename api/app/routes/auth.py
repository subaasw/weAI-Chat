from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status 
from sqlmodel import Session, select

from core.db import get_session
from core.db.models import Users
from core.schema import UserLoginModel, UserRegisterModel
from helpers.password import create_hash_Password, verify_hash_password
from helpers.tokens import generate_token
from helpers.cookie import CookieManager

auth_router = APIRouter()
SessionDep = Annotated[Session, Depends(get_session)]
cookieManager = CookieManager()

@auth_router.post("/login")
async def user_login(user: UserLoginModel, session: SessionDep, response: Response):
    email = user.email
    password = user.password

    statement = select(Users).where(Users.email == email)
    userInfo = session.exec(statement).first()
    if userInfo and verify_hash_password(password, userInfo.password):
        token = generate_token(str(userInfo.id))
        cookieManager.set_cookie(response, token)

        del userInfo.password
        return userInfo
    
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@auth_router.post("/register")
async def register(user: UserRegisterModel, session: SessionDep, response: Response):
    email = user.email
    name = user.fullName
    password = user.password
    confirm_password = user.confirmPassword

    existing = session.exec(select(Users).where(Users.email == email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="email already registered")
    
    if password != confirm_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password doesnot match")
    
    hash_password = create_hash_Password(password)
    
    new_user = Users(email=email, name=name, password=hash_password)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    token = generate_token(str(new_user.id))
    cookieManager.set_cookie(response, token)

    del new_user.password
    return {"user": new_user, "token": token}
