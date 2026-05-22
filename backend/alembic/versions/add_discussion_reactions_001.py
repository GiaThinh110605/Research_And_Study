"""Add discussion reactions

Revision ID: add_discussion_reactions_001
Revises: ensure_ingestion_001
Create Date: 2026-05-22 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "add_discussion_reactions_001"
down_revision = "ensure_ingestion_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "discussion_reactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("discussion_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("emoji", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["discussion_id"], ["discussions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("discussion_id", "user_id", name="uq_discussion_reaction_user"),
    )
    op.create_index("ix_discussion_reactions_id", "discussion_reactions", ["id"], unique=False)
    op.create_index(
        "ix_discussion_reactions_discussion",
        "discussion_reactions",
        ["discussion_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_discussion_reactions_discussion", table_name="discussion_reactions")
    op.drop_index("ix_discussion_reactions_id", table_name="discussion_reactions")
    op.drop_table("discussion_reactions")
