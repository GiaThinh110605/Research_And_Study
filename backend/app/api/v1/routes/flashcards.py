from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.flashcard import Flashcard
from app.models.user import User

router = APIRouter()


class FlashcardBase(BaseModel):
	front: str
	back: str


class FlashcardCreate(FlashcardBase):
	document_id: int


class FlashcardUpdate(BaseModel):
	front: Optional[str] = None
	back: Optional[str] = None


class FlashcardOut(FlashcardBase):
	id: int
	document_id: int
	user_id: int
	created_at: datetime

	class Config:
		orm_mode = True


@router.get("/", response_model=List[FlashcardOut])
def list_flashcards(
	document_id: Optional[int] = Query(default=None),
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=200),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	query = db.query(Flashcard).filter(Flashcard.user_id == current_user.id)
	if document_id is not None:
		query = query.filter(Flashcard.document_id == document_id)
	return query.order_by(Flashcard.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=FlashcardOut, status_code=status.HTTP_201_CREATED)
def create_flashcard(
	payload: FlashcardCreate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	document = db.query(Document).filter(Document.id == payload.document_id).first()
	if not document:
		raise HTTPException(status_code=404, detail="Document not found")

	flashcard = Flashcard(
		document_id=payload.document_id,
		user_id=current_user.id,
		front=payload.front,
		back=payload.back,
	)
	db.add(flashcard)
	db.commit()
	db.refresh(flashcard)
	return flashcard


@router.get("/{flashcard_id}", response_model=FlashcardOut)
def get_flashcard(
	flashcard_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	flashcard = (
		db.query(Flashcard)
		.filter(Flashcard.id == flashcard_id, Flashcard.user_id == current_user.id)
		.first()
	)
	if not flashcard:
		raise HTTPException(status_code=404, detail="Flashcard not found")
	return flashcard


@router.put("/{flashcard_id}", response_model=FlashcardOut)
def update_flashcard(
	flashcard_id: int,
	payload: FlashcardUpdate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	flashcard = (
		db.query(Flashcard)
		.filter(Flashcard.id == flashcard_id, Flashcard.user_id == current_user.id)
		.first()
	)
	if not flashcard:
		raise HTTPException(status_code=404, detail="Flashcard not found")

	update_data = payload.dict(exclude_unset=True)
	for key, value in update_data.items():
		setattr(flashcard, key, value)

	db.commit()
	db.refresh(flashcard)
	return flashcard


@router.delete("/{flashcard_id}")
def delete_flashcard(
	flashcard_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	flashcard = (
		db.query(Flashcard)
		.filter(Flashcard.id == flashcard_id, Flashcard.user_id == current_user.id)
		.first()
	)
	if not flashcard:
		raise HTTPException(status_code=404, detail="Flashcard not found")

	db.delete(flashcard)
	db.commit()
	return {"message": "Flashcard deleted successfully"}
