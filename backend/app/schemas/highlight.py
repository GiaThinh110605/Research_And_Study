from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HighlightCreate(BaseModel):
    document_id: int
    page_number: int
    text_content: str
    color: Optional[str] = "yellow"
    note: Optional[str] = None

class HighlightOut(BaseModel):
    id: int
    document_id: int
    user_id: int
    page_number: int
    text_content: str
    color: Optional[str]
    note: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
