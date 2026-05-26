from datetime import datetime
import secrets
import string
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

from app.api.v1.deps import get_current_user
from app.models.base import get_db
from app.models.document import Document
from app.models.test import Test
from app.models.test_result import TestResult
from app.models.user import User, UserRole

router = APIRouter()


class TestBase(BaseModel):
	title: str
	subject: str
	document_id: Optional[int] = None
	questions: List[Dict[str, Any]]
	duration_minutes: Optional[int] = Field(default=None, gt=0)


class TestCreate(TestBase):
	access_code: Optional[str] = None


class TestUpdate(BaseModel):
	title: Optional[str] = None
	subject: Optional[str] = None
	document_id: Optional[int] = None
	questions: Optional[List[Dict[str, Any]]] = None
	duration_minutes: Optional[int] = Field(default=None, gt=0)
	access_code: Optional[str] = None


class TestOut(BaseModel):
	id: int
	title: str
	subject: Optional[str] = None
	document_id: Optional[int] = None
	duration_minutes: Optional[int] = None
	creator_id: int
	creator_role: Optional[str] = None
	created_at: datetime
	questions_count: int = 0
	participants_count: int = 0
	status: str = "MỚI"
	is_locked: bool = False
	questions: Optional[List[Dict[str, Any]]] = None
	access_code: Optional[str] = None

	model_config = {"from_attributes": True}


class TestStatsOut(BaseModel):
	total_tests: int
	completed_tests: int
	average_score: float
	progress_percent: float


class TestSubmitIn(BaseModel):
	answers: Dict[str, Any]
	time_taken_seconds: Optional[int] = None


class TestResultOut(BaseModel):
	id: int
	test_id: int
	user_id: int
	score: float
	time_taken_seconds: Optional[int] = None
	completed_at: datetime
	answers: Optional[Dict[str, Any]] = None
	# Fields for display
	test_title: Optional[str] = None
	full_name: Optional[str] = None
	rank: Optional[int] = None
	total_participants: Optional[int] = None
	test_questions: Optional[List[Dict[str, Any]]] = None

	model_config = {"from_attributes": True}


def _ensure_test_creator_or_admin(test: Test, current_user: User) -> None:
	if current_user.role == UserRole.ADMIN:
		return
	if test.creator_id != current_user.id:
		raise HTTPException(status_code=403, detail="Not enough permissions")


def _ensure_can_create_test(current_user: User) -> None:
	# Allow all authenticated users, including STUDENTS, to create tests
	pass


def _extract_correct_answer(question: Dict[str, Any]) -> Any:
	for key in ["correct_answer", "correct_option", "answer", "correct"]:
		if key in question:
			return question[key]
	return None


