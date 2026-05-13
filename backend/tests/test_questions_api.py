from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.question import Question
from tests.utils import create_user, login_user, get_auth_headers


@pytest.fixture
def test_doc(db_session: Session):
    user = create_user(db_session, "qa_owner@example.com")
    doc = Document(
        title="QA Doc",
        description="Test description",
        file_path="/uploads/qa.txt",
        file_type="TXT",
        uploader_id=user.id,
    )
    db_session.add(doc)
    db_session.flush()
    db_session.refresh(doc)
    return doc, user


def test_create_question_and_list(client: TestClient, db_session: Session, test_doc):
    doc, user = test_doc
    token = login_user(client, user.email)

    with patch("app.api.v1.routes.questions._generate_ai_answer_background", return_value=None):
        response = client.post(
            "/api/v1/questions/",
            json={"document_id": doc.id, "content": "What is this?"},
            headers=get_auth_headers(token),
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["document_id"] == doc.id
    assert payload["content"] == "What is this?"

    listed = client.get(
        f"/api/v1/questions/?document_id={doc.id}",
        headers=get_auth_headers(token),
    )
    assert listed.status_code == 200
    items = listed.json()
    assert len(items) >= 1
    assert items[0]["content"] == "What is this?"


def test_answer_question_updates_answer(client: TestClient, db_session: Session, test_doc):
    doc, user = test_doc
    token = login_user(client, user.email)

    question = Question(
        document_id=doc.id,
        user_id=user.id,
        content="Need answer",
    )
    db_session.add(question)
    db_session.flush()
    db_session.refresh(question)

    response = client.put(
        f"/api/v1/questions/{question.id}",
        json={"answer": "This is the answer."},
        headers=get_auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json()["answer"] == "This is the answer."
