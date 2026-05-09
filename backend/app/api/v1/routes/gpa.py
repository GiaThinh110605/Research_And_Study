from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter()

# New schemas for UC15
class SubjectCalculateRequest(BaseModel):
    credits: int = Field(..., gt=0)
    regular_scores: List[float] = []
    practical_scores: List[float] = []
    midterm_score: float = Field(..., ge=0, le=10)
    final_score: float = Field(..., ge=0, le=10)

class SubjectCalculateResponse(BaseModel):
    score_10: float
    score_4: float
    grade_letter: str
    classification: str
    is_passed: bool

class SemesterSubject(BaseModel):
    name: str
    credits: int = Field(..., gt=0)
    score_10: float = Field(..., ge=0, le=10)
    score_4: Optional[float] = Field(None, ge=0, le=4)

class SemesterCalculateRequest(BaseModel):
    subjects: List[SemesterSubject]

class SemesterCalculateResponse(BaseModel):
    gpa_10: float
    gpa_4: float
    total_credits: int
    classification: str

class CumulativeSemester(BaseModel):
    name: str
    total_credits: int = Field(..., gt=0)
    gpa_10: float = Field(..., ge=0, le=10)
    gpa_4: Optional[float] = Field(None, ge=0, le=4)

class CumulativeCalculateRequest(BaseModel):
    semesters: List[CumulativeSemester]

class CumulativeCalculateResponse(BaseModel):
    cgpa_10: float
    cgpa_4: float
    total_credits: int
    classification: str

# Legacy schemas for LecturerGPAPage
class CourseInput(BaseModel):
    course_name: str
    credits: int
    score_10: float

class LegacyCalculateRequest(BaseModel):
    courses: List[CourseInput]

class LegacyCalculateResponse(BaseModel):
    total_courses: int
    total_credits: int
    gpa_10: float
    gpa_4: float

def convert_10_to_4(score_10: float):
    if score_10 >= 9.0: return 4.0, "A+", "Xuất sắc", True
    if score_10 >= 8.5: return 3.8, "A", "Giỏi", True
    if score_10 >= 8.0: return 3.5, "B+", "Khá", True
    if score_10 >= 7.0: return 3.0, "B", "Khá", True
    if score_10 >= 6.0: return 2.5, "C+", "Trung bình", True
    if score_10 >= 5.5: return 2.0, "C", "Trung bình", True
    if score_10 >= 5.0: return 1.5, "D+", "Trung bình yếu", True
    if score_10 >= 4.0: return 1.0, "D", "Trung bình yếu", True
    return 0.0, "F", "Yếu", False

def get_classification_from_4(score_4: float):
    if score_4 >= 3.6: return "Xuất sắc"
    if score_4 >= 3.2: return "Giỏi"
    if score_4 >= 2.5: return "Khá"
    if score_4 >= 2.0: return "Trung bình"
    return "Yếu"

@router.post("/calculate/subject", response_model=SubjectCalculateResponse)
async def calculate_subject(req: SubjectCalculateRequest):
    # Avg Regular
    valid_regular = [s for s in req.regular_scores if s is not None and 0 <= s <= 10]
    avg_regular = sum(valid_regular) / len(valid_regular) if valid_regular else 0
    
    # Formula: 0.2*Regular + 0.3*Midterm + 0.5*Final
    score_10 = (avg_regular * 0.2) + (req.midterm_score * 0.3) + (req.final_score * 0.5)
    score_10 = round(score_10, 2)
    
    score_4, grade_letter, classification, is_passed = convert_10_to_4(score_10)
    
    return {
        "score_10": score_10,
        "score_4": score_4,
        "grade_letter": grade_letter,
        "classification": classification,
        "is_passed": is_passed
    }

@router.post("/calculate/semester", response_model=SemesterCalculateResponse)
async def calculate_semester(req: SemesterCalculateRequest):
    total_w10 = 0
    total_w4 = 0
    total_credits = 0
    
    for sub in req.subjects:
        total_w10 += sub.score_10 * sub.credits
        if sub.score_4 is not None and sub.score_4 > 0:
            total_w4 += sub.score_4 * sub.credits
        else:
            s4, _, _, _ = convert_10_to_4(sub.score_10)
            total_w4 += s4 * sub.credits
        total_credits += sub.credits
        
    if total_credits == 0:
        return {"gpa_10": 0, "gpa_4": 0, "total_credits": 0, "classification": "N/A"}
        
    gpa_10 = round(total_w10 / total_credits, 2)
    gpa_4 = round(total_w4 / total_credits, 2)
    
    return {
        "gpa_10": gpa_10,
        "gpa_4": gpa_4,
        "total_credits": total_credits,
        "classification": get_classification_from_4(gpa_4)
    }

@router.post("/calculate/cumulative", response_model=CumulativeCalculateResponse)
async def calculate_cumulative(req: CumulativeCalculateRequest):
    total_w10 = 0
    total_w4 = 0
    total_credits = 0
    
    for sem in req.semesters:
        total_w10 += sem.gpa_10 * sem.total_credits
        if sem.gpa_4 is not None and sem.gpa_4 > 0:
            total_w4 += sem.gpa_4 * sem.total_credits
        else:
            s4, _, _, _ = convert_10_to_4(sem.gpa_10)
            total_w4 += s4 * sem.total_credits
        total_credits += sem.total_credits
        
    if total_credits == 0:
        return {"cgpa_10": 0, "cgpa_4": 0, "total_credits": 0, "classification": "N/A"}
        
    cgpa_10 = round(total_w10 / total_credits, 2)
    cgpa_4 = round(total_w4 / total_credits, 2)
    
    return {
        "cgpa_10": cgpa_10,
        "cgpa_4": cgpa_4,
        "total_credits": total_credits,
        "classification": get_classification_from_4(cgpa_4)
    }

@router.post("/calculate", response_model=LegacyCalculateResponse)
async def calculate_legacy(req: LegacyCalculateRequest):
    total_w10 = 0
    total_w4 = 0
    total_credits = 0
    
    for sub in req.courses:
        total_w10 += sub.score_10 * sub.credits
        s4, _, _, _ = convert_10_to_4(sub.score_10)
        total_w4 += s4 * sub.credits
        total_credits += sub.credits
        
    if total_credits == 0:
        return {"total_courses": 0, "total_credits": 0, "gpa_10": 0, "gpa_4": 0}
        
    gpa_10 = round(total_w10 / total_credits, 2)
    gpa_4 = round(total_w4 / total_credits, 2)
    
    return {
        "total_courses": len(req.courses),
        "total_credits": total_credits,
        "gpa_10": gpa_10,
        "gpa_4": gpa_4
    }

@router.get("/history")
async def get_history():
    return []

@router.delete("/history/{id}")
async def delete_history(id: int):
    return {"message": "Success"}
