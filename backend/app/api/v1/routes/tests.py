from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.plagiarism_report import PlagiarismReport
from app.models.test import Test
from app.models.test_result import TestResult
from app.models.user import User, UserRole

router = APIRouter()


class TestBase(BaseModel):
	title: str
	type: str
	document_id: Optional[int] = None
	questions: List[Dict[str, Any]]
	duration_minutes: Optional[int] = Field(default=None, gt=0)


class TestCreate(TestBase):
	pass


class TestUpdate(BaseModel):
	title: Optional[str] = None
	type: Optional[str] = None
	document_id: Optional[int] = None
	questions: Optional[List[Dict[str, Any]]] = None
	duration_minutes: Optional[int] = Field(default=None, gt=0)


class TestOut(TestBase):
	id: int
	creator_id: int
	created_at: datetime

	class Config:
		orm_mode = True


class TestSubmitIn(BaseModel):
	answers: Dict[str, Any]


class TestResultOut(BaseModel):
	id: int
	test_id: int
	user_id: int
	score: float
	completed_at: datetime
	answers: Optional[Dict[str, Any]] = None

	class Config:
		orm_mode = True


def _ensure_test_creator_or_admin(test: Test, current_user: User) -> None:
	if current_user.role == UserRole.ADMIN:
		return
	if test.creator_id != current_user.id:
		raise HTTPException(status_code=403, detail="Not enough permissions")


def _ensure_can_create_test(current_user: User) -> None:
	if current_user.role not in (UserRole.LECTURER, UserRole.ADMIN):
		raise HTTPException(
			status_code=403,
			detail="Only lecturers or admins can create tests",
		)


def _extract_correct_answer(question: Dict[str, Any]) -> Any:
	for key in ["correct_answer", "correct_option", "answer", "correct"]:
		if key in question:
			return question[key]
	return None


def _calculate_score(questions: List[Dict[str, Any]], answers: Dict[str, Any]) -> float:
	if not questions:
		return 0.0

	total = len(questions)
	correct_count = 0
	for index, question in enumerate(questions):
		question_id = str(question.get("id", index))
		expected = _extract_correct_answer(question)
		if expected is None:
			continue

		submitted = answers.get(question_id)
		if submitted is None:
			submitted = answers.get(str(index))

		if submitted == expected:
			correct_count += 1

	return round((correct_count / total) * 10, 2)


@router.get("/", response_model=List[TestOut])
def list_tests(
	test_type: Optional[str] = Query(default=None),
	document_id: Optional[int] = Query(default=None),
	creator_id: Optional[int] = Query(default=None),
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=200),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	query = db.query(Test)
	if test_type:
		query = query.filter(Test.type == test_type)
	if document_id is not None:
		query = query.filter(Test.document_id == document_id)
	if creator_id is not None:
		query = query.filter(Test.creator_id == creator_id)

	return query.order_by(Test.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=TestOut, status_code=status.HTTP_201_CREATED)
def create_test(
	payload: TestCreate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	_ensure_can_create_test(current_user)

	if payload.document_id is not None:
		document = db.query(Document).filter(Document.id == payload.document_id).first()
		if not document:
			raise HTTPException(status_code=404, detail="Document not found")

	test = Test(
		title=payload.title,
		type=payload.type,
		creator_id=current_user.id,
		document_id=payload.document_id,
		questions=payload.questions,
		duration_minutes=payload.duration_minutes,
	)
	db.add(test)
	db.commit()
	db.refresh(test)
	return test


@router.get("/my-results", response_model=List[TestResultOut])
def list_my_results(
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=200),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	return (
		db.query(TestResult)
		.filter(TestResult.user_id == current_user.id)
		.order_by(TestResult.completed_at.desc())
		.offset(skip)
		.limit(limit)
		.all()
	)


@router.get("/{test_id}", response_model=TestOut)
def get_test(
	test_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	test = db.query(Test).filter(Test.id == test_id).first()
	if not test:
		raise HTTPException(status_code=404, detail="Test not found")
	return test


@router.put("/{test_id}", response_model=TestOut)
def update_test(
	test_id: int,
	payload: TestUpdate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	test = db.query(Test).filter(Test.id == test_id).first()
	if not test:
		raise HTTPException(status_code=404, detail="Test not found")
	_ensure_test_creator_or_admin(test, current_user)

	update_data = payload.dict(exclude_unset=True)
	if "document_id" in update_data and update_data["document_id"] is not None:
		document = db.query(Document).filter(Document.id == update_data["document_id"]).first()
		if not document:
			raise HTTPException(status_code=404, detail="Document not found")

	for key, value in update_data.items():
		setattr(test, key, value)

	db.commit()
	db.refresh(test)
	return test


@router.delete("/{test_id}")
def delete_test(
	test_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	test = db.query(Test).filter(Test.id == test_id).first()
	if not test:
		raise HTTPException(status_code=404, detail="Test not found")
	_ensure_test_creator_or_admin(test, current_user)

	test_result_ids = [
		result_id for (result_id,) in db.query(TestResult.id).filter(TestResult.test_id == test_id).all()
	]
	if test_result_ids:
		db.query(PlagiarismReport).filter(
			PlagiarismReport.test_result_id.in_(test_result_ids)
		).delete(synchronize_session=False)

	db.query(TestResult).filter(TestResult.test_id == test_id).delete(synchronize_session=False)
	db.delete(test)
	db.commit()
	return {"message": "Test deleted successfully"}


@router.post("/{test_id}/submit", response_model=TestResultOut)
def submit_test(
	test_id: int,
	payload: TestSubmitIn,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	test = db.query(Test).filter(Test.id == test_id).first()
	if not test:
		raise HTTPException(status_code=404, detail="Test not found")

	score = _calculate_score(test.questions or [], payload.answers)

	existing_result = (
		db.query(TestResult)
		.filter(TestResult.test_id == test_id, TestResult.user_id == current_user.id)
		.first()
	)

	if existing_result:
		existing_result.score = score
		existing_result.answers = payload.answers
		db.commit()
		db.refresh(existing_result)
		return existing_result

	result = TestResult(
		test_id=test_id,
		user_id=current_user.id,
		score=score,
		answers=payload.answers,
	)
	db.add(result)
	db.commit()
	db.refresh(result)
	return result


@router.get("/{test_id}/results", response_model=List[TestResultOut])
def list_test_results(
	test_id: int,
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=200),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	test = db.query(Test).filter(Test.id == test_id).first()
	if not test:
		raise HTTPException(status_code=404, detail="Test not found")
	_ensure_test_creator_or_admin(test, current_user)

	return (
		db.query(TestResult)
		.filter(TestResult.test_id == test_id)
		.order_by(TestResult.completed_at.desc())
		.offset(skip)
		.limit(limit)
		.all()
	)
