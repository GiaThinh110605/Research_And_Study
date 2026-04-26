from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Any, List

from app.models.base import get_db
from app.models.discussion import Discussion
from app.models.document import Document
from app.models.user import User
from app.schemas.discussion import DiscussionCreate, DiscussionUpdate, DiscussionOut
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=DiscussionOut, status_code=status.HTTP_201_CREATED)
def create_discussion(
    disc_in: DiscussionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Tạo comment hoặc reply.
    - parent_id = null  → comment gốc
    - parent_id = <id>  → reply cho comment đó
    """
    # Kiểm tra tài liệu tồn tại
    document = db.query(Document).filter(Document.id == disc_in.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Tài liệu không tồn tại")

    # Chuẩn hóa: parent_id = 0 coi như comment gốc (null)
    parent_id = disc_in.parent_id if disc_in.parent_id else None

    # Nếu là reply, kiểm tra parent tồn tại
    if parent_id is not None:
        parent = db.query(Discussion).filter(Discussion.id == parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Bình luận gốc không tồn tại")
        # Đảm bảo reply cùng document
        if parent.document_id != disc_in.document_id:
            raise HTTPException(
                status_code=400,
                detail="Reply phải thuộc cùng tài liệu với bình luận gốc",
            )

    db_disc = Discussion(
        document_id=disc_in.document_id,
        user_id=current_user.id,
        parent_id=parent_id,
        content=disc_in.content,
        is_question=disc_in.is_question
    )
    db.add(db_disc)
    db.commit()
    db.refresh(db_disc)

    # Eager-load relationships
    db_disc = (
        db.query(Discussion)
        .options(joinedload(Discussion.user), joinedload(Discussion.replies))
        .filter(Discussion.id == db_disc.id)
        .first()
    )
    return db_disc


@router.get("/", response_model=List[DiscussionOut])
def list_discussions(
    document_id: int = Query(..., description="ID tài liệu (bắt buộc)"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> Any:
    """Lấy danh sách comment gốc (parent_id = null) kèm replies của một tài liệu.
    Replies được trả về lồng nhau trong từng comment gốc.
    """
    discussions = (
        db.query(Discussion)
        .options(
            joinedload(Discussion.user),
            joinedload(Discussion.replies).joinedload(Discussion.user),
        )
        .filter(
            Discussion.document_id == document_id,
            Discussion.parent_id.is_(None),  # Chỉ lấy comment gốc
        )
        .order_by(Discussion.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return discussions


@router.get("/{discussion_id}", response_model=DiscussionOut)
def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """Xem chi tiết một bình luận (kèm replies)."""
    discussion = (
        db.query(Discussion)
        .options(
            joinedload(Discussion.user),
            joinedload(Discussion.replies).joinedload(Discussion.user),
        )
        .filter(Discussion.id == discussion_id)
        .first()
    )
    if not discussion:
        raise HTTPException(status_code=404, detail="Bình luận không tồn tại")
    return discussion


@router.put("/{discussion_id}", response_model=DiscussionOut)
def update_discussion(
    discussion_id: int,
    disc_in: DiscussionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Sửa nội dung bình luận (chỉ chủ nhân mới sửa được)."""
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Bình luận không tồn tại")
    if discussion.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền sửa bình luận này")

    discussion.content = disc_in.content
    db.commit()
    db.refresh(discussion)

    discussion = (
        db.query(Discussion)
        .options(
            joinedload(Discussion.user),
            joinedload(Discussion.replies).joinedload(Discussion.user),
        )
        .filter(Discussion.id == discussion_id)
        .first()
    )
    return discussion


@router.delete("/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Xóa bình luận (chỉ chủ nhân hoặc admin).
    Nếu xóa comment gốc, tất cả replies cũng bị xóa (cascade).
    """
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Bình luận không tồn tại")
    if discussion.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa bình luận này")

    # Xóa tất cả replies trước (tránh FK constraint)
    db.query(Discussion).filter(Discussion.parent_id == discussion_id).delete()
    db.delete(discussion)
    db.commit()