def _strip_correct_answers(questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
	if not questions:
		return []
	stripped = []
	for q in questions:
		q_copy = q.copy()
		for key in ["correct_answer", "correct_option", "answer", "correct", "explanation"]:
			q_copy.pop(key, None)
		stripped.append(q_copy)
	return stripped


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

		if str(submitted) == str(expected):
			correct_count += 1

	return round((correct_count / total) * 10, 2)


def _to_4_scale(score_10: float) -> float:
	if score_10 >= 9.0: return 4.0
	if score_10 >= 8.5: return 3.8
	if score_10 >= 8.0: return 3.5
	if score_10 >= 7.0: return 3.0
	if score_10 >= 6.0: return 2.5
	if score_10 >= 5.5: return 2.0
	if score_10 >= 5.0: return 1.5
	if score_10 >= 4.0: return 1.0
	return 0.0


@router.get("/stats", response_model=TestStatsOut)
def get_test_stats(
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	try:
		total_tests = db.query(Test).count()
		user_results = db.query(TestResult).filter(TestResult.student_id == current_user.id).all()
		
		completed_tests = len(user_results)
		
		total_score_4 = 0.0
		for res in user_results:
			score = getattr(res, 'score', 0.0)
			if score is not None:
				total_score_4 += _to_4_scale(float(score))
		
		average_score = round(total_score_4 / completed_tests, 2) if completed_tests > 0 else 0.0
		
		progress_percent = round((completed_tests / total_tests) * 100, 1) if total_tests > 0 else 0.0
		
		return {
			"total_tests": total_tests,
			"completed_tests": completed_tests,
			"average_score": average_score,
			"progress_percent": progress_percent
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Stats Error: {str(e)}")


@router.get("/", response_model=List[TestOut])
def list_tests(
	subject: Optional[str] = Query(default=None),
	document_id: Optional[int] = Query(default=None),
	creator_id: Optional[int] = Query(default=None),
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=200),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	query = db.query(Test).filter(Test.is_active == True).options(joinedload(Test.creator))
	if subject:
		query = query.filter(Test.subject == subject)
	if document_id is not None:
		query = query.filter(Test.document_id == document_id)
	
	# Chỉ lọc creator_id nếu có truyền vào (thường dùng cho Lecturer quản lý đề của họ)
	if creator_id is not None:
		query = query.filter(Test.creator_id == creator_id)

	tests = query.order_by(Test.created_at.desc()).offset(skip).limit(limit).all()
	
	results = []
	for test in tests:
		test_res = db.query(TestResult).filter(
			TestResult.test_id == test.id, 
			TestResult.student_id == current_user.id
		).first()
		
		status = "MỚI"
		if test_res:
			if test_res.score >= 5:
				status = "HOÀN THÀNH"
			else:
				status = "ĐANG LÀM"
		
		creator_role = test.creator.role.value if test.creator else "LECTURER"

		results.append({
			"id": test.id,
			"title": test.title,
			"subject": test.subject,
			"document_id": test.document_id,
			"duration_minutes": test.duration_minutes,
			"creator_id": test.creator_id,
			"creator_role": creator_role,
			"created_at": test.created_at,
			"questions_count": len(test.questions) if test.questions else 0,
			"participants_count": test.participants_count or 0,
			"status": status,
			"is_locked": bool(test.access_code)
		})
	
	return results


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
		subject=payload.subject,
		creator_id=current_user.id,
		document_id=payload.document_id,
		questions=payload.questions,
		duration_minutes=payload.duration_minutes,
		access_code=payload.access_code or ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
	)
	db.add(test)
	db.commit()
	db.refresh(test)
	
	# Load creator relationship for the response
	test = db.query(Test).options(joinedload(Test.creator)).filter(Test.id == test.id).first()
	return test


@router.get("/my-results", response_model=List[TestResultOut])
def list_my_results(
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=100, ge=1, le=200),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	results = (
		db.query(TestResult)
		.filter(TestResult.student_id == current_user.id)
		.order_by(TestResult.completed_at.desc())
		.offset(skip)
		.limit(limit)
		.all()
	)
	
	# Enhance with test title
	enhanced_results = []
	for res in results:
		res_dict = {
			"id": res.id,
			"test_id": res.test_id,
			"user_id": res.student_id,
			"score": res.score,
			"time_taken_seconds": res.time_taken,
			"completed_at": res.completed_at,
			"answers": res.submitted_answers,
			"test_title": res.test.title if res.test else "Unknown Test"
		}
		enhanced_results.append(res_dict)
		
	return enhanced_results


@router.get("/{test_id}", response_model=TestOut)
def get_test(
	test_id: int,
	access_code: Optional[str] = Query(default=None),
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	test = db.query(Test).options(joinedload(Test.creator)).filter(Test.id == test_id).first()
	if not test:
		raise HTTPException(status_code=404, detail="Test not found")
	
	# Determine if we should strip correct answers
	# Rule: Students NEVER see correct answers in this endpoint
	# Lecturers/Admins only see if they are the creator or admin
	should_strip = False
	if current_user.role == UserRole.STUDENT:
		should_strip = True
	elif current_user.role != UserRole.ADMIN and test.creator_id != current_user.id:
		should_strip = True

	# Validate access code for students if one exists
	if current_user.role == UserRole.STUDENT and test.access_code:
		if access_code != test.access_code:
			raise HTTPException(
				status_code=403, 
				detail="Mã truy cập không chính xác. Vui lòng liên hệ giảng viên để nhận mã."
			)

	if should_strip and test.questions:
		# Return a copy with stripped questions
		test_data = {
			"id": test.id,
			"title": test.title,
			"subject": test.subject,
			"document_id": test.document_id,
			"duration_minutes": test.duration_minutes,
			"creator_id": test.creator_id,
			"creator_role": test.creator.role.value if test.creator else None,
			"created_at": test.created_at,
			"questions_count": len(test.questions),
			"participants_count": test.participants_count or 0,
			"is_locked": bool(test.access_code),
			"questions": _strip_correct_answers(test.questions),
			"access_code": None  # Hide code from students
		}
		return test_data

	# For lecturers/admins who are not the creator, also hide code if desired
	# but for now let's just ensure students don't see it
    if test.participants_count is None:
        test.participants_count = 0
    res = TestOut.model_validate(test)
	return res


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

	result = (
		db.query(TestResult)
		.filter(TestResult.test_id == test_id, TestResult.student_id == current_user.id)
		.first()
	)

	if result:
		result.score = score
		result.submitted_answers = payload.answers
		result.time_taken = payload.time_taken_seconds
	else:
		result = TestResult(
			test_id=test_id,
			student_id=current_user.id,
			score=score,
			max_score=10.0,
			submitted_answers=payload.answers,
			time_taken=payload.time_taken_seconds
		)
		db.add(result)
	
	# Always increment participants_count to reflect total attempts
	test.participants_count = (test.participants_count or 0) + 1
	db.add(test)
	
	db.commit()
	db.refresh(result)

	# Calculate rank stats
	total_participants = db.query(TestResult).filter(TestResult.test_id == test_id).count()
	rank = db.query(TestResult).filter(TestResult.test_id == test_id, TestResult.score > score).count() + 1

	return {
		"id": result.id,
		"test_id": result.test_id,
		"user_id": result.student_id,
		"score": result.score,
		"time_taken_seconds": result.time_taken,
		"completed_at": result.completed_at,
		"answers": result.submitted_answers,
		"test_title": test.title,
		"full_name": current_user.full_name,
		"rank": rank,
		"total_participants": total_participants,
		"test_questions": test.questions
	}


@router.get("/result/{result_id}", response_model=TestResultOut)
def get_result(
	result_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Any:
	result = db.query(TestResult).filter(TestResult.id == result_id).first()
	if not result:
		raise HTTPException(status_code=404, detail="Result not found")
	
	test = db.query(Test).filter(Test.id == result.test_id).first()
	
	total_participants = db.query(TestResult).filter(TestResult.test_id == result.test_id).count()
	rank = db.query(TestResult).filter(TestResult.test_id == result.test_id, TestResult.score > result.score).count() + 1
	
	# For results, students can see correct answers only if the test is completed
	# But following the strict request: "không được trả về correct_answer cho người dùng"
	# We strip it here too if they are not the creator/admin
	questions = test.questions if test else []
	if current_user.role != UserRole.ADMIN and test and test.creator_id != current_user.id and current_user.id != result.student_id:
		questions = _strip_correct_answers(questions)

	return {
		"id": result.id,
		"test_id": result.test_id,
		"user_id": result.student_id,
		"score": result.score,
		"time_taken_seconds": result.time_taken,
		"completed_at": result.completed_at,
		"answers": result.submitted_answers,
		"test_title": test.title if test else "Unknown Test",
		"full_name": result.student.full_name if result.student else "Unknown",
		"rank": rank,
		"total_participants": total_participants,
		"test_questions": questions
	}


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

	results = (
		db.query(TestResult)
		.filter(TestResult.test_id == test_id)
		.options(joinedload(TestResult.student))
		.order_by(TestResult.completed_at.desc())
		.offset(skip)
		.limit(limit)
		.all()
	)

	output = []
	for r in results:
		output.append({
			"id": r.id,
			"test_id": r.test_id,
			"user_id": r.student_id,
			"score": r.score,
			"time_taken_seconds": r.time_taken,
			"completed_at": r.completed_at,
			"answers": r.submitted_answers,
			"full_name": r.student.full_name if r.student else f"Học viên {r.student_id}"
		})
	return output
