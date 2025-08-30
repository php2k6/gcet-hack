"""fix_null_radius_values

Revision ID: c3e7e3a4eeb2
Revises: 995d85039e5b
Create Date: 2025-08-30 08:20:09.639199

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3e7e3a4eeb2'
down_revision: Union[str, Sequence[str], None] = '995d85039e5b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Fix NULL radius values by setting them to default 500."""
    # Update all NULL radius values to 500
    op.execute("UPDATE issues SET radius = 500 WHERE radius IS NULL")


def downgrade() -> None:
    """Downgrade: Set default radius values back to NULL (not recommended)."""
    # This downgrade is not recommended as it could break the application
    # but provided for completeness
    op.execute("UPDATE issues SET radius = NULL WHERE radius = 500")
    pass
