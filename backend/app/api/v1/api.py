from fastapi import APIRouter
from app.api.v1.routes import auth, users, questions, discussions

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(discussions.router, prefix="/discussions", tags=["discussions"])
