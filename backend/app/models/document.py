from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    subject = Column(String(100), nullable=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(20), nullable=False)
    status = Column(String(20), default="active")  # active, archived
    is_public = Column(Boolean, default=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    uploader = relationship("User", back_populates="documents")
    shares = relationship("DocumentShare", back_populates="document")
    comments = relationship("Discussion", back_populates="document")
    summary = relationship("Summary", back_populates="document", uselist=False)
    mindmap = relationship("Mindmap", back_populates="document", uselist=False)
    flashcard_sets = relationship("FlashcardSet", back_populates="document")
    tests = relationship("Test", back_populates="document")
    ingestion = relationship("DocumentIngestion", back_populates="document", uselist=False, cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    concepts = relationship("DocumentConcept", back_populates="document", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="document", cascade="all, delete-orphan")
