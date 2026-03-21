from fastapi import APIRouter, Depends
from typing import Any

from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter()

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user information.
    """
    return current_user
