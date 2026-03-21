from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class PlagiarismReport(Base):
    __tablename__ = "plagiarism_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    test_result_id = Column(Integer, ForeignKey("test_results.id"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    details = Column(JSON, nullable=True)  # Detailed plagiarism analysis
    detected_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    test_result = relationship("TestResult", back_populates="plagiarism_reports")
    detected_by = relationship("User", back_populates="plagiarism_reports")
