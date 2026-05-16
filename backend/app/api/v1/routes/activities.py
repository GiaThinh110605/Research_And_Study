from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any
from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.user import User
from app.models.document import Document
from app.models.test_result import TestResult
from app.models.discussion import Discussion
from app.models.test import Test

router = APIRouter()

@router.get("/me/activities")
def get_my_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    activities = []
    
    # 1. Test results
    results = db.query(TestResult).filter(TestResult.student_id == current_user.id).order_by(TestResult.created_at.desc()).limit(5).all()
    for r in results:
        test = db.query(Test).filter(Test.id == r.test_id).first()
        test_title = test.title if test else "Bài thi đã xóa"
        activities.append({
            "type": "test",
            "title": f"Hoàn thành bài thi {test_title}",
            "description": f"Điểm: {r.score}/10",
            "created_at": r.created_at
        })
        
    # 2. Documents
    docs = db.query(Document).filter(Document.uploader_id == current_user.id).order_by(Document.created_at.desc()).limit(5).all()
    for d in docs:
        activities.append({
            "type": "document",
            "title": f"Tải lên tài liệu \"{d.title}\"",
            "description": f"{d.file_type.upper() if d.file_type else 'FILE'}",
            "created_at": d.created_at
        })

    # 3. Tests Created (for Lecturers)
    tests = db.query(Test).filter(Test.creator_id == current_user.id).order_by(Test.created_at.desc()).limit(5).all()
    for t in tests:
        activities.append({
            "type": "test_created",
            "title": f"Tạo bài kiểm tra \"{t.title}\"",
            "description": f"{len(t.questions) if t.questions else 0} câu hỏi",
            "created_at": t.created_at
        })
        
    # 3. Discussions
    discs = db.query(Discussion).filter(Discussion.user_id == current_user.id).order_by(Discussion.created_at.desc()).limit(5).all()
    for d in discs:
        doc = db.query(Document).filter(Document.id == d.document_id).first()
        doc_title = doc.title if doc else "Tài liệu đã xóa"
        activities.append({
            "type": "discussion",
            "title": f"Bình luận trong tài liệu \"{doc_title}\"",
            "description": d.content[:50] + ("..." if len(d.content) > 50 else ""),
            "created_at": d.created_at
        })
        
    # Sort and limit
    activities.sort(key=lambda x: x["created_at"], reverse=True)
    return activities[:10]
