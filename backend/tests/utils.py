from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import get_password_hash, create_access_token

def create_user(db: Session, email: str, password: str = "password123", role: UserRole = UserRole.STUDENT):
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        full_name="Test User",
        username=email.split("@")[0],
        role=role,
        is_active=True
    )
    db.add(user)
    db.flush()
    db.refresh(user)
    return user

def login_user(client, email: str, password: str = "password123"):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    return response.json()["access_token"]

def get_auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}
