from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.user import User
from app.models.document import Document
from app.models.highlight import Highlight
from app.schemas.highlight import HighlightCreate, HighlightUpdate, HighlightOut

router = APIRouter()

@router.post("/", response_model=HighlightOut, status_code=status.HTTP_201_CREATED)
def create_highlight(
    highlight_in: HighlightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == highlight_in.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")
        
    db_highlight = Highlight(
        document_id=highlight_in.document_id,
        user_id=current_user.id,
        text_content=highlight_in.text_content,
        color=highlight_in.color,
        note=highlight_in.note
    )
    db.add(db_highlight)
    db.commit()
    db.refresh(db_highlight)
    return db_highlight

@router.get("/", response_model=List[HighlightOut])
def list_highlights(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Highlight).filter(
        Highlight.document_id == document_id,
        Highlight.user_id == current_user.id
    ).order_by(Highlight.created_at.desc()).all()

@router.put("/{highlight_id}", response_model=HighlightOut)
def update_highlight(
    highlight_id: int,
    highlight_in: HighlightUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_highlight = db.query(Highlight).filter(
        Highlight.id == highlight_id,
        Highlight.user_id == current_user.id
    ).first()
    if not db_highlight:
        raise HTTPException(status_code=404, detail="Không tìm thấy highlight")
        
    if highlight_in.color is not None:
        db_highlight.color = highlight_in.color
    if highlight_in.note is not None:
        db_highlight.note = highlight_in.note
    if highlight_in.page_number is not None:
        db_highlight.page_number = highlight_in.page_number
        
    db.commit()
    db.refresh(db_highlight)
    return db_highlight

@router.delete("/{highlight_id}")
def delete_highlight(
    highlight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_highlight = db.query(Highlight).filter(
        Highlight.id == highlight_id,
        Highlight.user_id == current_user.id
    ).first()
    if not db_highlight:
        raise HTTPException(status_code=404, detail="Không tìm thấy highlight")
        
    db.delete(db_highlight)
    db.commit()
    return {"message": "Đã xóa highlight"}
