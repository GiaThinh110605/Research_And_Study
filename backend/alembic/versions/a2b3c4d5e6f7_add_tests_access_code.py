"""Add access_code to tests

Revision ID: a2b3c4d5e6f7
Revises: fix_model_cons_001
Create Date: 2026-05-23 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "a2b3c4d5e6f7"
down_revision = "fix_model_cons_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tests", sa.Column("access_code", sa.String(length=10), nullable=True))
    op.create_index("ix_tests_access_code", "tests", ["access_code"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_tests_access_code", table_name="tests")
    op.drop_column("tests", "access_code")
