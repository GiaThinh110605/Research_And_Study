import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend root to sys.path
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from main import app
from app.models import Base
from app.models.base import get_db
from app.models.user import User

# Test Database Setup
TEST_DB_URL = "sqlite:///./test_auth_middleware.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def client():
    # Setup
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    
    # Teardown
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_user(db_session, email: str, password: str = "password123") -> User:
    user = User(
        full_name="Test User",
        email=email,
        password_hash=get_password_hash(password),
        role="student",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# --- Whitelist Tests ---

def test_root_path_is_whitelisted(client: TestClient):
    """GET / should be accessible without token."""
    response = client.get("/")
    assert response.status_code == 200

def test_health_path_is_whitelisted(client: TestClient):
    """GET /health should be accessible without token."""
    response = client.get("/health")
    assert response.status_code == 200

def test_docs_is_whitelisted(client: TestClient):
    """GET /docs should be accessible without token."""
    response = client.get("/docs")
    assert response.status_code == 200

def test_auth_login_is_whitelisted(client: TestClient):
    """POST /api/v1/auth/login should not be blocked by middleware (returns 422 if no data)."""
    response = client.post("/api/v1/auth/login")
    assert response.status_code == 422
    assert response.json()["detail"] is not None

def test_uploads_are_whitelisted(client: TestClient):
    """GET /uploads/test.txt should not return 401 even if file doesn't exist (returns 404)."""
    response = client.get("/uploads/test.txt")
    assert response.status_code == 404
    assert response.json()["detail"] == "Not Found" # From StaticFiles, not middleware

# --- Protection Tests ---

def test_protected_route_fails_without_token(client: TestClient):
    """Protected route should return 401 if token is missing."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_protected_route_fails_with_invalid_token(client: TestClient):
    """Protected route should return 401 if token is invalid."""
    headers = {"Authorization": "Bearer invalid-token-here"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]

def test_protected_route_succeeds_with_valid_token(client: TestClient, db_session):
    """Protected route should return 200 with valid JWT."""
    user = create_user(db_session, "test@example.com")
    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_admin_only_route_fails_for_student(client: TestClient, db_session):
    """Admin-only route should return 403 for student users, even if token is valid."""
    user = create_user(db_session, "student@example.com")
    user.role = "student"
    db_session.add(user)
    db_session.commit()
    
    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # /api/v1/users/ is admin-only
    response = client.get("/api/v1/users/", headers=headers)
    assert response.status_code == 403
    assert "The user doesn't have enough privileges" in response.json()["detail"]
