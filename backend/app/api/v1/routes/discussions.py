from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from typing import Any, List, Optional

from app.models.base import get_db
from app.models.discussion import Discussion
from app.models.document import Document
from app.models.user import User
from app.models.discussion_reaction import DiscussionReaction
from app.schemas.discussion import (
    DiscussionCreate,
    DiscussionUpdate,
    DiscussionOut,
    DiscussionReactionCreate,
    DiscussionReactionStatus,
)
from app.api.v1.deps import get_current_user, get_current_active_admin, get_current_user_optional
from app.models.user import UserRole

router = APIRouter()

ALLOWED_REACTIONS = {"👍", "❤️", "😂", "😮", "😢"}


def _collect_discussion_ids(discussions: List[Discussion]) -> List[int]:
    ids: List[int] = []

    def walk(disc: Discussion) -> None:
        ids.append(disc.id)
        for reply in disc.replies or []:
            walk(reply)

    for disc in discussions:
        walk(disc)

    return ids


def _build_reaction_summary(
    db: Session, discussion_ids: List[int]
) -> dict[int, List[dict[str, int | str]]]:
    summary: dict[int, List[dict[str, int | str]]] = {}
    if not discussion_ids:
        return summary

    rows = (
        db.query(
            DiscussionReaction.discussion_id,
            DiscussionReaction.emoji,
            func.count(DiscussionReaction.id),
        )
        .filter(DiscussionReaction.discussion_id.in_(discussion_ids))
        .group_by(DiscussionReaction.discussion_id, DiscussionReaction.emoji)
        .all()
    )

    for discussion_id, emoji, count in rows:
        summary.setdefault(discussion_id, []).append({"emoji": emoji, "count": count})

    return summary


def _build_my_reactions(
    db: Session, discussion_ids: List[int], current_user: Optional[User]
) -> dict[int, str]:
    if not current_user or not discussion_ids:
        return {}

    rows = (
        db.query(DiscussionReaction.discussion_id, DiscussionReaction.emoji)
        .filter(
            DiscussionReaction.discussion_id.in_(discussion_ids),
            DiscussionReaction.user_id == current_user.id,
        )
        .all()
    )
    return {discussion_id: emoji for discussion_id, emoji in rows}


def _apply_reactions(
    discussions: List[Discussion],
    summary_map: dict[int, List[dict[str, int | str]]],
    my_reaction_map: dict[int, str],
) -> None:
    def apply_to_discussion(discussion: Discussion) -> None:
        discussion.reaction_summary = summary_map.get(discussion.id, [])
        discussion.my_reaction = my_reaction_map.get(discussion.id)
        for reply in discussion.replies or []:
            apply_to_discussion(reply)

    for disc in discussions:
        apply_to_discussion(disc)


def _build_discussion_tree(discussions: List[Discussion]) -> List[Discussion]:
    by_id = {disc.id: disc for disc in discussions}
    for disc in discussions:
        disc.replies = []

    roots: List[Discussion] = []
    for disc in discussions:
        if disc.parent_id and disc.parent_id in by_id:
            by_id[disc.parent_id].replies.append(disc)
        else:
            roots.append(disc)

    def sort_children(node: Discussion) -> None:
        node.replies.sort(key=lambda reply: reply.created_at)
        for child in node.replies:
            sort_children(child)

    for root in roots:
        sort_children(root)

    roots.sort(key=lambda root: root.created_at, reverse=True)
    return roots


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
        .options(
            joinedload(Discussion.user),
            joinedload(Discussion.replies).joinedload(Discussion.user),
            joinedload(Discussion.replies).joinedload(Discussion.replies).joinedload(Discussion.user),
        )
        .filter(Discussion.id == db_disc.id)
        .first()
    )
    _apply_reactions([db_disc], {}, {})
    return db_disc


