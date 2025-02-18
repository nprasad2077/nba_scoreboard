# alembic/versions/2025_02_17_initial_tables.py
"""initial tables

Revision ID: 2025_02_17_initial
Create Date: 2024-02-17 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = '2025_02_17_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create players table
    op.create_table(
        'players',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('person_id', sa.Integer(), nullable=True),
        sa.Column('display_name', sa.String(), nullable=True),
        sa.Column('team_name', sa.String(), nullable=True),
        sa.Column('team_abbreviation', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('person_id')
    )
    op.create_index(op.f('ix_players_person_id'), 'players', ['person_id'], unique=True)

    # Create team standings table
    op.create_table(
        'team_standings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=True),
        sa.Column('team_city', sa.String(), nullable=True),
        sa.Column('team_name', sa.String(), nullable=True),
        sa.Column('conference', sa.String(), nullable=True),
        sa.Column('division', sa.String(), nullable=True),
        sa.Column('wins', sa.Integer(), nullable=True),
        sa.Column('losses', sa.Integer(), nullable=True),
        sa.Column('win_pct', sa.Float(), nullable=True),
        sa.Column('games_back', sa.Float(), nullable=True),
        sa.Column('conference_rank', sa.Integer(), nullable=True),
        sa.Column('division_rank', sa.Integer(), nullable=True),
        sa.Column('home_record', sa.String(), nullable=True),
        sa.Column('road_record', sa.String(), nullable=True),
        sa.Column('last_ten', sa.String(), nullable=True),
        sa.Column('streak', sa.String(), nullable=True),
        sa.Column('points_pg', sa.Float(), nullable=True),
        sa.Column('opp_points_pg', sa.Float(), nullable=True),
        sa.Column('division_record', sa.String(), nullable=True),
        sa.Column('conference_record', sa.String(), nullable=True),
        sa.Column('vs_east', sa.String(), nullable=True),
        sa.Column('vs_west', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('team_id')
    )
    op.create_index(op.f('ix_team_standings_team_id'), 'team_standings', ['team_id'], unique=True)

def downgrade() -> None:
    # Drop team standings table
    op.drop_index(op.f('ix_team_standings_team_id'), table_name='team_standings')
    op.drop_table('team_standings')
    
    # Drop players table
    op.drop_index(op.f('ix_players_person_id'), table_name='players')
    op.drop_table('players')