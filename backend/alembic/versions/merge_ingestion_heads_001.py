"""Merge ingestion pipeline head

Revision ID: merge_ingestion_heads_001
Revises: 5fdb453e4252, a1b2c3d4e5f6
Create Date: 2026-05-06 11:06:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "merge_ingestion_heads_001"
down_revision = ("5fdb453e4252", "a1b2c3d4e5f6")
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
