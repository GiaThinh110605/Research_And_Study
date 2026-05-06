from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import logging

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.summary import Summary
from app.models.mindmap import Mindmap
from app.models.flashcard import Flashcard
from app.models.question import Question
from app.schemas.ai import AIRequest, SummaryOut, MindmapOut, FlashcardGenerateRequest
from app.schemas.question import QuestionCreate, QuestionOut
from app.core.file_utils import extract_text_from_file
from app.core.ingestion import generate_summary
from app.core.gemini import query_ai_with_context

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/summary/{document_id}", response_model=SummaryOut)
def generate_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    raw_text = extract_text_from_file(document.file_path) or document.description or ""
    summary_content = generate_summary(raw_text)
    
    existing_summary = db.query(Summary).filter(Summary.document_id == document_id).first()
    if existing_summary:
        existing_summary.content = summary_content
        db.commit()
        db.refresh(existing_summary)
        return existing_summary
    
    summary = Summary(
        document_id=document_id,
        content=summary_content
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary

@router.post("/mindmap/{document_id}", response_model=MindmapOut)
def generate_mindmap(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Mock AI generation of a Mermaid mindmap or JSON structure
    mindmap_data = {
        "root": {
            "text": document.title,
            "children": [
                {"text": "Chương 1: Giới thiệu", "children": [{"text": "1.1 Bối cảnh"}, {"text": "1.2 Mục tiêu"}]},
                {"text": "Chương 2: Nội dung chính", "children": [{"text": "2.1 Lý thuyết"}, {"text": "2.2 Thực hành"}]},
                {"text": "Chương 3: Kết quả", "children": [{"text": "3.1 Đánh giá"}, {"text": "3.2 Đề xuất"}]}
            ]
        }
    }
    
    existing_mindmap = db.query(Mindmap).filter(Mindmap.document_id == document_id).first()
    if existing_mindmap:
        existing_mindmap.data = mindmap_data
        db.commit()
        db.refresh(existing_mindmap)
        return existing_mindmap
    
    mindmap = Mindmap(
        document_id=document_id,
        data=mindmap_data
    )
    db.add(mindmap)
    db.commit()
    db.refresh(mindmap)
    return mindmap

@router.post("/flashcards/generate/{document_id}")
def generate_flashcards(
    document_id: int,
    payload: FlashcardGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    # Temporarily disabled as per user request
    return {"message": "AI Generation is temporarily disabled.", "flashcards": []}
    
    # document = db.query(Document).filter(Document.id == document_id).first()
    # if not document:
    #     raise HTTPException(status_code=404, detail="Document not found")
    # 
    # # Mock AI generation of flashcards
    # num_cards = payload.count or 5
    # flashcards_data = []
    # for i in range(num_cards):
    #     flashcard_data = {
    #         "front": f"Câu hỏi {i+1} về {document.title}?",
    #         "back": f"Đáp án {i+1} chi tiết cho câu hỏi này.",
    #         "difficulty": "medium"
    #     }
    #     flashcards_data.append(flashcard_data)
    # 
    # return {
    #     "message": f"Generated {num_cards} flashcards for document '{document.title}'",
    #     "flashcards": flashcards_data
    # }


@router.post("/qa/{document_id}", response_model=QuestionOut)
def ask_ai_question(
    document_id: int,
    question_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    """
    Ask AI a question about a document with optional context (highlight).
    
    - **document_id**: ID tài liệu
    - **question_in**: {
        "content": "Câu hỏi của bạn",
        "context": "(Optional) Đoạn text bôi đen làm ngữ cảnh"
      }
    """
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Build context from highlight or document description
        context = question_in.context or document.description or "Không có ngữ cảnh"
        
        # Query AI with context
        ai_answer = query_ai_with_context(
            question=question_in.content,
            context=context,
            document_title=document.title
        )
        
        if not ai_answer:
            raise HTTPException(status_code=500, detail="Không thể lấy câu trả lời từ AI")
        
        # Save question and answer to database
        db_question = Question(
            document_id=document_id,
            user_id=current_user.id,
            content=question_in.content,
            answer=ai_answer
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        return db_question
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in ask_ai_question: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi xảy ra khi gọi AI: {str(e)}"
        )


@router.get("/qa/{document_id}", response_model=List[QuestionOut])
def get_document_questions(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    """
    Lấy danh sách tất cả Q&A cho một tài liệu.
    """
    questions = db.query(Question).filter(
        Question.document_id == document_id,
        Question.user_id == current_user.id
    ).order_by(Question.created_at.desc()).all()
    
    return questions
