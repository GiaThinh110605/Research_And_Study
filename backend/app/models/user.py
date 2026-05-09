from sqlalchemy import Column, Integer, String, DateTime, Enum, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    LECTURER = "LECTURER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    student_code = Column(String(20), nullable=True)
    lecturer_code = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="uploader")
    created_tests = relationship("Test", back_populates="creator")
    test_results = relationship("TestResult", back_populates="student")
    sent_shares = relationship("DocumentShare", foreign_keys="[DocumentShare.shared_by_id]", back_populates="shared_by")
    received_shares = relationship("DocumentShare", foreign_keys="[DocumentShare.shared_to_id]", back_populates="shared_to")
    flashcard_sets = relationship("FlashcardSet", back_populates="owner")
    discussions = relationship("Discussion", back_populates="user")
    grades = relationship("StudentGrade", back_populates="student")
    questions = relationship("Question", back_populates="user")
