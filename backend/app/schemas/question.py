from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuestionBase(BaseModel):
    document_id: int
    content: str
    answer: Optional[str] = None

class QuestionCreate(QuestionBase):
    context: Optional[str] = None

class QuestionUpdate(BaseModel):
    answer: str

class QuestionOut(QuestionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
