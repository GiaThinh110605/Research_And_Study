"""Optimize database structure

Revision ID: optimize_db_001
Revises: 3b1c85f767aa
Create Date: 2026-04-27 09:48:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'optimize_db_001'
down_revision = 'ef67499f27b7'
branch_labels = None
depends_on = None

def upgrade():
    # Add missing indexes
    op.create_index('idx_document_uploader', 'documents', ['uploader_id'])
    op.create_index('idx_document_subject', 'documents', ['subject'])
    op.create_index('idx_document_public', 'documents', ['is_public'])
    op.create_index('idx_test_result_user', 'test_results', ['user_id'])
    op.create_index('idx_test_result_test', 'test_results', ['test_id'])
    
    # Add soft delete to base tables
    op.add_column('users', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('documents', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tests', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add missing fields to document_shares
    op.add_column('document_shares', sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('document_shares', sa.Column('access_count', sa.Integer(), default=0))
    
    # Create flashcard_progress table
    op.create_table('flashcard_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('flashcard_id', sa.Integer(), nullable=False),
        sa.Column('last_reviewed', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('review_count', sa.Integer(), default=0),
        sa.Column('difficulty_rating', sa.Integer(), default=0),
        sa.Column('next_review', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['flashcard_id'], ['flashcards.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_flashcard_progress_user', 'flashcard_progress', ['user_id'])
    op.create_index('idx_flashcard_progress_flashcard', 'flashcard_progress', ['flashcard_id'])

def downgrade():
    # Remove flashcard_progress table
    op.drop_table('flashcard_progress')
    
    # Remove added columns
    op.drop_column('document_shares', 'access_count')
    op.drop_column('document_shares', 'expires_at')
    op.drop_column('tests', 'deleted_at')
    op.drop_column('documents', 'deleted_at')
    op.drop_column('users', 'deleted_at')
    
    # Remove indexes
    op.drop_index('idx_test_result_test', table_name='test_results')
    op.drop_index('idx_test_result_user', table_name='test_results')
    op.drop_index('idx_document_public', table_name='documents')
    op.drop_index('idx_document_subject', table_name='documents')
    op.drop_index('idx_document_uploader', table_name='documents')
