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
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    # Add username column to users table
    if 'username' not in columns:
        op.add_column('users', sa.Column('username', sa.String(length=50), nullable=False))
    
    # Add missing columns to match the model
    if 'student_code' not in columns:
        op.add_column('users', sa.Column('student_code', sa.String(length=20), nullable=True))
    if 'lecturer_code' not in columns:
        op.add_column('users', sa.Column('lecturer_code', sa.String(length=20), nullable=True))
    if 'is_active' not in columns:
        op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True, default=True))
    
    # Create unique index on username if index doesn't exist
    indexes = [idx['name'] for idx in inspector.get_indexes('users')]
    if 'ix_users_username' not in indexes:
        op.create_index('ix_users_username', 'users', ['username'], unique=True)

def downgrade():
    # Remove username column and index
    op.drop_index('ix_users_username', table_name='users')
    op.drop_column('users', 'username')
    op.drop_column('users', 'student_code')
    op.drop_column('users', 'lecturer_code')
    op.drop_column('users', 'is_active')
