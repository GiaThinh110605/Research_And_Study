from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from app.models.base import Base, get_db
from app import models  # noqa: F401  # Ensure all models are registered
from app.core.config import settings


TEST_DB_PATH = Path("test_documents.db")
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()

    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db

    original_upload_dir = settings.UPLOAD_DIR
    test_upload_dir = Path("test_uploads")
    test_upload_dir.mkdir(exist_ok=True)
    settings.UPLOAD_DIR = str(test_upload_dir)

    yield

    app.dependency_overrides.clear()
    settings.UPLOAD_DIR = original_upload_dir

    Base.metadata.drop_all(bind=engine)
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()

    if test_upload_dir.exists():
        for child in test_upload_dir.iterdir():
            if child.is_file():
                child.unlink()
        test_upload_dir.rmdir()


def register_and_login(client: TestClient, email: str, student_id: str, password: str = "12345678"):
    register_payload = {
        "full_name": "Test User",
        "email": email,
        "role": "student",
        "student_id": student_id,
        "password": password,
    }
    register_response = client.post("/api/v1/auth/register", json=register_payload)
    assert register_response.status_code == 200

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def create_document(client: TestClient, token: str, title: str = "Tai lieu M4", is_public: bool = True):
    response = client.post(
        "/api/v1/documents",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "title": title,
            "description": "Mo ta test",
            "subject": "CNTT",
            "is_public": str(is_public).lower(),
        },
        files={"file": ("m4_test.txt", b"M4 test content", "text/plain")},
    )
    assert response.status_code == 200
    return response.json()


def test_list_documents_only_public_for_guest():
    client = TestClient(app)

    owner_token = register_and_login(client, "guest_public_owner@example.com", "21000011")
    create_document(client, owner_token, title="Public Guest Visible", is_public=True)
    create_document(client, owner_token, title="Private Guest Hidden", is_public=False)

    guest_list = client.get("/api/v1/documents")
    assert guest_list.status_code == 200

    titles = [item["title"] for item in guest_list.json()["items"]]
    assert "Public Guest Visible" in titles
    assert "Private Guest Hidden" not in titles


def test_private_document_detail_forbidden_without_permission():
    client = TestClient(app)

    owner_token = register_and_login(client, "private_owner@example.com", "21000021")
    private_doc = create_document(client, owner_token, title="Private ACL", is_public=False)

    guest_detail = client.get(f"/api/v1/documents/{private_doc['id']}")
    assert guest_detail.status_code == 403


def test_share_document_allows_target_user_to_access_private_document():
    client = TestClient(app)

    owner_email = "owner_share@example.com"
    viewer_email = "viewer_share@example.com"

    owner_token = register_and_login(client, owner_email, "21000031")
    viewer_token = register_and_login(client, viewer_email, "21000032")

    private_doc = create_document(client, owner_token, title="Share Private Doc", is_public=False)

    share_response = client.post(
        f"/api/v1/documents/{private_doc['id']}/share",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"shared_with_email": viewer_email, "permission": "view"},
    )
    assert share_response.status_code == 200

    viewer_list = client.get(
        "/api/v1/documents?q=Share%20Private%20Doc",
        headers={"Authorization": f"Bearer {viewer_token}"},
    )
    assert viewer_list.status_code == 200
    assert viewer_list.json()["total"] >= 1


