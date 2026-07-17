from sqlalchemy import Column, Integer, String, JSON
from app.db.base_class import Base


class Zone(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    # Coordinates stored as a list of coordinates, e.g., [[x1, y1], [x2, y2], ...]
    polygon_coordinates = Column(JSON, nullable=False)
