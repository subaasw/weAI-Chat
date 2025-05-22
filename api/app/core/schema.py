from typing import Optional
from pydantic import BaseModel

class UserLoginModel(BaseModel):
    email: str
    password: str

class UserRegisterModel(BaseModel):
    email: str
    fullName: str
    password: str
    confirmPassword: str

class UserUpdateProfile(BaseModel):
    email: Optional[str] = None
    fullname: Optional[str] = None

