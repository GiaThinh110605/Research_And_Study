from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Highlight(Base):
    __tablename__ = "highlights"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    text_content = Column(Text, nullable=False)
    color = Column(String(50), default="yellow")
    note = Column(Text, nullable=True)
    page_number = Column(Integer, default=1)  # Thêm page_number
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    document = relationship("Document", backref="highlights")
    user = relationship("User", backref="highlights")
