from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.test import Test
from app.models.test_result import TestResult
from app.models.user import User, UserRole
from app.models.discussion import Discussion

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

@router.get("/admin")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Ensure user is admin
    if current_user.role != UserRole.ADMIN:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # 1. Overall Stats
    total_users = db.query(User).count()
    total_docs = db.query(Document).count()
    total_tests = db.query(Test).count()
    total_discussions = db.query(Discussion).count()
    
    # 2. User Stats
    active_users = db.query(User).filter(User.is_active == True).count()
    lecturers = db.query(User).filter(User.role == UserRole.LECTURER).count()
    students = db.query(User).filter(User.role == UserRole.STUDENT).count()

    # 3. Recent Activities (Combine latest entries from different tables)
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(3).all()
    recent_docs = db.query(Document).order_by(Document.created_at.desc()).limit(3).all()
    
    activities = []
    for u in recent_users:
        activities.append({
            "id": f"user_{u.id}",
            "user": u.full_name or u.username,
            "action": "vừa đăng ký tài khoản mới",
            "time": u.created_at,
            "type": "Người dùng",
            "status": "MỚI",
            "statusColor": "text-blue-600 bg-blue-50"
        })
    for d in recent_docs:
        activities.append({
            "id": f"doc_{d.id}",
            "user": "Hệ thống", # Could fetch uploader name if needed
            "action": f"tài liệu mới: \"{d.title}\"",
            "time": d.created_at,
            "type": "Tài liệu",
            "status": "MỚI",
            "statusColor": "text-emerald-600 bg-emerald-50"
        })
    
    # Sort activities by time
    activities.sort(key=lambda x: x["time"], reverse=True)

    return {
        "stats": {
            "total_users": total_users,
            "total_documents": total_docs,
            "total_tests": total_tests,
            "total_discussions": total_discussions,
            "active_users": active_users,
            "lecturers_count": lecturers,
            "students_count": students
        },
        "activities": activities[:5]
    }
