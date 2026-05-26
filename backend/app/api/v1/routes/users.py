from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_current_active_admin
from app.models.base import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserOut, UserUpdate, UserUpdateByAdmin, UserCreate, PasswordChange
from app.core.security import get_password_hash, verify_password

router = APIRouter()

@router.get("/search", response_model=List[UserOut])
def search_users(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Search users by email or username.
    """
    users = db.query(User).filter(
        (~User.username.startswith("deleted_")) &
        ((User.email.ilike(f"%{q}%")) | (User.username.ilike(f"%{q}%")))
    ).limit(10).all()
    return users

@router.post("/", response_model=UserOut)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Create new user. (Admin only)
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Also check username if provided
    if user_in.username:
        user_username = db.query(User).filter(User.username == user_in.username).first()
        if user_username:
            raise HTTPException(
                status_code=400,
                detail="The user with this username already exists in the system.",
            )

    db_user = User(
        email=user_in.email,
        username=user_in.username or user_in.email,
        full_name=user_in.full_name,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role or UserRole.STUDENT,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

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
    users = db.query(User).filter(~User.username.startswith("deleted_")).offset(skip).limit(limit).all()
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

@router.post("/change-password")
def change_password(
    *,
    db: Session = Depends(get_db),
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Change own password.
    """
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không chính xác",
        )
    
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Mật khẩu đã được thay đổi thành công"}

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
    if user.id != current_user.id and current_user.role != UserRole.ADMIN:
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
    Soft-delete: anonymize user data and deactivate account.
    Removes all FK-constrained related records first to avoid constraint violations.
    """
    from sqlalchemy import text
    import uuid

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Không thể xóa chính tài khoản đang đăng nhập")

    try:
        # Xóa tất cả dữ liệu liên quan để tránh FK constraint violations
        db.execute(text("DELETE FROM discussion_reactions WHERE user_id = :uid"), {"uid": user_id})
        db.execute(text("DELETE FROM test_results WHERE student_id = :uid"), {"uid": user_id})
        db.execute(text("DELETE FROM student_grades WHERE student_id = :uid"), {"uid": user_id})
        # Delete individual flashcards belonging to this user's sets first to avoid FK violations
        db.execute(text("DELETE FROM flashcards WHERE set_id IN (SELECT id FROM flashcard_sets WHERE owner_id = :uid)"), {"uid": user_id})
        db.execute(text("DELETE FROM flashcard_sets WHERE owner_id = :uid"), {"uid": user_id})
        db.execute(text("DELETE FROM questions WHERE user_id = :uid"), {"uid": user_id})
        # Xóa các bản ghi chia sẻ tài liệu liên quan đến user
        db.execute(text("DELETE FROM document_shares WHERE shared_by_id = :uid OR shared_to_id = :uid"), {"uid": user_id})
        # Xóa reactions của các discussions thuộc user, rồi xóa chính discussions đó
        db.execute(text("""
            DELETE FROM discussion_reactions
            WHERE discussion_id IN (
                SELECT id FROM discussions WHERE user_id = :uid
            )
        """), {"uid": user_id})
        db.execute(text("DELETE FROM discussions WHERE user_id = :uid"), {"uid": user_id})

        # Soft-delete: ẩn danh hóa thông tin user bằng raw SQL (tránh SQLAlchemy cascade)
        uid = uuid.uuid4().hex[:8]
        db.execute(text("""
            UPDATE users
            SET email = :email,
                username = :username,
                full_name = :full_name,
                is_active = false
            WHERE id = :user_id
        """), {
            "email": f"deleted_{user_id}_{uid}@example.com",
            "username": f"deleted_{user_id}_{uid}",
            "full_name": "Tài khoản đã xóa",
            "user_id": user_id,
        })

        db.commit()
        db.refresh(user)
        return user

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Không thể xóa người dùng: {str(e)}")
