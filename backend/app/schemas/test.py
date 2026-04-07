from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class TestOut(BaseModel):
    id: int
    title: str
    type: str # Tranh thủ để map với icon bên frontend
    created_at: datetime
    questions_count: int
    status: str # HOÀN THÀNH, ĐANG LÀM, MỚI

    class Config:
        from_attributes = True
