from sqlalchemy import Column, Integer, String, DateTime, Enum, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    LECTURER = "lecturer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    student_id = Column(String, nullable=True)
    gpa = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="uploader")
    questions = relationship("Question", back_populates="user")
    created_tests = relationship("Test", back_populates="creator")
    test_results = relationship("TestResult", back_populates="student")
    received_shares = relationship("DocumentShare", back_populates="shared_with")
    flashcards = relationship("Flashcard", back_populates="user")
    highlights = relationship("Highlight", back_populates="user")
    discussions = relationship("Discussion", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
    external_searches = relationship("ExternalSearch", back_populates="user")
    calculator_logs = relationship("CalculatorLog", back_populates="user")
    plagiarism_reports = relationship("PlagiarismReport", back_populates="detected_by")
