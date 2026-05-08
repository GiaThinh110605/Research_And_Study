import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from tests.utils import create_user, login_user, get_auth_headers

def test_get_student_dashboard(client: TestClient, db_session: Session):
    email = "dash@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    response = client.get("/api/v1/dashboard/student", headers=get_auth_headers(token))
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "recent_documents" in data
    assert "upcoming_tests" in data
    assert data["stats"]["total_documents"] >= 0
