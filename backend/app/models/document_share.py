from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class DocumentShare(Base):
    __tablename__ = "document_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    shared_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shared_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    permission = Column(String, default="view")  # view, edit, comment
    status = Column(String, default="approved")  # pending, approved, rejected
    message = Column(Text, nullable=True)
    shared_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="shares")
    shared_by = relationship("User", foreign_keys=[shared_by_id], back_populates="sent_shares")
    shared_to = relationship("User", foreign_keys=[shared_to_id], back_populates="received_shares")
