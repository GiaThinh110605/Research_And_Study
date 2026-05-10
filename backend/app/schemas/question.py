from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class QuestionUserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class QuestionCreate(BaseModel):
    document_id: int
    content: str


class QuestionAnswer(BaseModel):
    answer: str


class QuestionOut(BaseModel):
    id: int
    document_id: int
    content: str
    answer: Optional[str] = None
    ai_answer: Optional[str] = None
    created_at: datetime
    user: Optional[QuestionUserOut] = None

    model_config = ConfigDict(from_attributes=True)
