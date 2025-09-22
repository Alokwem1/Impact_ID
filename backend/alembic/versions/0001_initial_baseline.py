"""Initial baseline schema

Revision ID: 0001_initial_baseline
Revises: 
Create Date: 2025-09-19
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial_baseline'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Baseline stamp only: schema already exists (generated from models via create_tables())
    pass

def downgrade() -> None:
    # Baseline has nothing to downgrade.
    pass
