from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app import models, schemas
from app.services.analytics import calculate_engagement_score
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/overview", response_model=schemas.AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(deps.get_db)):
    sessions = db.query(models.DwellSession).all()
    zones = db.query(models.Zone).all()
    
    total_visits = len(sessions)
    total_dwell = sum(s.dwell_time for s in sessions)
    avg_dwell = total_dwell / total_visits if total_visits > 0 else 0.0
    avg_engagement = sum(s.engagement_score for s in sessions) / total_visits if total_visits > 0 else 0.0
    
    zone_mapping = {z.id: z.name for z in zones}
    visits_by_zone = {}
    for s in sessions:
        z_name = zone_mapping.get(s.zone_id, f"Zone {s.zone_id}")
        visits_by_zone[z_name] = visits_by_zone.get(z_name, 0) + 1
        
    return schemas.AnalyticsOverview(
        total_visits=total_visits,
        average_dwell_time=round(avg_dwell, 2),
        total_dwell_time=round(total_dwell, 2),
        average_engagement_score=round(avg_engagement, 3),
        visits_by_zone=visits_by_zone
    )


@router.get("/sessions", response_model=List[schemas.DwellSession])
def read_sessions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
):
    return db.query(models.DwellSession).offset(skip).limit(limit).all()


@router.post("/sessions", response_model=schemas.DwellSession)
def log_dwell_session(
    *,
    db: Session = Depends(deps.get_db),
    track_id: int,
    zone_id: int,
    dwell_time: float,
    proximity_index: float = 0.8,
    revisit_count: int = 1
):
    # Compute Engagement Score dynamically
    engagement_score = calculate_engagement_score(
        dwell_time=dwell_time,
        proximity_index=proximity_index,
        revisit_count=revisit_count
    )
    
    enter_time = datetime.utcnow() - timedelta(seconds=dwell_time)
    exit_time = datetime.utcnow()
    
    session = models.DwellSession(
        track_id=track_id,
        zone_id=zone_id,
        enter_time=enter_time,
        exit_time=exit_time,
        dwell_time=dwell_time,
        engagement_score=engagement_score
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
