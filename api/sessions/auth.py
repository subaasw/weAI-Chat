import uuid
from fastapi import Request, HTTPException, status, Response

SESSION_DB = {}

def generate_session_id() -> str:
    return str(uuid.uuid4())

async def create_session(request: Request, user_id: str) -> str:
    session_id = generate_session_id()
    request.session['session_id'] = session_id
    SESSION_DB[session_id] = user_id
    return session_id

def get_current_user_demo(session_id) -> str:
    return SESSION_DB.get(session_id)

async def get_current_user(request: Request) -> str:
    session_id = request.session.get('session_id')
    if session_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return SESSION_DB.get(session_id)

async def remove_session(response: Response) -> None:
    response.delete_cookie(key="session_id")
