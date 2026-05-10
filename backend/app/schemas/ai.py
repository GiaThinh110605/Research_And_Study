from datetime import datetime
from typing import Any, List, Optional, Dict
from pydantic import BaseModel, ConfigDict

class AIRequest(BaseModel):
    prompt: Optional[str] = None

class SummaryOut(BaseModel):
    id: int
    document_id: int
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MindmapOut(BaseModel):
    id: int
    document_id: int
    content: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlashcardGenerateRequest(BaseModel):
    count: Optional[int] = 5

class FlashcardOut(BaseModel):
    id: int
    document_id: int
    front: str
    back: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIAskRequest(BaseModel):
    question: str

class AIAskResponse(BaseModel):
    answer: str
