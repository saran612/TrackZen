from typing import List, Optional
from pydantic import BaseModel


class ZoneBase(BaseModel):
    name: str
    description: Optional[str] = None
    polygon_coordinates: List[List[float]]


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(ZoneBase):
    name: Optional[str] = None
    polygon_coordinates: Optional[List[List[float]]] = None


class ZoneInDBBase(ZoneBase):
    id: int

    class Config:
        from_attributes = True


class Zone(ZoneInDBBase):
    pass
