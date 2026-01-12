"""add_user_approvers_table

Revision ID: 001a602cfa4d
Revises: 02e80ec63613
Create Date: 2026-01-12 10:05:30.885127

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001a602cfa4d'
down_revision: Union[str, None] = '02e80ec63613'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user_approvers',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('approver_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['approver_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'approver_id')
    )


def downgrade() -> None:
    op.drop_table('user_approvers')
