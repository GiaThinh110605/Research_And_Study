import json
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Mindmap(Base):
    __tablename__ = "mindmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, unique=True)
    _content = Column("content", Text, nullable=False)  # JSON structure
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    @property
    def content(self):
        try:
            return json.loads(self._content)
        except:
            return {}

    @content.setter
    def content(self, value):
        self._content = json.dumps(value)

    # Relationships
    document = relationship("Document", back_populates="mindmap")
