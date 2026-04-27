"""Add remaining user columns to match model

Revision ID: add_user_cols_001
Revises: add_username_001
Create Date: 2026-04-27 09:59:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_user_cols_001'
down_revision = 'add_username_001'
branch_labels = None
depends_on = None

def upgrade():
    # Add missing columns to match the model
    op.add_column('users', sa.Column('student_code', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('lecturer_code', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True, default=True))

def downgrade():
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'lecturer_code')
    op.drop_column('users', 'student_code')