@router.get("/", response_model=List[DiscussionOut])
def list_discussions(
    document_id: int = Query(..., description="ID tài liệu (bắt buộc)"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Lấy danh sách comment gốc (parent_id = null) kèm replies của một tài liệu.
    Replies được trả về lồng nhau trong từng comment gốc.
    """
    discussions = (
        db.query(Discussion)
        .options(joinedload(Discussion.user))
        .filter(Discussion.document_id == document_id)
        .all()
    )

    discussion_tree = _build_discussion_tree(discussions)
    discussion_tree = discussion_tree[skip:skip + limit]
    discussion_ids = _collect_discussion_ids(discussion_tree)
    summary_map = _build_reaction_summary(db, discussion_ids)
    my_reaction_map = _build_my_reactions(db, discussion_ids, current_user)
    _apply_reactions(discussion_tree, summary_map, my_reaction_map)
    return discussion_tree


@router.get("/{discussion_id}", response_model=DiscussionOut)
def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Xem chi tiết một bình luận (kèm replies)."""
    discussions = (
        db.query(Discussion)
        .options(joinedload(Discussion.user))
        .filter(Discussion.document_id == (
            db.query(Discussion.document_id).filter(Discussion.id == discussion_id).scalar()
        ))
        .all()
    )
    if not discussions:
        raise HTTPException(status_code=404, detail="Bình luận không tồn tại")

    _build_discussion_tree(discussions)
    target = next((item for item in discussions if item.id == discussion_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Bình luận không tồn tại")

    discussion_ids = _collect_discussion_ids([target])
    summary_map = _build_reaction_summary(db, discussion_ids)
    my_reaction_map = _build_my_reactions(db, discussion_ids, current_user)
    _apply_reactions([target], summary_map, my_reaction_map)
    return target


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
            joinedload(Discussion.replies).joinedload(Discussion.replies).joinedload(Discussion.user),
        )
        .filter(Discussion.id == discussion_id)
        .first()
    )
    discussion_ids = _collect_discussion_ids([discussion])
    summary_map = _build_reaction_summary(db, discussion_ids)
    my_reaction_map = _build_my_reactions(db, discussion_ids, current_user)
    _apply_reactions([discussion], summary_map, my_reaction_map)
    return discussion


@router.post("/{discussion_id}/reactions", response_model=DiscussionReactionStatus)
def set_discussion_reaction(
    discussion_id: int,
    reaction_in: DiscussionReactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if reaction_in.emoji not in ALLOWED_REACTIONS:
        raise HTTPException(status_code=400, detail="Reaction không hợp lệ")

    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Bình luận không tồn tại")

    existing = (
        db.query(DiscussionReaction)
        .filter(
            DiscussionReaction.discussion_id == discussion_id,
            DiscussionReaction.user_id == current_user.id,
        )
        .first()
    )

    if existing and existing.emoji == reaction_in.emoji:
        db.delete(existing)
        db.commit()
        my_reaction = None
    else:
        if existing:
            existing.emoji = reaction_in.emoji
        else:
            db.add(
                DiscussionReaction(
                    discussion_id=discussion_id,
                    user_id=current_user.id,
                    emoji=reaction_in.emoji,
                )
            )
        db.commit()
        my_reaction = reaction_in.emoji

    rows = (
        db.query(DiscussionReaction.emoji, func.count(DiscussionReaction.id))
        .filter(DiscussionReaction.discussion_id == discussion_id)
        .group_by(DiscussionReaction.emoji)
        .all()
    )
    reaction_summary = [{"emoji": emoji, "count": count} for emoji, count in rows]

    return {
        "discussion_id": discussion_id,
        "reaction_summary": reaction_summary,
        "my_reaction": my_reaction,
    }


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
    if discussion.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa bình luận này")

    # Xóa tất cả replies trước (tránh FK constraint)
    db.query(Discussion).filter(Discussion.parent_id == discussion_id).delete()
    db.delete(discussion)
    db.commit()

@router.get("/admin/list")
def admin_list_discussions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    """Lấy tất cả bình luận (Admin only)."""
    discussions = (
        db.query(Discussion)
        .options(
            joinedload(Discussion.user),
            joinedload(Discussion.document)
        )
        .order_by(Discussion.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Format for moderation UI
    results = []
    for d in discussions:
        results.append({
            "id": d.id,
            "content": d.content,
            "user_name": d.user.full_name if d.user else "Người dùng ẩn danh",
            "user_avatar": f"https://ui-avatars.com/api/?name={d.user.full_name if d.user else 'A'}&background=random",
            "document_title": d.document.title if d.document else "Tài liệu đã xóa",
            "created_at": d.created_at,
            "is_question": d.is_question,
            "is_reported": False, # Mock for now or add to model later
            "status": "APPROVED" # Mock for now
        })
    return results
