from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, Integer, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class MatchOutcome(Base):
    """
    MATCH OUTCOMES TABLE: The foundation for the AI feedback loop.
    Records whether a suggested match was accepted, rejected, or successful.
    """
    __tablename__ = 'match_outcomes'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, index=True, nullable=False)
    donor_id = Column(String, index=True, nullable=False)
    hospital_id = Column(String, index=True, nullable=False)
    
    # AI Metadata
    rank_shown = Column(Integer)
    ai_score_at_time = Column(Float)
    model_version = Column(String)
    
    # Decisions
    was_selected = Column(Boolean, default=False)
    action_taken_at = Column(DateTime)
    
    # Outcome Status: ['rejected', 'accepted', 'transplanted', 'organ_discarded', 'graft_failure']
    status = Column(String, default='offered')
    rejection_reason = Column(String)
    
    # Long-term clinical feedback (for re-training)
    graft_survival_days = Column(Integer)
    complications_noted = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_outcome_table_sql():
    """Returns the raw SQL for creating the outcomes table in Supabase/PostgreSQL."""
    return """
    CREATE TABLE IF NOT EXISTS match_outcomes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        request_id UUID NOT NULL,
        donor_id UUID NOT NULL,
        hospital_id UUID NOT NULL,
        rank_shown INTEGER,
        ai_score_at_time FLOAT,
        model_version VARCHAR(50),
        was_selected BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'offered',
        rejection_reason TEXT,
        graft_survival_days INTEGER,
        complications_noted JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Index for faster retrieval during re-training
    CREATE INDEX idx_match_outcome_status ON match_outcomes(status);
    """
