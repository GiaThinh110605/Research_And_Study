"""Fix model inconsistencies and remove redundant schemas

Revision ID: fix_model_cons_001
Revises: optimize_db_001
Create Date: 2026-04-27 09:51:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'fix_model_cons_001'
down_revision = 'optimize_db_001'
branch_labels = None
depends_on = None

def upgrade():
    # The questions column already exists in tests table from previous migration
    # TestQuestion table doesn't exist in current schema, so no action needed
    pass

def downgrade():
    pass
