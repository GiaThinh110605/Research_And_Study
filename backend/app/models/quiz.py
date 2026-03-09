from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="quizzes")
    creator = relationship("User", back_populates="created_quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz")
    results = relationship("QuizResult", back_populates="quiz")
