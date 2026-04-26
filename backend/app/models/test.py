from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Test(Base):
    __tablename__ = "tests"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="created_tests")
    document = relationship("Document", back_populates="tests")
    questions = relationship("TestQuestion", back_populates="test", cascade="all, delete-orphan")
    test_results = relationship("TestResult", back_populates="test")

class TestQuestion(Base):
    __tablename__ = "test_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of strings: ["Option A", "Option B", ...]
    correct_option_index = Column(Integer, nullable=False)
    points = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    test = relationship("Test", back_populates="questions")
