"""add requester_id to purchase_requests

Revision ID: 6342045a1eb4
Revises: d7839b605453
Create Date: 2026-06-12 00:38:38.571911

"""
from alembic import op
import sqlalchemy as sa

revision: str = '6342045a1eb4'
down_revision: str = 'd7839b605453'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('purchase_requests', sa.Column('requester_id', sa.Integer(), nullable=True))
    op.create_index('ix_purchase_requests_requester_id', 'purchase_requests', ['requester_id'])
    op.create_foreign_key(None, 'purchase_requests', 'user', ['requester_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint(None, 'purchase_requests', type_='foreignkey')
    op.drop_index('ix_purchase_requests_requester_id', table_name='purchase_requests')
    op.drop_column('purchase_requests', 'requester_id')
