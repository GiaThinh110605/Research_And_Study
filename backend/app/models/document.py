from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    is_public = Column(Boolean, default=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    uploader = relationship("User", back_populates="documents")
    shares = relationship("DocumentShare", back_populates="document")
    questions = relationship("Question", back_populates="document")
    summary = relationship("Summary", back_populates="document", uselist=False)
    mindmap = relationship("Mindmap", back_populates="document", uselist=False)
    flashcards = relationship("Flashcard", back_populates="document")
    highlights = relationship("Highlight", back_populates="document")
    tests = relationship("Test", back_populates="document")
    discussions = relationship("Discussion", back_populates="document")
