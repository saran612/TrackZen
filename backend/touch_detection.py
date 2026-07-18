import os
import json
import cv2
import numpy as np
from ultralytics import YOLO

def point_to_segment_distance(px, py, x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return np.hypot(px - x1, py - y1)
    
    t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    
    proj_x = x1 + t * dx
    proj_y = y1 + t * dy
    return np.hypot(px - proj_x, py - proj_y)

def point_to_polygon_distance(px, py, polygon):
    # Ray casting point-in-polygon test
    inside = False
    n = len(polygon)
    for i in range(n):
        x1, y1 = polygon[i]
        x2, y2 = polygon[(i + 1) % n]
        if min(y1, y2) < py <= max(y1, y2):
            if px < (x2 - x1) * (py - y1) / (y2 - y1 + 1e-9) + x1:
                inside = True
    if inside:
        return 0.0
    
    # Minimum edge distance
    min_dist = float('inf')
    for i in range(n):
        x1, y1 = polygon[i]
        x2, y2 = polygon[(i + 1) % n]
        dist = point_to_segment_distance(px, py, x1, y1, x2, y2)
        if dist < min_dist:
            min_dist = dist
    return min_dist

def detect_touch_events(video_path, shelf_zones, dist_threshold=150, consecutive_frames=4, output_video_path=None):
    """
    Detect touch events on defined shelf zones using YOLOv11-pose wrist keypoints.
    """
    print(f"Running Touch Detection on: {video_path}")
    model = YOLO("yolo11n-pose.pt")
    
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 15.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    writer = None
    if output_video_path:
        os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
        writer = cv2.VideoWriter(output_video_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
        
    results = model.track(source=video_path, tracker="bytetrack.yaml", persist=True, stream=True)
    
    # Track states for consecutive touch detection
    # { (track_id, shelf_name): [consecutive_count, start_frame] }
    active_contacts = {}
    completed_events = []
    
    # Keep track of active touches in current frame to detect end of event
    # { (track_id, shelf_name): last_seen_frame }
    last_seen_contacts = {}
    
    frame_idx = 0
    for r in results:
        frame_idx += 1
        frame_img = r.orig_img
        
        # Draw defined shelf zones
        for zone in shelf_zones:
            pts = np.array(zone["polygon"], np.int32).reshape((-1, 1, 2))
            cv2.polylines(frame_img, [pts], True, (255, 165, 0), 3) # Blue-ish/orange boundary
            cv2.putText(frame_img, zone["name"], (zone["polygon"][0][0], zone["polygon"][0][1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 165, 0), 2)
            
        current_frame_touches = set()
        
        if r.keypoints is not None and len(r.keypoints) > 0 and r.boxes.id is not None:
            kpts = r.keypoints.data.cpu().numpy()
            track_ids = r.boxes.id.int().cpu().tolist()
            
            for p_idx, t_id in enumerate(track_ids):
                person_kpts = kpts[p_idx]
                # Keypoint 9 = Left Wrist, Keypoint 10 = Right Wrist
                hands = {
                    "Left": person_kpts[9],
                    "Right": person_kpts[10]
                }
                
                # Draw person bbox and keypoints
                bbox = r.boxes.xyxy[p_idx].cpu().numpy().astype(int)
                cv2.rectangle(frame_img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
                
                for hand_name, kp in hands.items():
                    hx, hy, conf = kp
                    if conf > 0.5:
                        cv2.circle(frame_img, (int(hx), int(hy)), 8, (0, 0, 255), -1) # Red dot for hands
                        
                        # Calculate distance to each shelf zone
                        for zone in shelf_zones:
                            dist = point_to_polygon_distance(hx, hy, zone["polygon"])
                            
                            if dist < dist_threshold:
                                contact_key = (t_id, zone["name"])
                                current_frame_touches.add(contact_key)
                                
                                # Start or increment consecutive count
                                if contact_key not in active_contacts:
                                    active_contacts[contact_key] = [1, frame_idx, hand_name]
                                else:
                                    active_contacts[contact_key][0] += 1
                                    
                                # Visual indicator of active touch
                                if active_contacts[contact_key][0] >= consecutive_frames:
                                    cv2.putText(frame_img, f"TOUCH: ID {t_id} on {zone['name']}", 
                                                (bbox[0], bbox[1] - 10),
                                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                                    # Highlight shelf boundary in solid red
                                    pts = np.array(zone["polygon"], np.int32).reshape((-1, 1, 2))
                                    cv2.polylines(frame_img, [pts], True, (0, 0, 255), 5)
                            
        # Check for completed/ended contacts
        for key in list(active_contacts.keys()):
            t_id, shelf_name = key
            consec_count, start_frame, hand_used = active_contacts[key]
            
            # If not detected touching in this frame
            if key not in current_frame_touches:
                if consec_count >= consecutive_frames:
                    # Save event
                    completed_events.append({
                        "track_id": t_id,
                        "shelf_id": shelf_name,
                        "start_frame": start_frame,
                        "end_frame": frame_idx - 1,
                        "duration_frames": frame_idx - 1 - start_frame,
                        "duration_seconds": round((frame_idx - 1 - start_frame) / fps, 2),
                        "hand_used": hand_used
                    })
                active_contacts.pop(key)
                
        if writer:
            writer.write(frame_img)
            
    # Finalize any ongoing touches at end of video
    for key, (consec_count, start_frame, hand_used) in active_contacts.items():
        if consec_count >= consecutive_frames:
            t_id, shelf_name = key
            completed_events.append({
                "track_id": t_id,
                "shelf_id": shelf_name,
                "start_frame": start_frame,
                "end_frame": frame_idx,
                "duration_frames": frame_idx - start_frame,
                "duration_seconds": round((frame_idx - start_frame) / fps, 2),
                "hand_used": hand_used
            })
            
    cap.release()
    if writer:
        writer.release()
        
    return completed_events

if __name__ == "__main__":
    # Standard shelf polygon for Hafidz 2 Store (Left side shelf area)
    # Target video resolution is 3840x2160
    shelf_zones = [
        {
            "name": "Main Left Shelf",
            "polygon": [[0, 0], [1800, 0], [1800, 2160], [0, 2160]]
        }
    ]
    
    # Test positive clip
    pos_video = "/home/saran/project/TrackZen/backend/models/test/Copy of Hafidz 2 Store-Touching-8.mp4"
    pos_events = detect_touch_events(pos_video, shelf_zones, dist_threshold=180, output_video_path="outputs/touch_positive_annotated.mp4")
    print(f"Positive clip events: {json.dumps(pos_events, indent=2)}")
    
    # Test negative clip
    neg_video = "/home/saran/project/TrackZen/backend/models/test/Copy of Hafidz 2 Store-Turning to Shelf-8.mp4"
    neg_events = detect_touch_events(neg_video, shelf_zones, dist_threshold=180, output_video_path="outputs/touch_negative_annotated.mp4")
    print(f"Negative clip events: {json.dumps(neg_events, indent=2)}")
    
    # Dump structured log
    with open("outputs/touch_events.json", "w") as f:
        json.dump({"positive_clip": pos_events, "negative_clip": neg_events}, f, indent=2)
    print("Logs saved to outputs/touch_events.json")
