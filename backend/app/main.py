from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base_class import Base
from app.db.session import SessionLocal
from app import models
from app.services.analytics import calculate_engagement_score
from datetime import datetime, timedelta
import random
import cv2
import numpy as np
import base64
from ultralytics import YOLO

# Pre-load YOLO pose model for real-time live feed processing
live_model = YOLO("yolo11n-pose.pt")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # 2. Pre-populate mock retail data if DB is empty
    db = SessionLocal()
    try:
        if db.query(models.Zone).count() == 0:
            # Create standard retail zones
            zones = [
                models.Zone(
                    name="Promo Display A",
                    description="Front entrance promotional shelf featuring seasonal items",
                    polygon_coordinates=[[100, 150], [250, 150], [250, 300], [100, 300]]
                ),
                models.Zone(
                    name="Beverage Cooler",
                    description="Grab-and-go cold beverage section",
                    polygon_coordinates=[[400, 50], [550, 50], [550, 200], [400, 200]]
                ),
                models.Zone(
                    name="Snack Aisle 3",
                    description="Middle aisle displaying chips, nuts, and healthy snacks",
                    polygon_coordinates=[[150, 400], [350, 400], [350, 550], [150, 550]]
                ),
            ]
            db.add_all(zones)
            db.commit()
            
            # Prepopulate mock DwellSessions with different engagement scores
            added_zones = db.query(models.Zone).all()
            for i in range(1, 18):  # 17 visitors
                zone = random.choice(added_zones)
                dwell_time = round(random.uniform(5.0, 120.0), 1)  # 5s to 2min
                proximity = round(random.uniform(0.3, 0.95), 2)
                revisit_cnt = random.randint(1, 3)
                
                score = calculate_engagement_score(
                    dwell_time=dwell_time,
                    proximity_index=proximity,
                    revisit_count=revisit_cnt
                )
                
                session = models.DwellSession(
                    track_id=1000 + i,
                    zone_id=zone.id,
                    enter_time=datetime.utcnow() - timedelta(minutes=random.randint(5, 120)),
                    exit_time=datetime.utcnow(),
                    dwell_time=dwell_time,
                    engagement_score=score
                )
                db.add(session)
            db.commit()
    finally:
        db.close()
        
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}

@app.websocket("/api/v1/live-feed")
async def live_feed_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive base64 frame from client
            data = await websocket.receive_text()
            if not data:
                continue
            
            if "," in data:
                header, encoded = data.split(",", 1)
            else:
                encoded = data
                
            img_bytes = base64.b64decode(encoded)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is not None:
                # Run YOLO pose model on the live frame
                results = live_model(img, verbose=False)
                
                # Plot/annotate detections on the image
                annotated_img = results[0].plot()
                
                # Encode back to JPEG base64
                _, buffer = cv2.imencode(".jpg", annotated_img)
                jpg_as_text = base64.b64encode(buffer).decode("utf-8")
                
                # Send back the base64 JPEG
                await websocket.send_text(f"data:image/jpeg;base64,{jpg_as_text}")
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket live-feed error: {e}")