def test_update_document_requires_owner_or_edit_permission():
    client = TestClient(app)

    owner_email = "owner_edit@example.com"
    commenter_email = "commenter_edit@example.com"
    editor_email = "editor_edit@example.com"

    owner_token = register_and_login(client, owner_email, "21000041")
    commenter_token = register_and_login(client, commenter_email, "21000042")
    register_and_login(client, editor_email, "21000043")

    document = create_document(client, owner_token, title="Editable Doc", is_public=False)

    client.post(
        f"/api/v1/documents/{document['id']}/share",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"shared_with_email": commenter_email, "permission": "comment"},
    )

    forbidden_update = client.put(
        f"/api/v1/documents/{document['id']}",
        headers={"Authorization": f"Bearer {commenter_token}"},
        json={"title": "Should Fail"},
    )
    assert forbidden_update.status_code == 403

    owner_share_editor = client.post(
        f"/api/v1/documents/{document['id']}/share",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"shared_with_email": editor_email, "permission": "edit"},
    )
    assert owner_share_editor.status_code == 200

    editor_login = client.post(
        "/api/v1/auth/login",
        data={"username": editor_email, "password": "12345678"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    editor_token = editor_login.json()["access_token"]

    allowed_update = client.put(
        f"/api/v1/documents/{document['id']}",
        headers={"Authorization": f"Bearer {editor_token}"},
        json={"title": "Updated By Editor"},
    )
    assert allowed_update.status_code == 200
    assert allowed_update.json()["title"] == "Updated By Editor"


def test_share_endpoint_forbids_non_owner_sharing():
    client = TestClient(app)

    owner_token = register_and_login(client, "owner_only_share@example.com", "21000051")
    other_token = register_and_login(client, "other_only_share@example.com", "21000052")

    document = create_document(client, owner_token, title="Owner Share Policy", is_public=True)

    non_owner_share = client.post(
        f"/api/v1/documents/{document['id']}/share",
        headers={"Authorization": f"Bearer {other_token}"},
        json={"shared_with_email": "someone@example.com", "permission": "view"},
    )
    assert non_owner_share.status_code == 403


def test_list_shares_only_owner_can_view_share_list():
    client = TestClient(app)

    owner_email = "owner_list_shares@example.com"
    viewer_email = "viewer_list_shares@example.com"

    owner_token = register_and_login(client, owner_email, "21000061")
    viewer_token = register_and_login(client, viewer_email, "21000062")

    document = create_document(client, owner_token, title="Owner Shares Visibility", is_public=False)

    share_response = client.post(
        f"/api/v1/documents/{document['id']}/share",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"shared_with_email": viewer_email, "permission": "view"},
    )
    assert share_response.status_code == 200

    viewer_shares_list = client.get(
        f"/api/v1/documents/{document['id']}/shares",
        headers={"Authorization": f"Bearer {viewer_token}"},
    )
    assert viewer_shares_list.status_code == 403

    owner_shares_list = client.get(
        f"/api/v1/documents/{document['id']}/shares",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert owner_shares_list.status_code == 200
    assert len(owner_shares_list.json()) == 1


def test_delete_document_only_owner_can_delete():
    client = TestClient(app)

    owner_email = "owner_delete@example.com"
    editor_email = "editor_delete@example.com"

    owner_token = register_and_login(client, owner_email, "21000071")
    editor_token = register_and_login(client, editor_email, "21000072")

    document = create_document(client, owner_token, title="Delete Policy Doc", is_public=False)

    owner_share_editor = client.post(
        f"/api/v1/documents/{document['id']}/share",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"shared_with_email": editor_email, "permission": "edit"},
    )
    assert owner_share_editor.status_code == 200

    editor_delete_attempt = client.delete(
        f"/api/v1/documents/{document['id']}",
        headers={"Authorization": f"Bearer {editor_token}"},
    )
    assert editor_delete_attempt.status_code == 403

    owner_delete = client.delete(
        f"/api/v1/documents/{document['id']}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert owner_delete.status_code == 200

    detail_after_delete = client.get(
        f"/api/v1/documents/{document['id']}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert detail_after_delete.status_code == 404


def test_e2e_document_flow_upload_share_view_and_cleanup():
    client = TestClient(app)

    owner_email = "owner_e2e@example.com"
    viewer_email = "viewer_e2e@example.com"

    owner_token = register_and_login(client, owner_email, "21000081")
    viewer_token = register_and_login(client, viewer_email, "21000082")

    created_document = create_document(client, owner_token, title="E2E Document Flow", is_public=False)

    owner_detail = client.get(
        f"/api/v1/documents/{created_document['id']}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert owner_detail.status_code == 200

    viewer_detail_before_share = client.get(
        f"/api/v1/documents/{created_document['id']}",
        headers={"Authorization": f"Bearer {viewer_token}"},
    )
    assert viewer_detail_before_share.status_code == 403

    share_response = client.post(
        f"/api/v1/documents/{created_document['id']}/share",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"shared_with_email": viewer_email, "permission": "view"},
    )
    assert share_response.status_code == 200

    viewer_detail_after_share = client.get(
        f"/api/v1/documents/{created_document['id']}",
        headers={"Authorization": f"Bearer {viewer_token}"},
    )
    assert viewer_detail_after_share.status_code == 200
    assert viewer_detail_after_share.json()["title"] == "E2E Document Flow"

    viewer_search = client.get(
        "/api/v1/documents?q=E2E%20Document%20Flow",
        headers={"Authorization": f"Bearer {viewer_token}"},
    )
    assert viewer_search.status_code == 200
    assert viewer_search.json()["total"] >= 1

    owner_share_list = client.get(
        f"/api/v1/documents/{created_document['id']}/shares",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert owner_share_list.status_code == 200
    assert len(owner_share_list.json()) >= 1

    owner_delete = client.delete(
        f"/api/v1/documents/{created_document['id']}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert owner_delete.status_code == 200
