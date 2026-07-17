from fastapi import APIRouter
from app.api.v1.endpoints import zones, analytics

api_router = APIRouter()
api_router.include_router(zones.router, prefix="/zones", tags=["zones"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
