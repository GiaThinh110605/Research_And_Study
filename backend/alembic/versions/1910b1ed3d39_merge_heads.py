"""merge heads

Revision ID: 1910b1ed3d39
Revises: 5fdb453e4252, add_ingestion_options_001
Create Date: 2026-05-05 17:15:07.405451

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1910b1ed3d39'
down_revision = ('5fdb453e4252', 'add_ingestion_options_001')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
