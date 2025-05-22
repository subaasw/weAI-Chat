import jwt
from datetime import datetime, timedelta, timezone

from core.config import JWT_SECRET_KEY

def generate_token(user_id: str) -> str:
    current_time = datetime.now(timezone.utc)
    config = {
        "uid": user_id,
        "exp": current_time + timedelta(hours=24),
        "iat": current_time,
        "nbf": current_time
    }
    token = jwt.encode(payload=config, key=JWT_SECRET_KEY, algorithm="HS256")
    return token

def verify_token(token: str) -> str:
    try:
        decode = jwt.decode(token, key=JWT_SECRET_KEY, algorithms=["HS256"])
        print("decoded", decode, type(decode))
        return str(decode.get("uid", ""))
    except:
        return ""
