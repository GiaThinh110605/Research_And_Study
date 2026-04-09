import io
import os
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import settings
from app.core.security import get_password_hash
from main import app
from app.models import Base
from app.models.base import get_db
from app.models.document import Document
from app.models.user import User, UserRole


TEST_DB_URL = "sqlite:///./test_documents_api.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def client(tmp_path):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    upload_dir = tmp_path / "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    old_upload_dir = settings.UPLOAD_DIR
    settings.UPLOAD_DIR = str(upload_dir)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    settings.UPLOAD_DIR = old_upload_dir

    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_user(db_session, email: str, role: UserRole = UserRole.STUDENT, password: str = "password123") -> User:
    user = User(
        full_name=email.split("@")[0],
        email=email,
        password_hash=get_password_hash(password),
        role=role,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def create_document(
    db_session,
    uploader_id: int,
    title: str,
    is_public: bool = True,
    subject: str = "CNTT",
    file_url: str = "/uploads/sample.pdf",
    file_type: str = "PDF",
) -> Document:
    document = Document(
        title=title,
        description="Tai lieu test",
        subject=subject,
        is_public=is_public,
        file_url=file_url,
        file_type=file_type,
        uploader_id=uploader_id,
    )
    db_session.add(document)
    db_session.commit()
    db_session.refresh(document)
    return document


def login(client: TestClient, email: str, password: str = "password123") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_list_documents_guest_only_sees_public(client: TestClient, db_session):
    owner = create_user(db_session, "owner@example.com")
    public_doc = create_document(db_session, owner.id, "Public Doc", is_public=True)
    create_document(db_session, owner.id, "Private Doc", is_public=False)

    response = client.get("/api/v1/documents")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["id"] == public_doc.id


def test_private_document_access_requires_share(client: TestClient, db_session):
    owner = create_user(db_session, "owner2@example.com")
    target = create_user(db_session, "target@example.com")
    private_doc = create_document(db_session, owner.id, "Private", is_public=False)

    owner_token = login(client, owner.email)
    target_token = login(client, target.email)

    blocked = client.get(
        f"/api/v1/documents/{private_doc.id}",
        headers=auth_headers(target_token),
    )
    assert blocked.status_code == 403

    share_response = client.post(
        f"/api/v1/documents/{private_doc.id}/share",
        json={"shared_with_user_id": target.id, "permission": "view"},
        headers=auth_headers(owner_token),
    )
    assert share_response.status_code == 200

    allowed = client.get(
        f"/api/v1/documents/{private_doc.id}",
        headers=auth_headers(target_token),
    )
    assert allowed.status_code == 200


def test_update_document_requires_edit_permission(client: TestClient, db_session):
    owner = create_user(db_session, "owner3@example.com")
    viewer = create_user(db_session, "viewer@example.com")
    editor = create_user(db_session, "editor@example.com")
    doc = create_document(db_session, owner.id, "Doc Can Edit", is_public=False)

    owner_token = login(client, owner.email)
    viewer_token = login(client, viewer.email)
    editor_token = login(client, editor.email)

    client.post(
        f"/api/v1/documents/{doc.id}/share",
        json={"shared_with_user_id": viewer.id, "permission": "view"},
        headers=auth_headers(owner_token),
    )
    client.post(
        f"/api/v1/documents/{doc.id}/share",
        json={"shared_with_user_id": editor.id, "permission": "edit"},
        headers=auth_headers(owner_token),
    )

    denied = client.put(
        f"/api/v1/documents/{doc.id}",
        json={"title": "Viewer Update"},
        headers=auth_headers(viewer_token),
    )
    assert denied.status_code == 403

    updated = client.put(
        f"/api/v1/documents/{doc.id}",
        json={"title": "Editor Update"},
        headers=auth_headers(editor_token),
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Editor Update"


def test_delete_document_only_owner_can_delete(client: TestClient, db_session):
    owner = create_user(db_session, "owner4@example.com")
    stranger = create_user(db_session, "stranger@example.com")
    doc = create_document(db_session, owner.id, "Delete Me", is_public=True)

    owner_token = login(client, owner.email)
    stranger_token = login(client, stranger.email)

    denied = client.delete(
        f"/api/v1/documents/{doc.id}",
        headers=auth_headers(stranger_token),
    )
    assert denied.status_code == 403

    deleted = client.delete(
        f"/api/v1/documents/{doc.id}",
        headers=auth_headers(owner_token),
    )
    assert deleted.status_code == 200

    missing = client.get(f"/api/v1/documents/{doc.id}")
    assert missing.status_code == 404


def test_upload_document_rejects_file_over_backend_limit(client: TestClient, db_session):
    owner = create_user(db_session, "owner5@example.com")
    token = login(client, owner.email)

    too_large_file = io.BytesIO(b"a" * (settings.MAX_FILE_SIZE + 1))

    response = client.post(
        "/api/v1/documents",
        headers=auth_headers(token),
        data={
            "title": "Too Large",
            "description": "Large file",
            "subject": "CNTT",
            "is_public": "true",
        },
        files={"file": ("big.pdf", too_large_file, "application/pdf")},
    )

    assert response.status_code == 400
    assert "File is larger than" in response.json()["detail"]


def test_upload_document_success_creates_file_and_record(client: TestClient, db_session):
    owner = create_user(db_session, "owner6@example.com")
    token = login(client, owner.email)

    response = client.post(
        "/api/v1/documents",
        headers=auth_headers(token),
        data={
            "title": "Valid Upload",
            "description": "Small file",
            "subject": "CNTT",
            "is_public": "true",
        },
        files={"file": ("ok.pdf", io.BytesIO(b"small-data"), "application/pdf")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["title"] == "Valid Upload"
    assert payload["file_type"] == "PDF"

    file_name = Path(payload["file_url"]).name
    saved_path = Path(settings.UPLOAD_DIR) / file_name
    assert saved_path.exists()
