import cv2
import numpy as np
from ultralytics import YOLO

# Standard 3D model points of head features
# Nose, Left Eye, Right Eye, Left Ear, Right Ear
model_points_5 = np.array([
    (0.0, 0.0, 0.0),             # Nose
    (-65.0, 50.0, -80.0),        # Left Eye
    (65.0, 50.0, -80.0),         # Right Eye
    (-130.0, 0.0, -180.0),       # Left Ear
    (130.0, 0.0, -180.0)         # Right Ear
], dtype=np.float32)

model = YOLO("yolo11n-pose.pt")
results = model.track(
    source="/home/saran/project/TrackZen/backend/models/test/Copy of Hafidz 2 Store-Turning to Shelf-8.mp4",
    tracker="bytetrack.yaml",
    persist=True,
    stream=True
)

for i, r in enumerate(results):
    frame_idx = i + 1
    if r.keypoints is not None and len(r.keypoints) > 0 and r.boxes.id is not None:
        kpts = r.keypoints.data.cpu().numpy()
        for p_idx, person_kpts in enumerate(kpts):
            # Keypoints: 0: nose, 1: left_eye, 2: right_eye, 3: left_ear, 4: right_ear
            kp_5 = person_kpts[0:5] # Shape (5, 3)
            
            # Check if all 5 keypoints are high confidence
            if all(kp[2] > 0.5 for kp in kp_5):
                image_points = kp_5[:, 0:2].astype(np.float32)
                
                # Approximate camera matrix
                width = r.orig_img.shape[1]
                height = r.orig_img.shape[0]
                focal_length = width
                center = (width / 2, height / 2)
                camera_matrix = np.array([
                    [focal_length, 0, center[0]],
                    [0, focal_length, center[1]],
                    [0, 0, 1]
                ], dtype=np.float32)
                
                dist_coeffs = np.zeros((4, 1))
                
                success, rvec, tvec = cv2.solvePnP(
                    model_points_5, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
                )
                
                if success:
                    # Convert to Euler angles
                    rmat, _ = cv2.Rodriguez(rvec)
                    proj_matrix = np.hstack((rmat, tvec))
                    _, _, _, _, _, _, euler_angles = cv2.decomposeProjectionMatrix(proj_matrix)
                    
                    pitch = euler_angles[0].item()
                    yaw = euler_angles[1].item()
                    roll = euler_angles[2].item()
                    
                    print(f"Frame {frame_idx}: Yaw={yaw:.2f}, Pitch={pitch:.2f}, Roll={roll:.2f}")
                    
    if frame_idx >= 50:
        break
