from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base


class DocumentConcept(Base):
    __tablename__ = "document_concepts"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    label = Column(String(255), nullable=False)
    category = Column(String(30), default="basic")  # basic, advanced, applied
    score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="concepts")
