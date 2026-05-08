from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any
import secrets
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.models.base import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, Token, SocialLogin
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email or username already exists",
        )
    
    db_user = User(
        email=user_in.email,
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        student_code=user_in.student_code,
        lecturer_code=user_in.lecturer_code,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    # Allow login with either email or username
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}

@router.post("/google", response_model=Token)
async def login_google(social_in: SocialLogin, db: Session = Depends(get_db)) -> Any:
    # Verify Google Access Token
    url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {social_in.token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        data = response.json()
        
    if response.status_code != 200 or "error" in data:
        raise HTTPException(status_code=400, detail="Invalid Google token")
        
    email = data.get("email")
    full_name = data.get("name")
    
    if not email:
        raise HTTPException(status_code=400, detail="No email provided by Google")
        
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Auto-register
        random_password = secrets.token_urlsafe(16)
        username = email.split('@')[0]
        
        # ensure username uniqueness
        base_username = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
            
        user = User(
            email=email,
            username=username,
            password_hash=get_password_hash(random_password),
            full_name=full_name or username,
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/facebook", response_model=Token)
async def login_facebook(social_in: SocialLogin, db: Session = Depends(get_db)) -> Any:
    # Verify Facebook Token
    url = f"https://graph.facebook.com/me?fields=id,name,email&access_token={social_in.token}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        
    if "error" in data:
        raise HTTPException(status_code=400, detail="Invalid Facebook token")
        
    email = data.get("email")
    full_name = data.get("name")
    
    if not email:
        fb_id = data.get("id")
        if not fb_id:
            raise HTTPException(status_code=400, detail="Invalid Facebook account data")
        email = f"{fb_id}@facebook.com"
        
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Auto-register
        random_password = secrets.token_urlsafe(16)
        username = email.split('@')[0]
        
        base_username = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
            
        user = User(
            email=email,
            username=username,
            password_hash=get_password_hash(random_password),
            full_name=full_name or username,
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
