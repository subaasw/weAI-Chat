import csv
import time

from fastapi import APIRouter, status, Response, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from sessions.auth import create_session, remove_session
from services.chat_with_gemini import chat_with_gemini_stream

auth_router = APIRouter()

class UserLoginModel(BaseModel):
    username: str
    password: str

class UserRegisterModel(BaseModel):
    username: str
    password: str
    confirm_password: str

class UserChatModel(BaseModel):
    message: str

@auth_router.post("/login")
async def userLogin(user: UserLoginModel, request: Request, response: Response):
    username = user.username
    password = user.password

    user_id: int = None

    with open("./data/users.csv") as file:
        csv_reader = csv.reader(file)

        next(csv_reader)

        for row in csv_reader:
            if not row:
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                    content="Something went wrong!"
                )

            if username == row[1] and password == row[2]:
                user_id = row[0]
                token = await create_session(request, row[0])
                response.set_cookie(
                    key="session_id",
                    value=token,
                    httponly=True,
                    secure=True,
                    samesite="None",
                    max_age=4500
                )
                return {
                    "message": "Login successful", 
                    "token": token,
                    "user_id": user_id, 
                    "username": username
                }

        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            content={"msg":"username or password doesn't match!"}
        )

@auth_router.post("/register")
async def register(registerForm: UserRegisterModel, request: Request, response: Response):
    username = registerForm.username
    password = registerForm.password
    confirm_password = registerForm.confirm_password
    user_id: int = 1

    if not username or not password or not confirm_password:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "All fields are required!"}
        )
    
    if password != confirm_password:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"error": password }
        )
    
    with open("./data/users.csv", "+r") as file:
        reader = csv.reader(file)
        writer = csv.writer(file)
        lastValue = file.readlines()[-1].split(",")

        for user in reader:
            if user[1] == username:
                return JSONResponse(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    content={"error": "user already exits!"}
                )
            
        user_id = int(lastValue[0])+1

        writer.writerow([user_id, username, password])
    
    session = await create_session(request, user_id)

    response.set_cookie(
        'session_id',
        session,
        httponly=True,
        path='/',
        secure=True,
        samesite='None'
    )

    return {
        "message": "register successfully!", 
        "token": session, 
        "user_id": user_id, 
        "username": username
    }

@auth_router.delete("/logout")
async def userLogout(response: Response):
    await remove_session(response)
    return {"msg": "logout successfully"}

# @auth_router.post("/crawer")
# async def crawler

@auth_router.post("/chat")
async def chatBot(request: Request):
    request_data = await request.json()
    message = request_data.get("message", "")

    return StreamingResponse(chat_with_gemini_stream(message), media_type="text/event-stream")
