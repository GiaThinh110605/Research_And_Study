from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.summary import Summary
from app.models.mindmap import Mindmap
from app.models.flashcard import Flashcard
from app.schemas.ai import AIRequest, SummaryOut, MindmapOut, FlashcardGenerateRequest

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

    # Mock AI generation
    summary_content = f"Tóm tắt cho tài liệu '{document.title}':\n\nĐây là một tài liệu quan trọng về {document.subject or 'chủ đề này'}. Nội dung tập trung vào các khái niệm cốt lõi và cung cấp cái nhìn chi tiết về các vấn đề liên quan. AI đã phân tích và thấy rằng các điểm chính bao gồm: 1. Khái niệm cơ bản, 2. Phương pháp thực hiện, 3. Kết luận và định hướng tương lai."
    
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
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Mock AI generation of flashcards
    num_cards = payload.count or 5
    flashcards_data = []
    for i in range(num_cards):
        flashcard_data = {
            "front": f"Câu hỏi {i+1} về {document.title}?",
            "back": f"Đáp án {i+1} chi tiết cho câu hỏi này.",
            "difficulty": "medium"
        }
        flashcards_data.append(flashcard_data)
    
    return {
        "message": f"Generated {num_cards} flashcards for document '{document.title}'",
        "flashcards": flashcards_data
    }
