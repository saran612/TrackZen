from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime


class DwellSession(Base):
    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, index=True, nullable=False)  # Pedestrian tracker track_id
    zone_id = Column(Integer, ForeignKey("zone.id"), nullable=False)
    enter_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    exit_time = Column(DateTime, nullable=True)
    dwell_time = Column(Float, default=0.0)  # in seconds
    engagement_score = Column(Float, default=0.0)  # Calculated score (based on formulation)

    zone = relationship("Zone")
