from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from uuid import UUID

class MatchRequest(BaseModel):
    hospital_id: UUID
    required_blood_type: str
    required_organ: Optional[str] = None
    urgency_level: Literal["low", "medium", "critical"]
    max_distance_km: float = Field(default=50.0)

class MatchResponse(BaseModel):
    id: UUID
    full_name: str
    blood_type: str
    distance_km: float
    city: str
    phone: str
    
class MatchResults(BaseModel):
    matches: List[MatchResponse]
    message: str
