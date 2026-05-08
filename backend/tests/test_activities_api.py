import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.test import Test
from app.models.test_result import TestResult
from app.models.discussion import Discussion
from tests.utils import create_user, login_user, get_auth_headers

def test_get_my_activities_empty(client: TestClient, db_session: Session):
    email = "empty_act@example.com"
    create_user(db_session, email)
    token = login_user(client, email)
    
    response = client.get("/api/v1/activities/me/activities", headers=get_auth_headers(token))
    assert response.status_code == 200
    assert response.json() == []

def test_get_my_activities_with_data(client: TestClient, db_session: Session):
    email = "act_data@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    # Add a document activity
    doc = Document(
        title="Activity Doc",
        file_path="/test.pdf",
        file_type="PDF",
        uploader_id=user.id
    )
    db_session.add(doc)
    
    # Add a discussion activity
    disc = Discussion(
        document_id=1, # Mock ID
        user_id=user.id,
        content="Test activity comment"
    )
    db_session.add(disc)
    
    db_session.flush()
    
    response = client.get("/api/v1/activities/me/activities", headers=get_auth_headers(token))
    assert response.status_code == 200
    activities = response.json()
    assert len(activities) >= 1
    assert any(a["type"] == "document" for a in activities)
