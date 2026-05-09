import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.utils import create_user, login_user, get_auth_headers
from app.models.flashcard import FlashcardSet as FlashcardSetModel, Flashcard as FlashcardModel

@pytest.fixture
def auth_headers(client: TestClient, db_session: Session):
    email = "test@example.com"
    create_user(db_session, email)
    token = login_user(client, email)
    return get_auth_headers(token)

def test_create_flashcard_set(client: TestClient, db_session: Session, auth_headers: dict):
    data = {
        "title": "Test Set",
        "description": "Test Description",
        "subject": "Test Subject"
    }
    response = client.post("/api/v1/flashcards/sets/", json=data, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["title"] == data["title"]
    assert response.json()["owner_id"] is not None

def test_list_flashcard_sets(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set first
    client.post("/api/v1/flashcards/sets/", json={"title": "Set 1"}, headers=auth_headers)
    
    response = client.get("/api/v1/flashcards/sets/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_get_flashcard_set(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set
    create_res = client.post("/api/v1/flashcards/sets/", json={"title": "Get Set"}, headers=auth_headers)
    set_id = create_res.json()["id"]
    
    response = client.get(f"/api/v1/flashcards/sets/{set_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Get Set"

def test_update_flashcard_set(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set
    create_res = client.post("/api/v1/flashcards/sets/", json={"title": "Old Title"}, headers=auth_headers)
    set_id = create_res.json()["id"]
    
    data = {"title": "New Title"}
    response = client.put(f"/api/v1/flashcards/sets/{set_id}", json=data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "New Title"

def test_delete_flashcard_set(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set
    create_res = client.post("/api/v1/flashcards/sets/", json={"title": "Delete Set"}, headers=auth_headers)
    set_id = create_res.json()["id"]
    
    response = client.delete(f"/api/v1/flashcards/sets/{set_id}", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify it's gone
    get_res = client.get(f"/api/v1/flashcards/sets/{set_id}", headers=auth_headers)
    assert get_res.status_code == 404

def test_create_flashcard(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set first
    create_set = client.post("/api/v1/flashcards/sets/", json={"title": "Card Set"}, headers=auth_headers)
    set_id = create_set.json()["id"]
    
    data = {
        "set_id": set_id,
        "front": "Question",
        "back": "Answer"
    }
    response = client.post("/api/v1/flashcards/", json=data, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["front"] == "Question"
    assert response.json()["set_id"] == set_id

def test_list_flashcards(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set and a card
    create_set = client.post("/api/v1/flashcards/sets/", json={"title": "List Card Set"}, headers=auth_headers)
    set_id = create_set.json()["id"]
    client.post("/api/v1/flashcards/", json={"set_id": set_id, "front": "F1", "back": "B1"}, headers=auth_headers)
    
    response = client.get(f"/api/v1/flashcards/?set_id={set_id}", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["front"] == "F1"

def test_bulk_create_flashcards(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set
    create_set = client.post("/api/v1/flashcards/sets/", json={"title": "Bulk Set"}, headers=auth_headers)
    set_id = create_set.json()["id"]
    
    data = {
        "set_id": set_id,
        "flashcards": [
            {"front": "Q1", "back": "A1"},
            {"front": "Q2", "back": "A2"}
        ],
        "clear_existing": True
    }
    response = client.post("/api/v1/flashcards/bulk", json=data, headers=auth_headers)
    assert response.status_code == 201
    assert len(response.json()) == 2

def test_update_flashcard(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set and card
    create_set = client.post("/api/v1/flashcards/sets/", json={"title": "Update Card Set"}, headers=auth_headers)
    set_id = create_set.json()["id"]
    create_card = client.post("/api/v1/flashcards/", json={"set_id": set_id, "front": "Old Q", "back": "Old A"}, headers=auth_headers)
    card_id = create_card.json()["id"]
    
    data = {"front": "New Q", "mastery_level": 1}
    response = client.put(f"/api/v1/flashcards/{card_id}", json=data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["front"] == "New Q"
    assert response.json()["mastery_level"] == 1
    assert response.json()["last_reviewed"] is not None

def test_delete_flashcard(client: TestClient, db_session: Session, auth_headers: dict):
    # Create a set and card
    create_set = client.post("/api/v1/flashcards/sets/", json={"title": "Delete Card Set"}, headers=auth_headers)
    set_id = create_set.json()["id"]
    create_card = client.post("/api/v1/flashcards/", json={"set_id": set_id, "front": "To Delete", "back": "..."} , headers=auth_headers)
    card_id = create_card.json()["id"]
    
    response = client.delete(f"/api/v1/flashcards/{card_id}", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify it's gone
    list_res = client.get(f"/api/v1/flashcards/?set_id={set_id}", headers=auth_headers)
    assert len(list_res.json()) == 0

def test_reset_flashcard_set_progress(client: TestClient, db_session: Session, auth_headers: dict):
    # Create set and card with progress
    create_set = client.post("/api/v1/flashcards/sets/", json={"title": "Reset Set"}, headers=auth_headers)
    set_id = create_set.json()["id"]
    create_card = client.post("/api/v1/flashcards/", json={"set_id": set_id, "front": "Q", "back": "A"}, headers=auth_headers)
    card_id = create_card.json()["id"]
    
    # Give it some progress
    client.put(f"/api/v1/flashcards/{card_id}", json={"mastery_level": 3, "status": "reviewing"}, headers=auth_headers)
    
    # Reset
    response = client.post(f"/api/v1/flashcards/sets/{set_id}/reset", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify reset
    list_res = client.get(f"/api/v1/flashcards/?set_id={set_id}", headers=auth_headers)
    card = list_res.json()[0]
    assert card["mastery_level"] == 0
    assert card["status"] == "new"
    assert card["last_reviewed"] is None
