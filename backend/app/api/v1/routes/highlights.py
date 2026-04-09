from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Any, List

from app.models.base import get_db
from app.models.highlight import Highlight
from app.models.document import Document
from app.models.user import User
from app.schemas.highlight import HighlightCreate, HighlightOut
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=HighlightOut, status_code=status.HTTP_201_CREATED)
def create_highlight(
    highlight_in: HighlightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Validate
    document = db.query(Document).filter(Document.id == highlight_in.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Tài liệu không tồn tại")

    db_highlight = Highlight(
        document_id=highlight_in.document_id,
        user_id=current_user.id,
        page_number=highlight_in.page_number,
        text_content=highlight_in.text_content,
        color=highlight_in.color,
        note=highlight_in.note,
    )
    db.add(db_highlight)
    db.commit()
    db.refresh(db_highlight)
    return db_highlight

@router.get("/", response_model=List[HighlightOut])
def list_highlights(
    document_id: int = Query(..., description="Document ID to filter highlights"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    highlights = db.query(Highlight).filter(
        Highlight.document_id == document_id,
        Highlight.user_id == current_user.id
    ).order_by(Highlight.created_at.desc()).all()
    return highlights

@router.delete("/{highlight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_highlight(
    highlight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    highlight = db.query(Highlight).filter(Highlight.id == highlight_id).first()
    if not highlight:
        raise HTTPException(status_code=404, detail="Highlight không tồn tại")
    if highlight.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Không có quyền xóa")

    db.delete(highlight)
    db.commit()
