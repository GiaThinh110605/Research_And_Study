from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    username: str
    role: UserRole
    student_code: Optional[str] = None
    lecturer_code: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    student_code: Optional[str] = None
    lecturer_code: Optional[str] = None
    is_active: Optional[bool] = None

class UserUpdateByAdmin(UserUpdate):
    role: Optional[UserRole] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class SocialLogin(BaseModel):
    token: str
    client_id: Optional[str] = None
