import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.flashcard import FlashcardSet, Flashcard
from tests.utils import create_user, login_user, get_auth_headers

def test_create_flashcard_set(client: TestClient, db_session: Session):
    email = "fset@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    data = {
        "title": "Test Set",
        "subject": "Testing",
        "description": "Desc"
    }
    response = client.post("/api/v1/flashcards/sets/", json=data, headers=get_auth_headers(token))
    assert response.status_code == 201
    assert response.json()["title"] == data["title"]

def test_create_flashcard(client: TestClient, db_session: Session):
    email = "fcard@example.com"
    user = create_user(db_session, email)
    token = login_user(client, email)
    
    fset = FlashcardSet(title="S", owner_id=user.id)
    db_session.add(fset)
    db_session.flush()
    
    data = {
        "set_id": fset.id,
        "front": "Q",
        "back": "A"
    }
    response = client.post("/api/v1/flashcards/", json=data, headers=get_auth_headers(token))
    assert response.status_code == 201
    assert response.json()["front"] == "Q"
