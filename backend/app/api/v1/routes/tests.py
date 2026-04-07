from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api.v1 import deps
from app.models.test import Test
from app.models.test_result import TestResult
from app.schemas.test import TestOut

router = APIRouter()

@router.get("/", response_model=List[TestOut])
def get_tests(db: Session = Depends(deps.get_db)):
    tests = db.query(Test).order_by(Test.created_at.desc()).limit(50).all()
    
    results = []
    for test in tests:
        questions_count = len(test.questions) if test.questions else 0
        
        # Determine status mock logic
        test_res = db.query(TestResult).filter(TestResult.test_id == test.id).first()
        status = "MỚI"
        if test_res:
            if test_res.score and test_res.score >= 5:
                status = "HOÀN THÀNH"
            else:
                status = "ĐANG LÀM"
                
        results.append({
            "id": test.id,
            "title": test.title,
            "type": test.type,
            "created_at": test.created_at,
            "questions_count": questions_count,
            "status": status
        })
        
    return results
