import os
from pathlib import Path
from typing import Any, List, Optional
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import func, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, aliased

from app.api.v1.deps import get_current_active_admin, get_current_user, get_current_user_optional
from app.core.config import settings
from app.models.base import get_db
from app.models.document import Document
from app.models.document_ingestion import DocumentIngestion
from app.models.document_concept import DocumentConcept
from app.models.document_chunk import DocumentChunk
from app.models.document_chunk import DocumentChunk
from app.models.document_share import DocumentShare
from app.models.discussion import Discussion
from app.models.flashcard import Flashcard, FlashcardSet
from app.models.mindmap import Mindmap
from app.models.summary import Summary
from app.models.test import Test
from app.models.test_result import TestResult
from app.models.user import User
from app.schemas.document import (
    AdminDocumentListResponse,
    AdminDocumentOverview,
    AdminDocumentVisibilityUpdate,
    AdminShareModerationItem,
    AdminShareModerationListResponse,
    AdminShareModerationUpdate,
    DocumentListResponse,
    DocumentOut,
    DocumentIngestionOut,
    DocumentShareCreate,
    DocumentShareOut,
    DocumentUpdate,
)
from app.core.ingestion import process_document_ingestion

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
        file_url=document.file_path,
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
            DocumentShare.shared_to_id == current_user.id,
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
            DocumentShare.shared_to_id == current_user.id,
            DocumentShare.status == "approved",
            DocumentShare.permission == "edit",
        )
        .first()
    )
    return share is not None


def _remove_document_file(document: Document) -> None:
    if document.file_path.startswith("/uploads/"):
        file_name = document.file_path.replace("/uploads/", "", 1)
        local_file = os.path.join(settings.UPLOAD_DIR, file_name)
        if os.path.exists(local_file):
            os.remove(local_file)


