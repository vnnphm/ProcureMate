"""add role to user

Revision ID: d7839b605453
Revises: fdfd8652ecad
Create Date: 2026-06-11 19:33:17.074563

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7839b605453'
down_revision: str = 'fdfd8652ecad'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('role', sa.String(length=20), nullable=False, server_default='requester'))


def downgrade() -> None:
    op.drop_column('user', 'role')
