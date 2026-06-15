"""add request more info

Revision ID: 9b2d7f4e1c3a
Revises: 82701e9dafbb
Create Date: 2026-06-10 15:45:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9b2d7f4e1c3a"
down_revision: str | Sequence[str] | None = "82701e9dafbb"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE purchase_request_status ADD VALUE IF NOT EXISTS 'NEEDS_INFO'")
    op.add_column(
        "purchase_requests",
        sa.Column("info_request_message", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("purchase_requests", "info_request_message")
