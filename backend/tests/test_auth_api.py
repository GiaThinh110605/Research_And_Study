import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import UserRole
from tests.utils import create_user, login_user, get_auth_headers

def test_register(client: TestClient, db_session: Session):
    data = {
        "email": "register@example.com",
        "password": "password123",
        "full_name": "Reg User",
        "username": "reguser",
        "role": "STUDENT"
    }
    response = client.post("/api/v1/auth/register", json=data)
    assert response.status_code == 201
    assert response.json()["email"] == data["email"]

def test_login(client: TestClient, db_session: Session):
    email = "login@example.com"
    create_user(db_session, email)
    
    data = {"username": email, "password": "password123"}
    response = client.post("/api/v1/auth/login", data=data)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_me(client: TestClient, db_session: Session):
    email = "me@example.com"
    create_user(db_session, email)
    token = login_user(client, email)
    
    response = client.get("/api/v1/users/me", headers=get_auth_headers(token))
    assert response.status_code == 200
    assert response.json()["email"] == email
