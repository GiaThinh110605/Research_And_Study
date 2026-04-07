from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ---------- Request schemas ----------

class QuestionCreate(BaseModel):
    """Đặt câu hỏi về tài liệu."""
    document_id: int
    content: str


class QuestionUpdate(BaseModel):
    """Cập nhật nội dung câu hỏi hoặc câu trả lời."""
    content: Optional[str] = None
    answer: Optional[str] = None


# ---------- Nested helpers ----------

class QuestionUserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    class Config:
        orm_mode = True


class QuestionDocumentOut(BaseModel):
    id: int
    title: str

    class Config:
        orm_mode = True


# ---------- Response schemas ----------

class QuestionOut(BaseModel):
    id: int
    document_id: int
    asked_by_user_id: int
    content: str
    answer: Optional[str] = None
    created_at: datetime

    # Nested
    user: Optional[QuestionUserOut] = None
    document: Optional[QuestionDocumentOut] = None

    class Config:
        orm_mode = True
