import cv2
from ultralytics import YOLO

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
            kp_5 = person_kpts[0:5]
            confs = [kp[2] for kp in kp_5]
            print(f"Frame {frame_idx}: Confidences={confs}")
    if frame_idx >= 150:
        break
