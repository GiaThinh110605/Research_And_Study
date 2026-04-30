from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.flashcard import Flashcard as FlashcardModel, FlashcardSet as FlashcardSetModel
from app.models.user import User
from app.schemas.flashcard import (
    Flashcard,
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardSet,
    FlashcardSetCreate,
    FlashcardSetUpdate,
    FlashcardBulkCreate
)

router = APIRouter()

# --- Flashcard Set Endpoints ---

@router.post("/sets/", response_model=FlashcardSet, status_code=status.HTTP_201_CREATED)
def create_flashcard_set(
    payload: FlashcardSetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    flashcard_set = FlashcardSetModel(
        title=payload.title,
        description=payload.description,
        subject=payload.subject,
        document_id=payload.document_id,
        owner_id=current_user.id
    )
    db.add(flashcard_set)
    db.commit()
    db.refresh(flashcard_set)
    return flashcard_set

@router.get("/sets/", response_model=List[FlashcardSet])
def list_flashcard_sets(
    document_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    query = db.query(FlashcardSetModel).filter(FlashcardSetModel.owner_id == current_user.id)
    if document_id:
        query = query.filter(FlashcardSetModel.document_id == document_id)
    return query.order_by(FlashcardSetModel.created_at.desc()).all()

@router.get("/sets/{set_id}", response_model=FlashcardSet)
def get_flashcard_set(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    flashcard_set = db.query(FlashcardSetModel).filter(
        FlashcardSetModel.id == set_id, 
        FlashcardSetModel.owner_id == current_user.id
    ).first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    return flashcard_set

@router.delete("/sets/{set_id}")
def delete_flashcard_set(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    flashcard_set = db.query(FlashcardSetModel).filter(
        FlashcardSetModel.id == set_id, 
        FlashcardSetModel.owner_id == current_user.id
    ).first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    db.delete(flashcard_set)
    db.commit()
    return {"message": "Flashcard set deleted successfully"}

# --- Flashcard Item Endpoints ---

@router.get("/", response_model=List[Flashcard])
def list_flashcards(
    document_id: Optional[int] = Query(default=None),
    set_id: Optional[int] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if set_id is not None:
        flashcard_set = db.query(FlashcardSetModel).filter(
            FlashcardSetModel.id == set_id, 
            FlashcardSetModel.owner_id == current_user.id
        ).first()
        if not flashcard_set:
            raise HTTPException(status_code=404, detail="Flashcard set not found")
        query = db.query(FlashcardModel).filter(FlashcardModel.set_id == set_id)
    elif document_id is not None:
        # Get all flashcards from user's sets associated with this document
        user_sets = db.query(FlashcardSetModel).filter(
            FlashcardSetModel.owner_id == current_user.id,
            FlashcardSetModel.document_id == document_id
        ).all()
        set_ids = [s.id for s in user_sets]
        query = db.query(FlashcardModel).filter(FlashcardModel.set_id.in_(set_ids))
    else:
        # Get all flashcards from all of user's sets
        user_sets = db.query(FlashcardSetModel).filter(FlashcardSetModel.owner_id == current_user.id).all()
        set_ids = [s.id for s in user_sets]
        query = db.query(FlashcardModel).filter(FlashcardModel.set_id.in_(set_ids))
    
    return query.order_by(FlashcardModel.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=Flashcard, status_code=status.HTTP_201_CREATED)
def create_flashcard(
    payload: FlashcardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    flashcard_set = db.query(FlashcardSetModel).filter(
        FlashcardSetModel.id == payload.set_id, 
        FlashcardSetModel.owner_id == current_user.id
    ).first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")

    flashcard = FlashcardModel(
        set_id=payload.set_id,
        front=payload.front,
        back=payload.back,
    )
    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)
    return flashcard

@router.post("/bulk", response_model=List[Flashcard], status_code=status.HTTP_201_CREATED)
def bulk_create_flashcards(
    payload: FlashcardBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    flashcard_set = db.query(FlashcardSetModel).filter(
        FlashcardSetModel.id == payload.set_id, 
        FlashcardSetModel.owner_id == current_user.id
    ).first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")

    new_flashcards = []
    for item in payload.flashcards:
        flashcard = FlashcardModel(
            set_id=payload.set_id,
            front=item.front,
            back=item.back,
        )
        db.add(flashcard)
        new_flashcards.append(flashcard)
    
    db.commit()
    for f in new_flashcards:
        db.refresh(f)
    return new_flashcards

@router.post("/generate")
def generate_flashcards(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Placeholder for Gemini AI integration
    # For now, return an empty list or a message
    return {"message": "AI Generation is currently disabled. Please use manual creation.", "data": []}

@router.put("/{flashcard_id}", response_model=Flashcard)
def update_flashcard(
    flashcard_id: int,
    payload: FlashcardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    flashcard = db.query(FlashcardModel).filter(FlashcardModel.id == flashcard_id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    # Check if user owns the flashcard set
    flashcard_set = db.query(FlashcardSetModel).filter(
        FlashcardSetModel.id == flashcard.set_id, 
        FlashcardSetModel.owner_id == current_user.id
    ).first()
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
    flashcard = db.query(FlashcardModel).filter(FlashcardModel.id == flashcard_id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    # Check if user owns the flashcard set
    flashcard_set = db.query(FlashcardSetModel).filter(
        FlashcardSetModel.id == flashcard.set_id, 
        FlashcardSetModel.owner_id == current_user.id
    ).first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    db.delete(flashcard)
    db.commit()
    return {"message": "Flashcard deleted successfully"}
