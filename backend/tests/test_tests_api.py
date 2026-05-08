import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.test import Test
from tests.utils import create_user, login_user, get_auth_headers

def test_create_test(client: TestClient, db_session: Session):
    email = "test_creator@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    data = {
        "title": "Unit Test 1",
        "subject": "Math",
        "questions": [
            {"text": "1+1=?", "options": ["1", "2", "3", "4"], "correct_answer": 1}
        ],
        "duration_minutes": 15
    }
    response = client.post("/api/v1/tests/", json=data, headers=get_auth_headers(token))
    assert response.status_code == 201
    assert response.json()["title"] == data["title"]

def test_submit_test(client: TestClient, db_session: Session):
    email = "student_test@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    test = Test(
        title="T1", 
        subject="S1", 
        questions=[{"id": "q1", "correct_answer": 1}], 
        creator_id=user.id
    )
    db_session.add(test)
    db_session.flush()
    
    data = {"answers": {"q1": 1}, "time_taken_seconds": 10}
    response = client.post(f"/api/v1/tests/{test.id}/submit", json=data, headers=get_auth_headers(token))
    assert response.status_code == 200
    assert response.json()["score"] == 10.0
