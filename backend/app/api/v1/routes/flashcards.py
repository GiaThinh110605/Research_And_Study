from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.flashcard import Flashcard, FlashcardSet
from app.models.user import User

router = APIRouter()


class FlashcardBase(BaseModel):
	front: str
	back: str


class FlashcardCreate(FlashcardBase):
	set_id: int


class FlashcardUpdate(BaseModel):
	front: Optional[str] = None
	back: Optional[str] = None


class FlashcardOut(FlashcardBase):
	id: int
	set_id: int
	created_at: datetime
	updated_at: Optional[datetime] = None

	class Config:
		from_attributes = True


@router.get("/", response_model=List[FlashcardOut])
def list_flashcards(
	set_id: Optional[int] = Query(default=None),
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=200),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	if set_id is not None:
		flashcard_set = db.query(FlashcardSet).filter(FlashcardSet.id == set_id, FlashcardSet.owner_id == current_user.id).first()
		if not flashcard_set:
			raise HTTPException(status_code=404, detail="Flashcard set not found")
		query = db.query(Flashcard).filter(Flashcard.set_id == set_id)
	else:
		# Get all flashcards from user's sets
		user_sets = db.query(FlashcardSet).filter(FlashcardSet.owner_id == current_user.id).all()
		set_ids = [s.id for s in user_sets]
		query = db.query(Flashcard).filter(Flashcard.set_id.in_(set_ids))
	return query.order_by(Flashcard.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=FlashcardOut, status_code=status.HTTP_201_CREATED)
def create_flashcard(
	payload: FlashcardCreate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	flashcard_set = db.query(FlashcardSet).filter(FlashcardSet.id == payload.set_id, FlashcardSet.owner_id == current_user.id).first()
	if not flashcard_set:
		raise HTTPException(status_code=404, detail="Flashcard set not found")

	flashcard = Flashcard(
		set_id=payload.set_id,
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
	flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
	if not flashcard:
		raise HTTPException(status_code=404, detail="Flashcard not found")
	
	# Check if user owns the flashcard set
	flashcard_set = db.query(FlashcardSet).filter(FlashcardSet.id == flashcard.set_id, FlashcardSet.owner_id == current_user.id).first()
	if not flashcard_set:
		raise HTTPException(status_code=404, detail="Flashcard not found")
	
	return flashcard


@router.put("/{flashcard_id}", response_model=FlashcardOut)
def update_flashcard(
	flashcard_id: int,
	payload: FlashcardUpdate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
	if not flashcard:
		raise HTTPException(status_code=404, detail="Flashcard not found")
	
	# Check if user owns the flashcard set
	flashcard_set = db.query(FlashcardSet).filter(FlashcardSet.id == flashcard.set_id, FlashcardSet.owner_id == current_user.id).first()
	if not flashcard_set:
		raise HTTPException(status_code=404, detail="Flashcard not found")

	update_data = payload.model_dump(exclude_unset=True)
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
	flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
	if not flashcard:
		raise HTTPException(status_code=404, detail="Flashcard not found")
	
	# Check if user owns the flashcard set
	flashcard_set = db.query(FlashcardSet).filter(FlashcardSet.id == flashcard.set_id, FlashcardSet.owner_id == current_user.id).first()
	if not flashcard_set:
		raise HTTPException(status_code=404, detail="Flashcard not found")

	db.delete(flashcard)
	db.commit()
	return {"message": "Flashcard deleted successfully"}
