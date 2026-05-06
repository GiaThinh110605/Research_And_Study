from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base


class DocumentChunkEmbedding(Base):
    __tablename__ = "document_chunk_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(Integer, ForeignKey("document_chunks.id"), nullable=False, index=True)
    model = Column(String(100), nullable=False)
    dim = Column(Integer, nullable=False)
    vector = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chunk = relationship("DocumentChunk", back_populates="embeddings")
