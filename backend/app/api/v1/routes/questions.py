from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.user import User
from app.models.document import Document
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionOut
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

def _get_gemini_model():
    api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(settings.GEMINI_MODEL)

@router.post("/", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(
    question_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == question_in.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")
        
    # If the user asks a question with context, we can optionally use AI here
    answer = question_in.answer
    if not answer and question_in.context:
        model = _get_gemini_model()
        if model:
            prompt = f"""
Bạn là trợ lý học tập AI. Dựa trên ngữ cảnh (đoạn highlight) sau đây, hãy trả lời câu hỏi của sinh viên.
Nếu ngữ cảnh không đủ để trả lời, hãy dùng kiến thức chung nhưng phải chính xác. Trả lời bằng tiếng Việt.

Ngữ cảnh:
{question_in.context}

Câu hỏi:
{question_in.content}
"""
            try:
                response = model.generate_content(prompt)
                answer = response.text.strip()
            except Exception as e:
                logger.error(f"Lỗi khi gọi Gemini AI: {e}")
                answer = "Xin lỗi, AI đang gặp sự cố. Vui lòng thử lại sau."
                
    db_question = Question(
        document_id=question_in.document_id,
        user_id=current_user.id,
        content=question_in.content,
        answer=answer
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.get("/", response_model=List[QuestionOut])
def list_questions(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Question).filter(
        Question.document_id == document_id
    ).order_by(Question.created_at.desc()).all()

@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_question = db.query(Question).filter(
        Question.id == question_id,
        Question.user_id == current_user.id
    ).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")
        
    db.delete(db_question)
    db.commit()
    return {"message": "Đã xóa câu hỏi"}
