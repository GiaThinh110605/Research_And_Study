"""Ensure ingestion tables exist

Revision ID: ensure_ingestion_001
Revises: merge_ingestion_heads_001
Create Date: 2026-05-06 12:40:00.000000

"""
from alembic import op

# revision identifiers
revision = "ensure_ingestion_001"
down_revision = "merge_ingestion_heads_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS document_ingestions (
            id SERIAL PRIMARY KEY,
            document_id INTEGER NOT NULL UNIQUE REFERENCES documents(id),
            status VARCHAR(30),
            progress FLOAT,
            last_event VARCHAR(100),
            error_message TEXT,
            chunks_count INTEGER,
            concepts_count INTEGER,
            quiz_test_id INTEGER REFERENCES tests(id),
            summary_id INTEGER REFERENCES summaries(id),
            started_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_document_ingestion_document ON document_ingestions (document_id);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS document_chunks (
            id SERIAL PRIMARY KEY,
            document_id INTEGER NOT NULL REFERENCES documents(id),
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            start_offset INTEGER,
            end_offset INTEGER,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_document_chunks_document ON document_chunks (document_id);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS document_concepts (
            id SERIAL PRIMARY KEY,
            document_id INTEGER NOT NULL REFERENCES documents(id),
            label VARCHAR(255) NOT NULL,
            category VARCHAR(30),
            score FLOAT,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_document_concepts_document ON document_concepts (document_id);")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS document_concepts;")
    op.execute("DROP TABLE IF EXISTS document_chunks;")
    op.execute("DROP TABLE IF EXISTS document_ingestions;")
