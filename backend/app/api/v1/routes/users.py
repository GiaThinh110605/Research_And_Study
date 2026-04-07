from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_current_active_admin
from app.models.base import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate, UserUpdateByAdmin
from app.core.security import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[UserOut])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Retrieve users. (Admin only)
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user information.
    """
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update own profile.
    """
    if update_data.email:
        user = db.query(User).filter(User.email == update_data.email).first()
        if user and user.id != current_user.id:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system",
            )
            
    user_data = update_data.dict(exclude_unset=True)
    if "password" in user_data:
        user_data["password_hash"] = get_password_hash(user_data.pop("password"))
        
    for field, value in user_data.items():
        setattr(current_user, field, value)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserOut)
def read_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    update_data: UserUpdateByAdmin,
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Update a user. (Admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update_data.email:
        existing_user = db.query(User).filter(User.email == update_data.email).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system",
            )
            
    user_data = update_data.dict(exclude_unset=True)
    if "password" in user_data:
        user_data["password_hash"] = get_password_hash(user_data.pop("password"))
        
    for field, value in user_data.items():
        setattr(user, field, value)
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=UserOut)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Delete a user. (Admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Users cannot delete themselves")
        
    db.delete(user)
    db.commit()
    return user
