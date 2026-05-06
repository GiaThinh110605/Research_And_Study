from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HighlightBase(BaseModel):
    document_id: int
    text_content: str
    color: Optional[str] = "yellow"
    note: Optional[str] = None
    page_number: Optional[int] = 1

class HighlightCreate(HighlightBase):
    pass

class HighlightUpdate(BaseModel):
    color: Optional[str] = None
    note: Optional[str] = None
    page_number: Optional[int] = None

class HighlightOut(HighlightBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
