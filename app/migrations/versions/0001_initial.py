"""Initial migration for notes table

Revision ID: 0001_initial
Revises: 
Create Date: 2024-06-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'notes',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('text', sa.String, nullable=False),
        sa.Column('is_completed', sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    # Remove server_default for is_completed and created_at to clean up
    op.alter_column('notes', 'is_completed', server_default=None)
    op.alter_column('notes', 'created_at', server_default=None)

def downgrade():
    op.drop_table('notes')
