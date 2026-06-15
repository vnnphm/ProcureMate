"""add_purchase_request_events

Revision ID: 57d69691e7b3
Revises: a4e6c2b7d901
Create Date: 2026-06-10 17:12:15.470043

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '57d69691e7b3'
down_revision: Union[str, Sequence[str], None] = 'a4e6c2b7d901'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "purchase_request_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("purchase_request_id", sa.Integer(), nullable=False),
        sa.Column("event", sa.String(length=200), nullable=False),
        sa.Column("actor", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["purchase_request_id"],
            ["purchase_requests.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("id"),
    )
    op.create_index(
        "ix_purchase_request_events_request_id",
        "purchase_request_events",
        ["purchase_request_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_purchase_request_events_request_id", table_name="purchase_request_events")
    op.drop_table("purchase_request_events")
