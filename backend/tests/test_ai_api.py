import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.document import Document
from tests.utils import create_user, login_user, get_auth_headers

@pytest.fixture
def test_doc(db_session: Session, request):
    email = f"ai_tester_{request.node.name}@example.com"
    user = create_user(db_session, email)
    doc = Document(
        title="AI Test Doc",
        description="Test description",
        file_path="/uploads/test.pdf",
        file_type="PDF",
        uploader_id=user.id
    )
    db_session.add(doc)
    db_session.flush()
    db_session.refresh(doc)
    return doc, user

@patch("app.api.v1.routes.ai.extract_text_from_file")
@patch("app.api.v1.routes.ai.generate_summary")
def test_generate_summary(mock_gen_summary, mock_extract, client: TestClient, db_session: Session, test_doc):
    doc, user = test_doc
    token = login_user(client, user.email)
    
    mock_extract.return_value = "This is a long test text for summary."
    mock_gen_summary.return_value = "Summary: This is a test."
    
    response = client.post(f"/api/v1/ai/summary/{doc.id}", headers=get_auth_headers(token))
    assert response.status_code == 200
    assert response.json()["content"] == "Summary: This is a test."

def test_generate_mindmap(client: TestClient, db_session: Session, test_doc):
    doc, user = test_doc
    token = login_user(client, user.email)
    
    response = client.post(f"/api/v1/ai/mindmap/{doc.id}", headers=get_auth_headers(token))
    assert response.status_code == 200
    assert "root" in response.json()["content"]
