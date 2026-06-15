"""add department budgets

Revision ID: 5e3ffa2be7c9
Revises: 8ad5e544caee
Create Date: 2026-06-10 23:21:05.939111

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e3ffa2be7c9'
down_revision: Union[str, Sequence[str], None] = '8ad5e544caee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
