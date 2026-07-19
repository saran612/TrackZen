from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.schemas.zone import Zone


class DwellSessionBase(BaseModel):
    track_id: int
    zone_id: int
    enter_time: datetime
    exit_time: Optional[datetime] = None
    dwell_time: float = 0.0
    engagement_score: float = 0.0


class DwellSessionCreate(DwellSessionBase):
    pass


class DwellSessionUpdate(BaseModel):
    exit_time: Optional[datetime] = None
    dwell_time: Optional[float] = None
    engagement_score: Optional[float] = None


class DwellSessionInDB(DwellSessionBase):
    id: int

    class Config:
        from_attributes = True


class DwellSession(DwellSessionInDB):
    zone: Optional[Zone] = None


class AnalyticsOverview(BaseModel):
    total_visits: int
    average_dwell_time: float
    total_dwell_time: float
    average_engagement_score: float
    visits_by_zone: dict
