"""Add completed and completion_timestamp columns to notes table

Revision ID: 0004_add_completed_and_completion_timestamp_columns
Revises: 0003_add_completed_and_completion_timestamp_to_notes
Create Date: 2024-06-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004_add_completed_and_completion_timestamp_columns'
down_revision = '0003_add_completed_and_completion_timestamp_to_notes'
branch_labels = None
depends_on = None

def upgrade():
    # This migration is not needed because columns already exist from previous migration
    pass

def downgrade():
    # This migration is not needed because columns already exist from previous migration
    pass
