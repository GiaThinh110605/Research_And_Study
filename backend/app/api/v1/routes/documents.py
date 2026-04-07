import os
from pathlib import Path
from typing import Any, List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_current_user_optional
from app.core.config import settings
from app.models.base import get_db
from app.models.document import Document
from app.models.document_share import DocumentShare
from app.models.user import User
from app.schemas.document import (
    DocumentListResponse,
    DocumentOut,
    DocumentShareCreate,
    DocumentShareOut,
    DocumentUpdate,
)

router = APIRouter()

ALLOWED_FILE_TYPES = {
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".txt",
}


def _to_document_out(document: Document) -> DocumentOut:
    return DocumentOut(
        id=document.id,
        title=document.title,
        description=document.description,
        subject=document.subject,
        is_public=bool(document.is_public),
        file_url=document.file_url,
        file_type=document.file_type,
        uploader_id=document.uploader_id,
        uploader_name=document.uploader.full_name if document.uploader else None,
        created_at=document.created_at,
        updated_at=document.updated_at,
    )


def _can_access_document(db: Session, document: Document, current_user: Optional[User]) -> bool:
    if document.is_public:
        return True
    if not current_user:
        return False
    if document.uploader_id == current_user.id:
        return True

    share = (
        db.query(DocumentShare)
        .filter(
            DocumentShare.document_id == document.id,
            DocumentShare.shared_with_user_id == current_user.id,
            DocumentShare.status == "approved",
        )
        .first()
    )
    return share is not None


def _can_edit_document(db: Session, document: Document, current_user: User) -> bool:
    if document.uploader_id == current_user.id:
        return True

    share = (
        db.query(DocumentShare)
        .filter(
            DocumentShare.document_id == document.id,
            DocumentShare.shared_with_user_id == current_user.id,
            DocumentShare.status == "approved",
            DocumentShare.permission == "edit",
        )
        .first()
    )
    return share is not None


@router.get("", response_model=DocumentListResponse)
def list_documents(
    q: Optional[str] = Query(None, description="Search by title or description"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    file_type: Optional[str] = Query(None, description="Filter by file type (pdf/docx/...)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    sort: str = Query("newest", pattern="^(newest|oldest|title_asc)$"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    query = db.query(Document)

    if current_user:
        shared_document_ids = (
            db.query(DocumentShare.document_id)
            .filter(
                DocumentShare.shared_with_user_id == current_user.id,
                DocumentShare.status == "approved",
            )
            .subquery()
        )

        query = query.filter(
            or_(
                Document.is_public.is_(True),
                Document.uploader_id == current_user.id,
                Document.id.in_(select(shared_document_ids.c.document_id)),
            )
        )
    else:
        query = query.filter(Document.is_public.is_(True))

    if q:
        like_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Document.title.ilike(like_pattern),
                Document.description.ilike(like_pattern),
            )
        )

    if subject:
        query = query.filter(Document.subject.ilike(f"%{subject}%"))

    if file_type:
        query = query.filter(Document.file_type.ilike(file_type.upper()))

    if sort == "oldest":
        query = query.order_by(Document.created_at.asc())
    elif sort == "title_asc":
        query = query.order_by(Document.title.asc())
    else:
        query = query.order_by(Document.created_at.desc())

    total = query.count()
    documents = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [_to_document_out(doc) for doc in documents],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not _can_access_document(db, document, current_user):
        raise HTTPException(status_code=403, detail="You do not have permission to view this document")

    return _to_document_out(document)


@router.post("", response_model=DocumentOut)
async def upload_document(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    is_public: bool = Form(True),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    normalized_title = title.strip()
    if not normalized_title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File is larger than {settings.MAX_FILE_SIZE} bytes")

    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    saved_name = f"{uuid4().hex}{extension}"
    saved_path = os.path.join(upload_dir, saved_name)
    with open(saved_path, "wb") as destination:
        destination.write(file_bytes)

    document = Document(
        title=normalized_title,
        description=description,
        subject=subject,
        is_public=is_public,
        file_url=f"/uploads/{saved_name}",
        file_type=extension.replace(".", "").upper(),
        uploader_id=current_user.id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return _to_document_out(document)


@router.put("/{document_id}", response_model=DocumentOut)
def update_document(
    document_id: int,
    payload: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not _can_edit_document(db, document, current_user):
        raise HTTPException(status_code=403, detail="You do not have permission to update this document")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(document, key, value)

    db.commit()
    db.refresh(document)

    return _to_document_out(document)


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the uploader can delete this document")

    db.query(DocumentShare).filter(DocumentShare.document_id == document.id).delete()

    if document.file_url.startswith("/uploads/"):
        file_name = document.file_url.replace("/uploads/", "", 1)
        local_file = os.path.join(settings.UPLOAD_DIR, file_name)
        if os.path.exists(local_file):
            os.remove(local_file)

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}


@router.post("/{document_id}/share", response_model=DocumentShareOut)
def share_document(
    document_id: int,
    payload: DocumentShareCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the uploader can share this document")

    if not payload.shared_with_user_id and not payload.shared_with_email:
        raise HTTPException(status_code=400, detail="Provide shared_with_user_id or shared_with_email")

    target_user = None
    if payload.shared_with_user_id:
        target_user = db.query(User).filter(User.id == payload.shared_with_user_id).first()
    elif payload.shared_with_email:
        target_user = db.query(User).filter(User.email.ilike(str(payload.shared_with_email))).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot share a document with yourself")

    existing = (
        db.query(DocumentShare)
        .filter(
            DocumentShare.document_id == document.id,
            DocumentShare.shared_with_user_id == target_user.id,
        )
        .first()
    )

    if existing:
        existing.permission = payload.permission
        existing.status = "approved"
        share = existing
    else:
        share = DocumentShare(
            document_id=document.id,
            shared_with_user_id=target_user.id,
            permission=payload.permission,
            status="approved",
        )
        db.add(share)

    db.commit()
    db.refresh(share)

    return DocumentShareOut(
        id=share.id,
        document_id=share.document_id,
        shared_with_user_id=share.shared_with_user_id,
        shared_with_email=target_user.email,
        permission=share.permission,
        status=share.status,
        shared_at=share.shared_at,
    )


@router.get("/{document_id}/shares", response_model=List[DocumentShareOut])
def list_document_shares(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the uploader can view shares")

    shares = (
        db.query(DocumentShare)
        .filter(DocumentShare.document_id == document.id)
        .order_by(DocumentShare.shared_at.desc())
        .all()
    )

    results = []
    for share in shares:
        user = db.query(User).filter(User.id == share.shared_with_user_id).first()
        results.append(
            DocumentShareOut(
                id=share.id,
                document_id=share.document_id,
                shared_with_user_id=share.shared_with_user_id,
                shared_with_email=user.email if user else None,
                permission=share.permission,
                status=share.status,
                shared_at=share.shared_at,
            )
        )

    return results
