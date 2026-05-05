"""Add ingestion options to documents

Revision ID: add_ingestion_options_001
Revises: fix_model_cons_001
Create Date: 2026-05-05 10:15:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_ingestion_options_001'
down_revision = 'fix_model_cons_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('documents', sa.Column('ingestion_status', sa.String(length=20), server_default=sa.text("'ready'"), nullable=False))
    op.add_column('documents', sa.Column('auto_summary', sa.Boolean(), server_default=sa.text('true'), nullable=False))
    op.add_column('documents', sa.Column('auto_quiz', sa.Boolean(), server_default=sa.text('true'), nullable=False))


def downgrade() -> None:
    op.drop_column('documents', 'auto_quiz')
    op.drop_column('documents', 'auto_summary')
    op.drop_column('documents', 'ingestion_status')
