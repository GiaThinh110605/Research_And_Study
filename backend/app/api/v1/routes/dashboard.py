from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.test import Test
from app.models.test_result import TestResult
from app.models.user import User

router = APIRouter()

@router.get("/student")
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # 1. Stats
    total_docs = db.query(Document).count()
    completed_tests = db.query(TestResult).filter(TestResult.student_id == current_user.id).count()
    
    # Calculate GPA (Average score of all results on scale 4)
    results = db.query(TestResult).filter(TestResult.student_id == current_user.id).all()
    
    def to_4_scale(score_10: float) -> float:
        if score_10 >= 9.0: return 4.0
        if score_10 >= 8.5: return 3.8
        if score_10 >= 8.0: return 3.5
        if score_10 >= 7.0: return 3.0
        if score_10 >= 6.5: return 2.5
        if score_10 >= 5.5: return 2.0
        if score_10 >= 5.0: return 1.5
        if score_10 >= 4.0: return 1.0
        return 0.0

    total_score_4 = sum(to_4_scale(float(r.score)) for r in results)
    gpa = round(total_score_4 / len(results), 2) if results else 0.0

    # 2. Recent Documents
    recent_docs = db.query(Document).order_by(Document.created_at.desc()).limit(3).all()
    
    # 3. Upcoming Tests (Tests not yet taken by user)
    taken_test_ids = [r.test_id for r in results]
    upcoming_tests = db.query(Test).filter(~Test.id.in_(taken_test_ids)).order_by(Test.created_at.desc()).limit(2).all()

    return {
        "stats": {
            "total_documents": total_docs,
            "completed_tests": completed_tests,
            "gpa": gpa,
            "progress_percent": round((completed_tests / db.query(Test).count() * 100), 1) if db.query(Test).count() > 0 else 0
        },
        "recent_documents": [
            {
                "id": doc.id,
                "title": doc.title,
                "info": f"{doc.file_type.upper()} • {round(doc.file_size / 1024, 1)} KB • Cập nhật {doc.updated_at.strftime('%d/%m/%Y') if doc.updated_at else doc.created_at.strftime('%d/%m/%Y')}"
            } for doc in recent_docs
        ],
        "upcoming_tests": [
            {
                "id": test.id,
                "title": test.title,
                "subject": test.subject or "Chung",
                "created_at": test.created_at.strftime('%d/%m/%Y')
            } for test in upcoming_tests
        ]
    }
