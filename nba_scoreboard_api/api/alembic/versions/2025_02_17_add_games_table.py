"""add games table

Revision ID: 2025_02_17_games
Revises: 2025_02_17_initial
Create Date: 2025-02-17 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '2025_02_17_games'
down_revision = '2025_02_17_initial'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create games table
    op.create_table(
        'games',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('game_id', sa.String(), nullable=False),
        sa.Column('game_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.Integer(), nullable=False),
        sa.Column('period', sa.Integer(), default=0),
        sa.Column('clock', sa.String()),
        
        # Home team info
        sa.Column('home_team_id', sa.String(), nullable=False),
        sa.Column('home_team_name', sa.String(), nullable=False),
        sa.Column('home_team_city', sa.String(), nullable=False),
        sa.Column('home_team_tricode', sa.String(), nullable=False),
        sa.Column('home_team_score', sa.Integer(), default=0),
        
        # Away team info
        sa.Column('away_team_id', sa.String(), nullable=False),
        sa.Column('away_team_name', sa.String(), nullable=False),
        sa.Column('away_team_city', sa.String(), nullable=False),
        sa.Column('away_team_tricode', sa.String(), nullable=False),
        sa.Column('away_team_score', sa.Integer(), default=0),
        
        # Venue info
        sa.Column('arena', sa.String()),
        sa.Column('city', sa.String()),
        sa.Column('state', sa.String()),
        sa.Column('country', sa.String()),
        
        # Metadata
        sa.Column('updated_at', sa.DateTime(), nullable=False, 
                 default=datetime.utcnow, onupdate=datetime.utcnow),
        
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('game_id')
    )
    
    # Create indexes
    op.create_index(
        'ix_games_game_id',
        'games',
        ['game_id'],
        unique=True
    )
    op.create_index(
        'ix_games_date_status',
        'games',
        ['game_date', 'status']
    )

def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_games_date_status', table_name='games')
    op.drop_index('ix_games_game_id', table_name='games')
    
    # Drop games table
    op.drop_table('games')