def _delete_document_dependencies(db: Session, document_id: int) -> None:
    test_ids = [
        test_id
        for (test_id,) in db.query(Test.id)
        .filter(Test.document_id == document_id)
        .all()
    ]

    if test_ids:
        test_result_ids = [
            test_result_id
            for (test_result_id,) in db.query(TestResult.id)
            .filter(TestResult.test_id.in_(test_ids))
            .all()
        ]
        if test_result_ids:
            db.query(TestResult).filter(
                TestResult.id.in_(test_result_ids)
            ).delete(synchronize_session=False)

        db.query(Test).filter(
            Test.id.in_(test_ids)
        ).delete(synchronize_session=False)

    db.query(Discussion).filter(
        Discussion.document_id == document_id,
        Discussion.parent_id.isnot(None),
    ).delete(synchronize_session=False)

    db.query(Discussion).filter(
        Discussion.document_id == document_id,
        Discussion.parent_id.is_(None),
    ).delete(synchronize_session=False)

    flashcard_set_ids = [
        fs_id
        for (fs_id,) in db.query(FlashcardSet.id)
        .filter(FlashcardSet.document_id == document_id)
        .all()
    ]
    if flashcard_set_ids:
        db.query(Flashcard).filter(
            Flashcard.set_id.in_(flashcard_set_ids)
        ).delete(synchronize_session=False)
        db.query(FlashcardSet).filter(
            FlashcardSet.id.in_(flashcard_set_ids)
        ).delete(synchronize_session=False)

    db.query(Summary).filter(
        Summary.document_id == document_id
    ).delete(synchronize_session=False)

    db.query(Mindmap).filter(
        Mindmap.document_id == document_id
    ).delete(synchronize_session=False)

    db.query(DocumentShare).filter(
        DocumentShare.document_id == document_id
    ).delete(synchronize_session=False)


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
        query = query.filter(
            or_(
                Document.is_public.is_(True),
                Document.uploader_id == current_user.id,
                Document.id.in_(
                    db.query(DocumentShare.document_id).filter(
                        DocumentShare.shared_to_id == current_user.id,
                        DocumentShare.status == "approved"
                    )
                ),
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


@router.get("/admin/overview", response_model=AdminDocumentOverview)
def admin_document_overview(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    del current_admin

    total_documents = db.query(Document).count()
    public_documents = db.query(Document).filter(Document.is_public.is_(True)).count()
    private_documents = total_documents - public_documents

    total_shares = db.query(DocumentShare).count()
    pending_shares = db.query(DocumentShare).filter(DocumentShare.status == "pending").count()
    approved_shares = db.query(DocumentShare).filter(DocumentShare.status == "approved").count()
    rejected_shares = db.query(DocumentShare).filter(DocumentShare.status == "rejected").count()

    return {
        "total_documents": total_documents,
        "public_documents": public_documents,
        "private_documents": private_documents,
        "total_shares": total_shares,
        "pending_shares": pending_shares,
        "approved_shares": approved_shares,
        "rejected_shares": rejected_shares,
    }


@router.get("/admin/list", response_model=AdminDocumentListResponse)
def admin_list_documents(
    q: Optional[str] = Query(None, description="Search by title, description, uploader name/email"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    is_public: Optional[bool] = Query(None, description="Filter by visibility"),
    uploader_id: Optional[int] = Query(None, ge=1, description="Filter by uploader id"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    sort: str = Query("newest", pattern="^(newest|oldest|title_asc)$"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    del current_admin

    query = db.query(Document).join(User, Document.uploader_id == User.id)

    if q:
        like_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Document.title.ilike(like_pattern),
                Document.description.ilike(like_pattern),
                User.full_name.ilike(like_pattern),
                User.email.ilike(like_pattern),
            )
        )

    if subject:
        query = query.filter(Document.subject.ilike(f"%{subject}%"))

    if is_public is not None:
        query = query.filter(Document.is_public.is_(is_public))

    if uploader_id:
        query = query.filter(Document.uploader_id == uploader_id)

    if sort == "oldest":
        query = query.order_by(Document.created_at.asc())
    elif sort == "title_asc":
        query = query.order_by(Document.title.asc())
    else:
        query = query.order_by(Document.created_at.desc())

    total = query.count()
    documents = query.offset((page - 1) * page_size).limit(page_size).all()

    share_count_rows = (
        db.query(DocumentShare.document_id, func.count(DocumentShare.id))
        .group_by(DocumentShare.document_id)
        .all()
    )
    share_count_map = {doc_id: count for doc_id, count in share_count_rows}

    status_count_rows = (
        db.query(
            DocumentShare.document_id,
            DocumentShare.status,
            func.count(DocumentShare.id),
        )
        .group_by(DocumentShare.document_id, DocumentShare.status)
        .all()
    )
    status_count_map: dict[int, dict[str, int]] = {}
    for doc_id, status, count in status_count_rows:
        if doc_id not in status_count_map:
            status_count_map[doc_id] = {
                "pending": 0,
                "approved": 0,
                "rejected": 0,
            }
        if status in status_count_map[doc_id]:
            status_count_map[doc_id][status] = int(count)

    items = []
    for document in documents:
        uploader = document.uploader
        status_counts = status_count_map.get(
            document.id,
            {"pending": 0, "approved": 0, "rejected": 0},
        )
        items.append(
            {
                "id": document.id,
                "title": document.title,
                "description": document.description,
                "subject": document.subject,
                "is_public": bool(document.is_public),
                "file_url": document.file_path,
                "file_type": document.file_type,
                "uploader_id": document.uploader_id,
                "uploader_name": uploader.full_name if uploader else None,
                "uploader_email": uploader.email if uploader else None,
                "share_count": int(share_count_map.get(document.id, 0)),
                "pending_share_count": int(status_counts["pending"]),
                "approved_share_count": int(status_counts["approved"]),
                "rejected_share_count": int(status_counts["rejected"]),
                "created_at": document.created_at,
                "updated_at": document.updated_at,
            }
        )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.patch("/admin/{document_id}/visibility", response_model=DocumentOut)
def admin_update_document_visibility(
    document_id: int,
    payload: AdminDocumentVisibilityUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    del current_admin

    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    document.is_public = payload.is_public
    db.commit()
    db.refresh(document)
    return _to_document_out(document)


@router.delete("/admin/{document_id}")
def admin_delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    del current_admin

    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        _delete_document_dependencies(db, document.id)
        _remove_document_file(document)
        db.delete(document)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Delete failed due to related records. Please try again.",
        )

    return {"message": "Document deleted by admin successfully"}


@router.get("/admin/share-moderation", response_model=AdminShareModerationListResponse)
def admin_list_share_moderation(
    q: Optional[str] = Query(None, description="Search by document title or user/email"),
    status: Optional[str] = Query(None, pattern="^(pending|approved|rejected)$"),
    permission: Optional[str] = Query(None, pattern="^(view|edit|comment)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    sort: str = Query("newest", pattern="^(newest|oldest)$"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    del current_admin

    recipient_user = aliased(User)
    uploader_user = aliased(User)

    query = (
        db.query(DocumentShare, Document, recipient_user, uploader_user)
        .join(Document, DocumentShare.document_id == Document.id)
        .outerjoin(recipient_user, recipient_user.id == DocumentShare.shared_with_user_id)
        .outerjoin(uploader_user, uploader_user.id == Document.uploader_id)
    )

    if q:
        like_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Document.title.ilike(like_pattern),
                recipient_user.full_name.ilike(like_pattern),
                recipient_user.email.ilike(like_pattern),
                uploader_user.full_name.ilike(like_pattern),
                uploader_user.email.ilike(like_pattern),
            )
        )

    if status:
        query = query.filter(DocumentShare.status == status)

    if permission:
        query = query.filter(DocumentShare.permission == permission)

    if sort == "oldest":
        query = query.order_by(DocumentShare.shared_at.asc())
    else:
        query = query.order_by(DocumentShare.shared_at.desc())

    total = query.count()
    rows = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for share, document, recipient, uploader in rows:
        items.append(
            {
                "id": share.id,
                "document_id": document.id,
                "document_title": document.title,
                "shared_with_user_id": share.shared_with_user_id,
                "shared_with_name": recipient.full_name if recipient else None,
                "shared_with_email": recipient.email if recipient else None,
                "shared_by_user_id": document.uploader_id,
                "shared_by_name": uploader.full_name if uploader else None,
                "shared_by_email": uploader.email if uploader else None,
                "permission": share.permission,
                "status": share.status,
                "shared_at": share.shared_at,
            }
        )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.patch("/admin/share-moderation/{share_id}", response_model=AdminShareModerationItem)
def admin_update_share_moderation(
    share_id: int,
    payload: AdminShareModerationUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    del current_admin

    share = db.query(DocumentShare).filter(DocumentShare.id == share_id).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share record not found")

    share.status = payload.status
    if payload.permission:
        share.permission = payload.permission

    db.commit()
    db.refresh(share)

    document = db.query(Document).filter(Document.id == share.document_id).first()
    recipient = db.query(User).filter(User.id == share.shared_with_user_id).first()
    uploader = db.query(User).filter(User.id == document.uploader_id).first() if document else None

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": share.id,
        "document_id": document.id,
        "document_title": document.title,
        "shared_with_user_id": share.shared_with_user_id,
        "shared_with_name": recipient.full_name if recipient else None,
        "shared_with_email": recipient.email if recipient else None,
        "shared_by_user_id": document.uploader_id,
        "shared_by_name": uploader.full_name if uploader else None,
        "shared_by_email": uploader.email if uploader else None,
        "permission": share.permission,
        "status": share.status,
        "shared_at": share.shared_at,
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
    background_tasks: BackgroundTasks = None,
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
        file_path=f"/uploads/{saved_name}",
        file_type=extension.replace(".", "").upper(),
        file_size=len(file_bytes),
        uploader_id=current_user.id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    ingestion = db.query(DocumentIngestion).filter(DocumentIngestion.document_id == document.id).first()
    if not ingestion:
        ingestion = DocumentIngestion(
            document_id=document.id,
            status="queued",
            progress=0.0,
            last_event="document_uploaded",
        )
        db.add(ingestion)
        db.commit()

    if background_tasks is not None:
        background_tasks.add_task(process_document_ingestion, document.id)

    return _to_document_out(document)


@router.get("/{document_id}/ingestion", response_model=DocumentIngestionOut)
def get_document_ingestion(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not _can_access_document(db, document, current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    ingestion = db.query(DocumentIngestion).filter(DocumentIngestion.document_id == document_id).first()
    concepts = (
        db.query(DocumentConcept)
        .filter(DocumentConcept.document_id == document_id)
        .order_by(DocumentConcept.score.desc())
        .all()
    )
    concept_payload = [
        {
            "id": concept.id,
            "label": concept.label,
            "category": concept.category,
            "score": float(concept.score or 0.0),
        }
        for concept in concepts
    ]

    summary_content = None
    if document.summary and ingestion and ingestion.status == "completed":
        summary_content = document.summary.content
    elif document.summary and ingestion is None:
        summary_content = document.summary.content
    quiz_questions_count = 0
    if ingestion and ingestion.quiz_test_id:
        quiz = db.query(Test).filter(Test.id == ingestion.quiz_test_id).first()
        quiz_questions_count = len(quiz.questions) if quiz and quiz.questions else 0

    if not ingestion:
        return {
            "document_id": document_id,
            "status": "queued",
            "progress": 0.0,
            "last_event": "document_uploaded",
            "error_message": None,
            "chunks_count": 0,
            "concepts_count": 0,
            "summary_content": summary_content,
            "quiz_test_id": None,
            "quiz_questions_count": quiz_questions_count,
            "started_at": None,
            "completed_at": None,
            "concepts": concept_payload,
        }

    return {
        "document_id": ingestion.document_id,
        "status": ingestion.status,
        "progress": float(ingestion.progress or 0.0),
        "last_event": ingestion.last_event,
        "error_message": ingestion.error_message,
        "chunks_count": ingestion.chunks_count or 0,
        "concepts_count": ingestion.concepts_count or 0,
        "summary_content": summary_content,
        "quiz_test_id": ingestion.quiz_test_id,
        "quiz_questions_count": quiz_questions_count,
        "started_at": ingestion.started_at,
        "completed_at": ingestion.completed_at,
        "concepts": concept_payload,
    }


@router.post("/{document_id}/ingestion/retry", response_model=DocumentIngestionOut)
def retry_document_ingestion(
    document_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not _can_edit_document(db, document, current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    ingestion = db.query(DocumentIngestion).filter(DocumentIngestion.document_id == document_id).first()
    if not ingestion:
        ingestion = DocumentIngestion(document_id=document_id)
        db.add(ingestion)

    ingestion.status = "queued"
    ingestion.progress = 0.0
    ingestion.last_event = "reingest_requested"
    ingestion.error_message = None
    ingestion.chunks_count = 0
    ingestion.concepts_count = 0
    ingestion.quiz_test_id = None
    ingestion.summary_id = None
    ingestion.started_at = None
    ingestion.completed_at = None
    db.commit()

    background_tasks.add_task(process_document_ingestion, document.id)

    return {
        "document_id": ingestion.document_id,
        "status": ingestion.status,
        "progress": float(ingestion.progress or 0.0),
        "last_event": ingestion.last_event,
        "error_message": ingestion.error_message,
        "chunks_count": ingestion.chunks_count or 0,
        "concepts_count": ingestion.concepts_count or 0,
        "summary_content": None,
        "quiz_test_id": ingestion.quiz_test_id,
        "quiz_questions_count": 0,
        "started_at": ingestion.started_at,
        "completed_at": ingestion.completed_at,
        "concepts": [],
    }


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

    try:
        _delete_document_dependencies(db, document.id)
        _remove_document_file(document)
        db.delete(document)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Delete failed due to related records. Please try again.",
        )

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

    target_user = None
    if payload.shared_to_id:
        target_user = db.query(User).filter(User.id == payload.shared_to_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="Target user not found")
        if target_user.id == current_user.id:
            raise HTTPException(status_code=400, detail="You cannot share a document with yourself")

    share = DocumentShare(
        document_id=document.id,
        shared_by_id=current_user.id,
        shared_to_id=target_user.id if target_user else None,
        permission=payload.permission,
        status="approved",  # Auto-approve for now as per simple flow
        message=payload.message,
    )
    db.add(share)
    db.commit()
    db.refresh(share)

    return DocumentShareOut(
        id=share.id,
        document_id=share.document_id,
        shared_by_id=share.shared_by_id,
        shared_to_id=share.shared_to_id,
        shared_to_name=target_user.full_name if target_user else None,
        shared_to_email=target_user.email if target_user else None,
        permission=share.permission,
        status=share.status,
        message=share.message,
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
        target_user = db.query(User).filter(User.id == share.shared_to_id).first() if share.shared_to_id else None
        results.append(
            DocumentShareOut(
                id=share.id,
                document_id=share.document_id,
                shared_by_id=share.shared_by_id,
                shared_to_id=share.shared_to_id,
                shared_to_name=target_user.full_name if target_user else None,
                shared_to_email=target_user.email if target_user else None,
                message=share.message,
                shared_at=share.shared_at,
            )
        )

    return results

@router.get("/{document_id}/chunks")
def get_document_chunks(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")
        
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index).all()
    return [{"id": c.id, "content": c.content, "chunk_index": c.chunk_index} for c in chunks]
