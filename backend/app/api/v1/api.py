from fastapi import APIRouter
from app.api.v1.routes import auth, users, questions, discussions, tests, flashcards, gpa, documents, highlights, ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
api_router.include_router(gpa.router, prefix="/gpa", tags=["gpa"])
api_router.include_router(tests.router, prefix="/tests", tags=["tests"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(discussions.router, prefix="/discussions", tags=["discussions"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(highlights.router, prefix="/highlights", tags=["highlights"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
