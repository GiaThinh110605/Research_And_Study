from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class FlashcardBase(BaseModel):
    front: str
    back: str

class FlashcardCreate(FlashcardBase):
    set_id: int

class FlashcardUpdate(BaseModel):
    front: Optional[str] = None
    back: Optional[str] = None
    status: Optional[str] = None
    mastery_level: Optional[int] = None
    last_reviewed: Optional[datetime] = None

class Flashcard(FlashcardBase):
    id: int
    set_id: int
    status: str
    mastery_level: int
    last_reviewed: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class FlashcardSetBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    document_id: Optional[int] = None

class FlashcardSetCreate(FlashcardSetBase):
    pass

class FlashcardSetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None

class FlashcardSet(FlashcardSetBase):
    id: int
    owner_id: int
    is_ai_generated: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    flashcards: List[Flashcard] = []

    class Config:
        orm_mode = True

class FlashcardBulkCreate(BaseModel):
    set_id: int
    flashcards: List[FlashcardBase]
    clear_existing: Optional[bool] = False
