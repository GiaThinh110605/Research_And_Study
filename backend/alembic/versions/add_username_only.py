"""Add username column to users table only

Revision ID: add_username_001
Revises: fix_model_cons_001
Create Date: 2026-04-27 09:58:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_username_001'
down_revision = 'fix_model_cons_001'
branch_labels = None
depends_on = None

def upgrade():
    # Add username column to users table
    op.add_column('users', sa.Column('username', sa.String(length=50), nullable=False))
    
    # Add missing columns to match the model
    op.add_column('users', sa.Column('student_code', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('lecturer_code', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True, default=True))
    
    # Create unique index on username
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

def downgrade():
    # Remove username column and index
    op.drop_index('ix_users_username', table_name='users')
    op.drop_column('users', 'username')
    op.drop_column('users', 'student_code')
    op.drop_column('users', 'lecturer_code')
    op.drop_column('users', 'is_active')
