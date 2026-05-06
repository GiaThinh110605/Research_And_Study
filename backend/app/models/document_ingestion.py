from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base


class DocumentIngestion(Base):
    __tablename__ = "document_ingestions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, unique=True)
    status = Column(String(30), default="queued")  # queued, processing, completed, failed
    progress = Column(Float, default=0.0)
    last_event = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    chunks_count = Column(Integer, default=0)
    concepts_count = Column(Integer, default=0)
    quiz_test_id = Column(Integer, ForeignKey("tests.id"), nullable=True)
    summary_id = Column(Integer, ForeignKey("summaries.id"), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    document = relationship("Document", back_populates="ingestion")
    quiz_test = relationship("Test")
    summary = relationship("Summary")
