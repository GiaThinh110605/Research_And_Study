import json
from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.calculator_log import CalculatorLog
from app.models.user import User

router = APIRouter()


class CourseInput(BaseModel):
	course_name: str
	credits: int = Field(gt=0)
	score_10: float = Field(ge=0, le=10)


class GPACalculateIn(BaseModel):
	courses: List[CourseInput]


class CourseResult(BaseModel):
	course_name: str
	credits: int
	score_10: float
	score_4: float
	letter_grade: str


class GPACalculateOut(BaseModel):
	total_courses: int
	total_credits: int
	gpa_10: float
	gpa_4: float
	courses: List[CourseResult]


class GPAHistoryOut(BaseModel):
	id: int
	created_at: datetime
	expression: Any
	result: GPACalculateOut


def _to_4_scale(score_10: float) -> float:
	if score_10 >= 8.5:
		return 4.0
	if score_10 >= 8.0:
		return 3.5
	if score_10 >= 7.0:
		return 3.0
	if score_10 >= 6.5:
		return 2.5
	if score_10 >= 5.5:
		return 2.0
	if score_10 >= 5.0:
		return 1.5
	if score_10 >= 4.0:
		return 1.0
	return 0.0


def _to_letter(score_10: float) -> str:
	if score_10 >= 8.5:
		return "A"
	if score_10 >= 8.0:
		return "B+"
	if score_10 >= 7.0:
		return "B"
	if score_10 >= 6.5:
		return "C+"
	if score_10 >= 5.5:
		return "C"
	if score_10 >= 5.0:
		return "D+"
	if score_10 >= 4.0:
		return "D"
	return "F"


@router.post("/calculate", response_model=GPACalculateOut)
def calculate_gpa(
	payload: GPACalculateIn,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	if not payload.courses:
		raise HTTPException(status_code=400, detail="Courses list cannot be empty")

	total_credits = sum(course.credits for course in payload.courses)
	weighted_10 = sum(course.score_10 * course.credits for course in payload.courses)

	course_results: List[CourseResult] = []
	weighted_4 = 0.0
	for course in payload.courses:
		score_4 = _to_4_scale(course.score_10)
		weighted_4 += score_4 * course.credits
		course_results.append(
			CourseResult(
				course_name=course.course_name,
				credits=course.credits,
				score_10=course.score_10,
				score_4=score_4,
				letter_grade=_to_letter(course.score_10),
			)
		)

	gpa_10 = round(weighted_10 / total_credits, 2)
	gpa_4 = round(weighted_4 / total_credits, 2)

	result = GPACalculateOut(
		total_courses=len(payload.courses),
		total_credits=total_credits,
		gpa_10=gpa_10,
		gpa_4=gpa_4,
		courses=course_results,
	)

	current_user.gpa = gpa_4
	log = CalculatorLog(
		user_id=current_user.id,
		expression=json.dumps(payload.dict(), ensure_ascii=True),
		result=json.dumps(result.dict(), ensure_ascii=True),
	)
	db.add(log)
	db.commit()

	return result


@router.get("/history", response_model=List[GPAHistoryOut])
def get_gpa_history(
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=50, ge=1, le=200),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	logs = (
		db.query(CalculatorLog)
		.filter(CalculatorLog.user_id == current_user.id)
		.order_by(CalculatorLog.created_at.desc())
		.offset(skip)
		.limit(limit)
		.all()
	)

	history = []
	for log in logs:
		expression = {}
		result = {}
		try:
			expression = json.loads(log.expression)
		except Exception:
			expression = {"raw": log.expression}
		try:
			result = json.loads(log.result)
		except Exception:
			continue

		history.append(
			GPAHistoryOut(
				id=log.id,
				created_at=log.created_at,
				expression=expression,
				result=GPACalculateOut(**result),
			)
		)

	return history


@router.delete("/history/{log_id}")
def delete_gpa_history_item(
	log_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	log = (
		db.query(CalculatorLog)
		.filter(CalculatorLog.id == log_id, CalculatorLog.user_id == current_user.id)
		.first()
	)
	if not log:
		raise HTTPException(status_code=404, detail="History item not found")

	db.delete(log)
	db.commit()
	return {"message": "History item deleted successfully"}
