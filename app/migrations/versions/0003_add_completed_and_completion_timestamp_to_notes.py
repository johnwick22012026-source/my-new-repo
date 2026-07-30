"""Add completed and completion_timestamp columns to notes table

Revision ID: 0003_add_completed_and_completion_timestamp_to_notes
Revises: 0002_add_is_completed_column_to_notes
Create Date: 2024-06-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_add_completed_and_completion_timestamp_to_notes'
down_revision = '0002_add_is_completed_column_to_notes'
branch_labels = None
depends_on = None

def upgrade():
    # Add completed column with default False
    op.add_column('notes', sa.Column('completed', sa.Boolean(), nullable=False, server_default=sa.false()))
    # Add completion_timestamp column nullable
    op.add_column('notes', sa.Column('completion_timestamp', sa.DateTime(timezone=True), nullable=True))
    # Remove server_default to clean up
    op.alter_column('notes', 'completed', server_default=None)

    # Optional: If you want to migrate existing data from is_completed to completed, you can do it here
    # But since is_completed is being removed, we assume no data migration needed

    # Drop old is_completed column
    op.drop_column('notes', 'is_completed')

def downgrade():
    # Add back is_completed column
    op.add_column('notes', sa.Column('is_completed', sa.Boolean(), nullable=False, server_default=sa.false()))
    # Remove completed and completion_timestamp columns
    op.drop_column('notes', 'completed')
    op.drop_column('notes', 'completion_timestamp')
    # Remove server_default
    op.alter_column('notes', 'is_completed', server_default=None)
