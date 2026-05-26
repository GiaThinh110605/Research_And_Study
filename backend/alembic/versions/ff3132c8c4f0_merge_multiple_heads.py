"""merge multiple heads

Revision ID: ff3132c8c4f0
Revises: a2b3c4d5e6f7, add_discussion_reactions_001
Create Date: 2026-05-26 13:23:12.230082

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ff3132c8c4f0'
down_revision = ('a2b3c4d5e6f7', 'add_discussion_reactions_001')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
