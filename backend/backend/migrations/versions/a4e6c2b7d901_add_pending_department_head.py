"""add pending department head status

Revision ID: a4e6c2b7d901
Revises: f759be3cc038
Create Date: 2026-06-10 16:35:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a4e6c2b7d901"
down_revision: str | Sequence[str] | None = "f759be3cc038"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE purchase_request_status ADD VALUE IF NOT EXISTS 'PENDING_DEPARTMENT_HEAD'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
