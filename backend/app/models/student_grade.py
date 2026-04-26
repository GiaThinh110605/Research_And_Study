from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class StudentGrade(Base):
    __tablename__ = "student_grades"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_name = Column(String(100), nullable=False)
    score = Column(Float, nullable=False)  # Grade in 10 scale
    credits = Column(Integer, default=1)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=True)
    semester = Column(String(20), nullable=True)
    source_type = Column(String(20), default="manual")  # test, manual
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    student = relationship("User", back_populates="grades")
    test = relationship("Test")
