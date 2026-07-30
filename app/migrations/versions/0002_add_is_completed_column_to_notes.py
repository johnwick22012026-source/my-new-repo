"""Add is_completed column to notes table

Revision ID: 0002_add_is_completed_column_to_notes
Revises: 0001_initial
Create Date: 2024-06-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_add_is_completed_column_to_notes'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_completed column with default False
    op.add_column('notes', sa.Column('is_completed', sa.Boolean(), nullable=False, server_default=sa.false()))
    # Remove server_default to clean up
    op.alter_column('notes', 'is_completed', server_default=None)


def downgrade():
    op.drop_column('notes', 'is_completed')
