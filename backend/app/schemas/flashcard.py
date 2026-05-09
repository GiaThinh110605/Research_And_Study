from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

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
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class FlashcardSetBase(BaseModel):
    title: str
    description: Optional[str] = None
    document_id: int

class FlashcardSetCreate(FlashcardSetBase):
    pass

class FlashcardSetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class FlashcardSetOut(FlashcardSetBase):
    id: int
    owner_id: int
    created_at: datetime
    flashcards: List[Flashcard] = []

    model_config = ConfigDict(from_attributes=True)

# Alias for compatibility
FlashcardSet = FlashcardSetOut

class FlashcardBulkCreate(BaseModel):
    set_id: int
    flashcards: List[dict] # [{front, back}, ...]

    clear_existing: Optional[bool] = False
