"""Add document ingestion pipeline

Revision ID: a1b2c3d4e5f6
Revises: optimize_db_001
Create Date: 2026-05-06 10:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "a1b2c3d4e5f6"
down_revision = "optimize_db_001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "document_ingestions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=True),
        sa.Column("progress", sa.Float(), nullable=True),
        sa.Column("last_event", sa.String(length=100), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("chunks_count", sa.Integer(), nullable=True),
        sa.Column("concepts_count", sa.Integer(), nullable=True),
        sa.Column("quiz_test_id", sa.Integer(), nullable=True),
        sa.Column("summary_id", sa.Integer(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ),
        sa.ForeignKeyConstraint(["quiz_test_id"], ["tests.id"], ),
        sa.ForeignKeyConstraint(["summary_id"], ["summaries.id"], ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("document_id", name="uq_document_ingestion"),
    )
    op.create_index("idx_document_ingestion_document", "document_ingestions", ["document_id"])

    op.create_table(
        "document_chunks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("start_offset", sa.Integer(), nullable=True),
        sa.Column("end_offset", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_document_chunks_document", "document_chunks", ["document_id"])

    op.create_table(
        "document_concepts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=30), nullable=True),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_document_concepts_document", "document_concepts", ["document_id"])


def downgrade():
    op.drop_index("idx_document_concepts_document", table_name="document_concepts")
    op.drop_table("document_concepts")
    op.drop_index("idx_document_chunks_document", table_name="document_chunks")
    op.drop_table("document_chunks")
    op.drop_index("idx_document_ingestion_document", table_name="document_ingestions")
    op.drop_table("document_ingestions")
