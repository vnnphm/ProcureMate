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
    op.create_table(
        'department_budgets',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('department', sa.String(length=100), nullable=False),
        sa.Column('fiscal_year', sa.Integer(), nullable=False),
        sa.Column('total_budget', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('department', 'fiscal_year'),
        sa.UniqueConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('department_budgets')
