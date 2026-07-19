from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Zone])
def read_zones(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
):
    zones = db.query(models.Zone).offset(skip).limit(limit).all()
    return zones


@router.post("/", response_model=schemas.Zone)
def create_zone(
    *,
    db: Session = Depends(deps.get_db),
    zone_in: schemas.ZoneCreate
):
    zone = models.Zone(
        name=zone_in.name,
        description=zone_in.description,
        polygon_coordinates=zone_in.polygon_coordinates
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.delete("/{zone_id}", response_model=schemas.Zone)
def delete_zone(
    *,
    db: Session = Depends(deps.get_db),
    zone_id: int
):
    zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return zone
