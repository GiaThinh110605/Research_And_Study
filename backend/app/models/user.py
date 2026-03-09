from sqlalchemy import Column, Integer, String, DateTime, Enum
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
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="uploader")
    questions = relationship("Question", back_populates="user")
    created_quizzes = relationship("Quiz", back_populates="creator")
    quiz_results = relationship("QuizResult", back_populates="student")
