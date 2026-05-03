from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.student_grade import StudentGrade
from app.models.test_result import TestResult
from app.models.test import Test
from app.models.user import User

router = APIRouter()

class GradeBase(BaseModel):
    subject_name: str
    score: float
    credits: int = 1
    semester: Optional[str] = None
    source_type: str = "manual"

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    subject_name: Optional[str] = None
    score: Optional[float] = None
    credits: Optional[int] = None
    semester: Optional[str] = None

class GradeOut(GradeBase):
    id: int
    student_id: int
    test_id: Optional[int] = None
    created_at: datetime

    class Config:
        orm_mode = True

@router.get("/", response_model=List[GradeOut])
def list_grades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all grades for the current student.
    """
    return db.query(StudentGrade).filter(StudentGrade.student_id == current_user.id).all()

@router.post("/sync", response_model=List[GradeOut])
def sync_grades_from_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Automatically create/update StudentGrade entries from TestResult data.
    """
    # Get all test results for the user
    results = db.query(TestResult).filter(TestResult.student_id == current_user.id).all()
    
    synced_grades = []
    for res in results:
        test = db.query(Test).filter(Test.id == res.test_id).first()
        if not test:
            continue
            
        # Check if grade already exists for this test
        existing_grade = db.query(StudentGrade).filter(
            StudentGrade.student_id == current_user.id,
            StudentGrade.test_id == test.id
        ).first()
        
        if existing_grade:
            existing_grade.score = res.score
            existing_grade.subject_name = test.subject or test.title
            db.add(existing_grade)
            synced_grades.append(existing_grade)
        else:
            new_grade = StudentGrade(
                student_id=current_user.id,
                subject_name=test.subject or test.title,
                score=res.score,
                credits=3, # Default credits for tests
                test_id=test.id,
                source_type="test"
            )
            db.add(new_grade)
            synced_grades.append(new_grade)
            
    db.commit()
    return synced_grades

@router.post("/", response_model=GradeOut)
def create_grade(
    payload: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Manually add a grade entry.
    """
    grade = StudentGrade(
        student_id=current_user.id,
        **payload.dict()
    )
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade

@router.put("/{grade_id}", response_model=GradeOut)
def update_grade(
    grade_id: int,
    payload: GradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a grade entry.
    """
    grade = db.query(StudentGrade).filter(
        StudentGrade.id == grade_id, 
        StudentGrade.student_id == current_user.id
    ).first()
    
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
        
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(grade, key, value)
        
    db.commit()
    db.refresh(grade)
    return grade

@router.delete("/{grade_id}")
def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a grade entry.
    """
    grade = db.query(StudentGrade).filter(
        StudentGrade.id == grade_id, 
        StudentGrade.student_id == current_user.id
    ).first()
    
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
        
    db.delete(grade)
    db.commit()
    return {"message": "Grade deleted successfully"}
