"""merge_heads

Revision ID: 5fdb453e4252
Revises: 06dbd28ca974, add_user_cols_001
Create Date: 2026-05-04 06:01:48.635656

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5fdb453e4252'
down_revision = ('06dbd28ca974', 'add_user_cols_001')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
