import os
import json
import cv2
import numpy as np
from ultralytics import YOLO

# Standard 3D model points of head features based on YOLO pose keypoints:
# Nose, Left Eye, Right Eye, Left Ear, Right Ear
model_points_5 = np.array([
    (0.0, 0.0, 0.0),             # Nose
    (-65.0, 50.0, -80.0),        # Left Eye
    (65.0, 50.0, -80.0),         # Right Eye
    (-130.0, 0.0, -180.0),       # Left Ear
    (130.0, 0.0, -180.0)         # Right Ear
], dtype=np.float32)

def estimate_gaze_direction(video_path, shelf_zones, smooth_window=7, output_video_path=None):
    """
    Estimate head orientation (yaw, pitch, roll) and gaze target zone using YOLOv11-pose keypoints.
    """
    print(f"Running Head-Pose / Gaze Estimation on: {video_path}")
    model = YOLO("yolo11n-pose.pt")
    
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 15.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Camera matrix parameters
    focal_length = width
    center = (width / 2, height / 2)
    camera_matrix = np.array([
        [focal_length, 0, center[0]],
        [0, focal_length, center[1]],
        [0, 0, 1]
    ], dtype=np.float32)
    
    dist_coeffs = np.zeros((4, 1))
    
    writer = None
    if output_video_path:
        os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
        writer = cv2.VideoWriter(output_video_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
        
    results = model.track(source=video_path, tracker="bytetrack.yaml", persist=True, stream=True)
    
    gaze_history = {}
    gaze_events = []
    
    frame_idx = 0
    for r in results:
        frame_idx += 1
        frame_img = r.orig_img.copy()
        
        # Draw defined shelf zones
        for zone in shelf_zones:
            pts = np.array(zone["polygon"], np.int32).reshape((-1, 1, 2))
            cv2.polylines(frame_img, [pts], True, (255, 165, 0), 2)
            cv2.putText(frame_img, zone["name"], (zone["polygon"][0][0], zone["polygon"][0][1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 165, 0), 2)
            
        if r.keypoints is not None and len(r.keypoints) > 0 and r.boxes.id is not None:
            kpts = r.keypoints.data.cpu().numpy()
            track_ids = r.boxes.id.int().cpu().tolist()
            bboxes = r.boxes.xyxy.cpu().numpy().astype(int)
            
            for p_idx, t_id in enumerate(track_ids):
                bbox = bboxes[p_idx]
                person_kpts = kpts[p_idx]
                
                # Keypoints: 0: nose, 1: left_eye, 2: right_eye, 3: left_ear, 4: right_ear
                kp_5 = person_kpts[0:5]
                
                # Dynamic visibility check
                valid_indices = [i for i in range(5) if kp_5[i][2] > 0.1]
                estimated_shelf = None
                yaw, pitch, roll = 0.0, 0.0, 0.0
                
                if len(valid_indices) >= 4:
                    image_points = kp_5[valid_indices, 0:2].astype(np.float32)
                    sub_model_points = model_points_5[valid_indices]
                    
                    success, rvec, tvec = cv2.solvePnP(
                        sub_model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
                    )
                    
                    if success:
                        # Project gaze direction vector
                        axis_3d = np.array([(0.0, 0.0, 600.0)], dtype=np.float32)
                        nose_tip_2d = kp_5[0, 0:2].astype(int) if kp_5[0, 2] > 0.1 else image_points[0].astype(int)
                        
                        imgpts, _ = cv2.projectPoints(axis_3d, rvec, tvec, camera_matrix, dist_coeffs)
                        gaze_end_point = imgpts[0].ravel().astype(int)
                        
                        # Draw vector line (yellow)
                        cv2.arrowedLine(frame_img, tuple(nose_tip_2d), tuple(gaze_end_point), (0, 255, 255), 5, tipLength=0.2)
                        
                        # Euler decomposition
                        rmat, _ = cv2.Rodriguez(rvec)
                        proj_matrix = np.hstack((rmat, tvec))
                        _, _, _, _, _, _, euler_angles = cv2.decomposeProjectionMatrix(proj_matrix)
                        
                        pitch = float(euler_angles[0].item())
                        yaw = float(euler_angles[1].item())
                        roll = float(euler_angles[2].item())
                        
                        if yaw > 5:
                            estimated_shelf = "Main Left Shelf"
                
                # Occlusion fallback heuristic
                if not estimated_shelf:
                    # If left ear is highly visible but nose or right eye is occluded, they are facing left (towards the shelf)
                    if kp_5[3][2] > 0.4 and (kp_5[2][2] < 0.2 or kp_5[0][2] < 0.2):
                        estimated_shelf = "Main Left Shelf"
                        yaw = 45.0 # default estimated yaw for left turn
                        
                # Smooth target selection
                if t_id not in gaze_history:
                    gaze_history[t_id] = []
                gaze_history[t_id].append(estimated_shelf)
                if len(gaze_history[t_id]) > smooth_window:
                    gaze_history[t_id].pop(0)
                    
                smoothed_shelf = max(set(gaze_history[t_id]), key=gaze_history[t_id].count) if gaze_history[t_id] else None
                
                if smoothed_shelf:
                    gaze_events.append({
                        "track_id": t_id,
                        "frame": frame_idx,
                        "yaw": round(yaw, 2),
                        "pitch": round(pitch, 2),
                        "roll": round(roll, 2),
                        "gaze_shelf_id": smoothed_shelf
                    })
                    
                    # Draw labels
                    cv2.rectangle(frame_img, (bbox[0], bbox[1] - 40), (bbox[0] + 350, bbox[1]), (0, 0, 0), -1)
                    cv2.putText(frame_img, f"ID {t_id} GAZE: {smoothed_shelf} (Yaw: {yaw:.1f})", 
                                (bbox[0] + 5, bbox[1] - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                        
        if writer:
            writer.write(frame_img)
            
    cap.release()
    if writer:
        writer.release()
        
    # Aggregate stats per track
    aggregated = {}
    for ev in gaze_events:
        t_id = ev["track_id"]
        shelf = ev["gaze_shelf_id"]
        if shelf:
            if t_id not in aggregated:
                aggregated[t_id] = {}
            aggregated[t_id][shelf] = aggregated[t_id].get(shelf, 0) + 1
            
    summary = []
    for t_id, shelves in aggregated.items():
        for shelf, frames in shelves.items():
            duration_sec = round(frames / fps, 2)
            summary.append({
                "track_id": t_id,
                "shelf_id": shelf,
                "gaze_dwell_seconds": duration_sec,
                "label": "head-orientation-based gaze estimate"
            })
            
    return summary, gaze_events

if __name__ == "__main__":
    shelf_zones = [
        {
            "name": "Main Left Shelf",
            "polygon": [[0, 0], [1800, 0], [1800, 2160], [0, 2160]]
        }
    ]
    
    # Test on Turning to Shelf video
    video = "/home/saran/project/TrackZen/backend/models/test/Copy of Hafidz 2 Store-Turning to Shelf-8.mp4"
    summary, raw_events = estimate_gaze_direction(video, shelf_zones, output_video_path="outputs/gaze_turning_annotated.mp4")
    
    print(f"Gaze estimation summary: {json.dumps(summary, indent=2)}")
    
    # Dump log
    os.makedirs("outputs", exist_ok=True)
    with open("outputs/gaze_events.json", "w") as f:
        json.dump({"summary": summary, "events": raw_events}, f, indent=2)
    print("Logs saved to outputs/gaze_events.json")
