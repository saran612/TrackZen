import cv2
from ultralytics import YOLO

model = YOLO("yolo11n-pose.pt")
results = model.track(
    source="/home/saran/project/TrackZen/backend/models/test/Copy of Hafidz 2 Store-Touching-8.mp4",
    tracker="bytetrack.yaml",
    persist=True,
    stream=True
)

print("Starting analysis...")
for i, r in enumerate(results):
    frame_idx = i + 1
    if r.keypoints is not None and len(r.keypoints) > 0:
        kpts = r.keypoints.data.cpu().numpy()
        for p_idx, person_kpts in enumerate(kpts):
            left_wrist = person_kpts[9]
            right_wrist = person_kpts[10]
            lw_x, lw_y, lw_conf = left_wrist
            rw_x, rw_y, rw_conf = right_wrist
            # Only print when high confidence and active movement
            if (lw_conf > 0.6 and 1000 < lw_x < 3000) or (rw_conf > 0.6 and 1000 < rw_x < 3000):
                print(f"Frame {frame_idx}: LW=({lw_x:.1f}, {lw_y:.1f}, conf={lw_conf:.2f}), RW=({rw_x:.1f}, {rw_y:.1f}, conf={rw_conf:.2f})")
