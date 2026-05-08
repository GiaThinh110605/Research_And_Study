import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.discussion import Discussion
from tests.utils import create_user, login_user, get_auth_headers

@pytest.fixture
def test_doc(db_session: Session):
    user = create_user(db_session, "disc_owner@example.com")
    doc = Document(title="Disc Doc", file_path="/d.pdf", file_type="PDF", uploader_id=user.id)
    db_session.add(doc)
    db_session.flush()
    return doc

def test_create_discussion(client: TestClient, db_session: Session, test_doc):
    email = "disc_user@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    data = {
        "document_id": test_doc.id,
        "content": "Hello world discussion",
        "is_question": False
    }
    response = client.post("/api/v1/discussions/", json=data, headers=get_auth_headers(token))
    assert response.status_code == 201
    assert response.json()["content"] == data["content"]

def test_list_discussions(client: TestClient, db_session: Session, test_doc):
    email = "disc_list@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    # Add a discussion
    disc = Discussion(document_id=test_doc.id, user_id=user.id, content="List me")
    db_session.add(disc)
    db_session.flush()
    
    response = client.get(f"/api/v1/discussions/?document_id={test_doc.id}", headers=get_auth_headers(token))
    assert response.status_code == 200
    assert len(response.json()) >= 1
