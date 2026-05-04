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
from app.schemas.ai import FlashcardGenerateRequest
from app.core.gemini import generate_flashcards_from_text
from app.core.file_utils import extract_text_from_file

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

@router.put("/sets/{set_id}", response_model=FlashcardSet)
def update_flashcard_set(
    set_id: int,
    payload: FlashcardSetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    flashcard_set = db.query(FlashcardSetModel).filter(
        FlashcardSetModel.id == set_id, 
        FlashcardSetModel.owner_id == current_user.id
    ).first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(flashcard_set, key, value)
    
    db.commit()
    db.refresh(flashcard_set)
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
        status="new",
        mastery_level=0
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

    if payload.clear_existing:
        db.query(FlashcardModel).filter(FlashcardModel.set_id == payload.set_id).delete()

    new_flashcards = []
    for item in payload.flashcards:
        flashcard = FlashcardModel(
            set_id=payload.set_id,
            front=item.front,
            back=item.back,
            status="new",
            mastery_level=0
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
    payload: FlashcardGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Temporarily disabled as per user request
    return {"message": "AI Generation is temporarily disabled. Please use manual creation.", "data": []}
    
    # document = db.query(Document).filter(Document.id == document_id).first()
    # if not document:
    #     raise HTTPException(status_code=404, detail="Document not found")
    # 
    # # Check access
    # if document.uploader_id != current_user.id and not document.is_public:
    #     raise HTTPException(status_code=403, detail="Access denied")
    #
    # text = extract_text_from_file(document.file_path)
    # if not text:
    #     if document.summary:
    #         text = document.summary.content
    #     else:
    #         raise HTTPException(status_code=400, detail="Could not extract text from document and no summary available.")
    #
    # flashcards_data = generate_flashcards_from_text(text, count=payload.count)
    # return {"message": "Flashcards generated successfully", "data": flashcards_data}

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

    update_data = payload.dict(exclude_unset=True)
    if "status" in update_data or "mastery_level" in update_data:
        flashcard.last_reviewed = datetime.now()
        
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

@router.post("/sets/{set_id}/reset")
def reset_flashcard_set_progress(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Check ownership
    flashcard_set = db.query(FlashcardSetModel).filter(
        FlashcardSetModel.id == set_id, 
        FlashcardSetModel.owner_id == current_user.id
    ).first()
    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    # Reset all flashcards in this set
    db.query(FlashcardModel).filter(FlashcardModel.set_id == set_id).update({
        "mastery_level": 0,
        "status": "new",
        "last_reviewed": None
    })
    db.commit()
    return {"message": "Progress reset successfully"}
