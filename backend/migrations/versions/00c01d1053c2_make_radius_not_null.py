"""make_radius_not_null

Revision ID: 00c01d1053c2
Revises: c3e7e3a4eeb2
Create Date: 2025-08-30 08:20:34.689764

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '00c01d1053c2'
down_revision: Union[str, Sequence[str], None] = 'c3e7e3a4eeb2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Make radius column NOT NULL with default 500."""
    # Add NOT NULL constraint to radius column with default value
    op.alter_column('issues', 'radius',
                    existing_type=sa.INTEGER(),
                    nullable=False,
                    server_default='500')


def downgrade() -> None:
    """Make radius column nullable again."""
    # Remove NOT NULL constraint from radius column
    op.alter_column('issues', 'radius',
                    existing_type=sa.INTEGER(),
                    nullable=True,
                    server_default=None)
