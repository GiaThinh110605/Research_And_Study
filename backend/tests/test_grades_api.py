import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.student_grade import StudentGrade
from tests.utils import create_user, login_user, get_auth_headers

def test_create_grade(client: TestClient, db_session: Session):
    email = "grade_create@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    data = {
        "subject_name": "Toán cao cấp",
        "score": 8.5,
        "credits": 3,
        "semester": "2023.1",
        "source_type": "manual"
    }
    response = client.post("/api/v1/grades/", json=data, headers=get_auth_headers(token))
    assert response.status_code == 200
    assert response.json()["subject_name"] == data["subject_name"]

def test_list_grades(client: TestClient, db_session: Session):
    email = "grade_list@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    # Add a grade
    grade = StudentGrade(student_id=user.id, subject_name="Lý", score=7.0, credits=2)
    db_session.add(grade)
    db_session.flush()
    
    response = client.get("/api/v1/grades/", headers=get_auth_headers(token))
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_delete_grade(client: TestClient, db_session: Session):
    email = "grade_del@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    grade = StudentGrade(student_id=user.id, subject_name="Hóa", score=6.0, credits=2)
    db_session.add(grade)
    db_session.flush()
    
    response = client.delete(f"/api/v1/grades/{grade.id}", headers=get_auth_headers(token))
    assert response.status_code == 200
    assert response.json()["message"] == "Grade deleted successfully"
