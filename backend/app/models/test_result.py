from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class TestResult(Base):
    __tablename__ = "test_results"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    answers = Column(JSON, nullable=True)  # Detailed answers
    
    # Relationships
    test = relationship("Test", back_populates="test_results")
    student = relationship("User", back_populates="test_results")
    plagiarism_reports = relationship("PlagiarismReport", back_populates="test_result")
