from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Any, List

from app.models.base import get_db
from app.models.question import Question
from app.models.document import Document
from app.models.user import User
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionOut
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(
    question_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Đặt câu hỏi về một tài liệu."""
    # Kiểm tra tài liệu tồn tại
    document = db.query(Document).filter(Document.id == question_in.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Tài liệu không tồn tại")

    db_question = Question(
        document_id=question_in.document_id,
        asked_by_user_id=current_user.id,
        content=question_in.content,
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)

    # Eager-load relationships để trả về đầy đủ
    db_question = (
        db.query(Question)
        .options(joinedload(Question.user), joinedload(Question.document))
        .filter(Question.id == db_question.id)
        .first()
    )
    return db_question


@router.get("/", response_model=List[QuestionOut])
def list_questions(
    document_id: int = Query(None, description="Lọc theo tài liệu"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
) -> Any:
    """Danh sách câu hỏi (có thể lọc theo document_id)."""
    query = db.query(Question).options(
        joinedload(Question.user), joinedload(Question.document)
    )
    if document_id is not None:
        query = query.filter(Question.document_id == document_id)
    questions = (
        query.order_by(Question.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return questions


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """Xem chi tiết một câu hỏi."""
    question = (
        db.query(Question)
        .options(joinedload(Question.user), joinedload(Question.document))
        .filter(Question.id == question_id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Câu hỏi không tồn tại")
    return question


@router.put("/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: int,
    question_in: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Cập nhật câu hỏi hoặc trả lời.
    - content: chỉ người đã hỏi mới được sửa nội dung câu hỏi.
    - answer: bất kỳ ai đăng nhập đều có thể trả lời (ưu tiên giảng viên).
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Câu hỏi không tồn tại")

    # Sửa content: chỉ người hỏi mới được sửa
    if question_in.content is not None:
        if question.asked_by_user_id == current_user.id:
            question.content = question_in.content
        # Nếu không phải người hỏi → bỏ qua field content, không raise 403

    # Trả lời: ai đăng nhập cũng được
    if question_in.answer is not None:
        question.answer = question_in.answer

    db.commit()
    db.refresh(question)

    question = (
        db.query(Question)
        .options(joinedload(Question.user), joinedload(Question.document))
        .filter(Question.id == question_id)
        .first()
    )
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Xóa câu hỏi (chỉ người đã hỏi hoặc admin)."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Câu hỏi không tồn tại")
    if question.asked_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa câu hỏi này")

    db.delete(question)
    db.commit()
