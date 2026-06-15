"""add policy flags

Revision ID: 8ad5e544caee
Revises: 57d69691e7b3
Create Date: 2026-06-10 19:25:39.438089

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ad5e544caee'
down_revision: Union[str, Sequence[str], None] = '57d69691e7b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('purchase_requests', sa.Column('policy_flags', sa.JSON(), nullable=False, server_default='[]'))


def downgrade() -> None:
    op.drop_column('purchase_requests', 'policy_flags')
