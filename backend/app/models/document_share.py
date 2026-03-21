from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class DocumentShare(Base):
    __tablename__ = "document_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    shared_with_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    permission = Column(String, nullable=False)  # view, edit, comment
    status = Column(String, default="pending")  # pending, approved, rejected
    shared_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="shares")
    shared_with = relationship("User", back_populates="received_shares")
