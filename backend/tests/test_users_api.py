import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import UserRole
from tests.utils import create_user, login_user, get_auth_headers

def test_read_user_me(client: TestClient, db_session: Session):
    email = "me_user@example.com"
    create_user(db_session, email)
    token = login_user(client, email)
    
    response = client.get("/api/v1/users/me", headers=get_auth_headers(token))
    assert response.status_code == 200
    assert response.json()["email"] == email

def test_read_users_admin_only(client: TestClient, db_session: Session):
    # Admin user
    admin_email = "admin@example.com"
    create_user(db_session, admin_email, role=UserRole.ADMIN)
    admin_token = login_user(client, admin_email)
    
    response = client.get("/api/v1/users/", headers=get_auth_headers(admin_token))
    assert response.status_code == 200
    assert isinstance(response.json(), list)
