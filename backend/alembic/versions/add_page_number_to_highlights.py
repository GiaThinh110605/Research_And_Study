"""Add page_number to highlights table

Revision ID: add_page_number_highlights
Revises: ensure_ingestion_001
Create Date: 2026-05-06

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_page_number_highlights'
down_revision = 'ensure_ingestion_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Postgres-safe & idempotent migration.
    # Avoid try/except around DDL because a failed statement aborts the whole transaction.
    op.execute("ALTER TABLE highlights ADD COLUMN IF NOT EXISTS page_number INTEGER")
    op.execute("UPDATE highlights SET page_number = 1 WHERE page_number IS NULL")
    op.execute("ALTER TABLE highlights ALTER COLUMN page_number SET DEFAULT 1")
    op.execute("ALTER TABLE highlights ALTER COLUMN page_number SET NOT NULL")


def downgrade() -> None:
    op.execute("ALTER TABLE highlights DROP COLUMN IF EXISTS page_number")
