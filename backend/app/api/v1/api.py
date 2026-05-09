from fastapi import APIRouter
from app.api.v1.routes import auth, users, discussions, tests, flashcards, documents, ai, dashboard, activities, grades, gpa

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
api_router.include_router(tests.router, prefix="/tests", tags=["tests"])
api_router.include_router(grades.router, prefix="/grades", tags=["grades"])
api_router.include_router(discussions.router, prefix="/discussions", tags=["discussions"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(activities.router, prefix="/activities", tags=["activities"])
api_router.include_router(gpa.router, prefix="/gpa", tags=["gpa"])
