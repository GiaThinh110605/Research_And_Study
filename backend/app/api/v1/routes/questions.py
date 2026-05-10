import logging
from typing import Any, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.question import Question
from app.models.user import User
from app.schemas.question import QuestionCreate, QuestionAnswer, QuestionOut
from app.core.file_utils import extract_text_from_file
from app.core.gemini import ask_question_about_text as gemini_ask
from app.core.grok import ask_question_about_text as grok_ask

logger = logging.getLogger(__name__)

router = APIRouter()


def _ask_ai(document_text: str, question: str) -> Optional[str]:
    """Try Gemini first, then Grok, then return None."""
    answer = gemini_ask(document_text, question)
    if answer:
        logger.info("AI Q&A answered by Gemini")
        return answer

    answer = grok_ask(document_text, question)
    if answer:
        logger.info("AI Q&A answered by Grok")
        return answer

    logger.warning("AI Q&A: both Gemini and Grok failed")
    return None


def _generate_ai_answer_background(question_id: int, document_id: int) -> None:
    """Background task to generate AI answer for a question."""
    from app.models.base import SessionLocal

    db = SessionLocal()
    try:
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            return

        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return

        raw_text = extract_text_from_file(document.file_path) or document.description or ""
        if not raw_text:
            return

        ai_answer = _ask_ai(raw_text, question.content)
        if ai_answer:
            question.ai_answer = ai_answer
            db.commit()
            logger.info("AI answer saved for question %d", question_id)
    except Exception as exc:
        logger.warning("Background AI answer failed for question %d: %s", question_id, exc)
    finally:
        db.close()


@router.get("/", response_model=List[QuestionOut])
def list_questions(
    document_id: int = Query(..., description="Filter by document ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List all questions for a document."""
    questions = (
        db.query(Question)
        .filter(Question.document_id == document_id)
        .order_by(Question.created_at.desc())
        .all()
    )

    result = []
    for q in questions:
        user_data = None
        if q.user:
            user_data = {
                "id": q.user.id,
                "full_name": q.user.full_name,
                "email": q.user.email,
                "role": q.user.role.value if hasattr(q.user.role, "value") else str(q.user.role),
            }

        result.append({
            "id": q.id,
            "document_id": q.document_id,
            "content": q.content,
            "answer": q.answer or q.ai_answer,
            "ai_answer": q.ai_answer,
            "created_at": q.created_at,
            "user": user_data,
        })

    return result


@router.post("/", response_model=QuestionOut)
def create_question(
    payload: QuestionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new question and trigger AI auto-answer in background."""
    document = db.query(Document).filter(Document.id == payload.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    question = Question(
        document_id=payload.document_id,
        user_id=current_user.id,
        content=payload.content.strip(),
    )
    db.add(question)
    db.commit()
    db.refresh(question)

    # Trigger AI auto-answer in background
    background_tasks.add_task(
        _generate_ai_answer_background,
        question.id,
        document.id,
    )

    user_data = {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
    }

    return {
        "id": question.id,
        "document_id": question.document_id,
        "content": question.content,
        "answer": question.answer,
        "ai_answer": question.ai_answer,
        "created_at": question.created_at,
        "user": user_data,
    }


@router.put("/{question_id}", response_model=QuestionOut)
def answer_question(
    question_id: int,
    payload: QuestionAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update the answer for a question (manual answer from lecturer/owner)."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    question.answer = payload.answer.strip()
    db.commit()
    db.refresh(question)

    user_data = None
    if question.user:
        user_data = {
            "id": question.user.id,
            "full_name": question.user.full_name,
            "email": question.user.email,
            "role": question.user.role.value if hasattr(question.user.role, "value") else str(question.user.role),
        }

    return {
        "id": question.id,
        "document_id": question.document_id,
        "content": question.content,
        "answer": question.answer,
        "ai_answer": question.ai_answer,
        "created_at": question.created_at,
        "user": user_data,
    }
