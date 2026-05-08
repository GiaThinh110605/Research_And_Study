from datetime import datetime
from typing import Any, List, Optional, Dict
from pydantic import BaseModel

class AIRequest(BaseModel):
    prompt: Optional[str] = None

class SummaryOut(BaseModel):
    id: int
    document_id: int
    content: str
    created_at: datetime

    class Config:
        orm_mode = True

class MindmapOut(BaseModel):
    id: int
    document_id: int
    content: Dict[str, Any]
    created_at: datetime

    class Config:
        orm_mode = True


class FlashcardGenerateRequest(BaseModel):
    count: Optional[int] = 5
