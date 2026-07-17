import os
import sys
from ultralytics import YOLO

def run_tracking_pipeline(video_path: str, output_dir: str):
    """
    Run detection + tracking on the input video using YOLOv11 and ByteTrack.
    """
    print(f"Loading YOLOv11 model (yolo11n.pt)...")
    # This automatically downloads yolo11n.pt if not present locally
    model = YOLO("yolo11n.pt")

    print(f"Starting tracking on: {video_path}")
    # Run tracking. persist=True, classes=[0] (person only), tracker='bytetrack.yaml'
    # stream=True returns a generator for memory-efficient frame-by-frame processing
    results = model.track(
        source=video_path,
        tracker="bytetrack.yaml",
        persist=True,
        classes=[0],
        stream=True
    )

    unique_track_ids = set()
    total_people_detected = 0
    frame_count = 0
    low_confidence_frames = []

    # Iterate over the generator to process frame-by-frame and collect stats
    for i, r in enumerate(results):
        frame_idx = i + 1
        frame_count += 1
        
        boxes = r.boxes
        if boxes is None or len(boxes) == 0:
            print(f"Frame {frame_idx}: 0 people detected.")
            continue

        # Extract coordinates, confidence, and track IDs
        xyxy = boxes.xyxy.cpu().numpy()
        conf = boxes.conf.cpu().numpy()
        
        # Track IDs might not be present in early frames before tracking is initialized
        track_ids = boxes.id.int().cpu().tolist() if boxes.id is not None else [None] * len(boxes)

        people_in_frame = len(boxes)
        total_people_detected += people_in_frame
        
        print(f"Frame {frame_idx}: {people_in_frame} people detected.")
        for j, (box, score, t_id) in enumerate(zip(xyxy, conf, track_ids)):
            print(f"  - Track ID: {t_id}, BBox: {[round(c, 1) for c in box]}, Conf: {round(score, 3)}")
            if t_id is not None:
                unique_track_ids.add(t_id)
            if score < 0.4:
                low_confidence_frames.append((frame_idx, t_id, round(score, 3)))

    # Compute stats summary
    avg_people = total_people_detected / frame_count if frame_count > 0 else 0.0
    
    print("\n" + "="*40)
    print("TRACKING PIPELINE RUN SUMMARY")
    print("="*40)
    print(f"Total processed frames: {frame_count}")
    print(f"Total unique track IDs seen: {len(unique_track_ids)}")
    print(f"Average people detected per frame: {round(avg_people, 2)}")
    
    if low_confidence_frames:
        print(f"\nLow confidence detections (<0.4) found in following frames:")
        for frame, t_id, score in low_confidence_frames:
            print(f"  Frame {frame}: Track ID {t_id} (Conf: {score})")
    else:
        print("\nNo low confidence detections (<0.4) detected.")
    print("="*40 + "\n")

    # Let's run a second pass to save the annotated video natively.
    # Note: Ultralytics saves the outputs inside project/name directory.
    # We will locate the output and move it to the requested output directory.
    print("Saving annotated output video...")
    save_results = model.track(
        source=video_path,
        tracker="bytetrack.yaml",
        persist=True,
        classes=[0],
        save=True,
        project="temp_runs",
        name="tracking_run",
        exist_ok=True
    )
    
    # Locate the saved video file
    temp_dir = os.path.join("runs", "detect", "temp_runs", "tracking_run")
    if not os.path.exists(temp_dir):
        temp_dir = os.path.join("..", "runs", "detect", "temp_runs", "tracking_run")
    
    if os.path.exists(temp_dir):
        saved_files = [f for f in os.listdir(temp_dir) if f.endswith((".avi", ".mp4", ".mkv"))]
    else:
        saved_files = []
    if saved_files:
        temp_video_path = os.path.join(temp_dir, saved_files[0])
        # Determine target path
        os.makedirs(output_dir, exist_ok=True)
        final_output_path = os.path.join(output_dir, saved_files[0])
        try:
            shutil.move(temp_video_path, final_output_path)
            print(f"Annotated output video saved successfully to: {final_output_path}")
        except Exception as e:
            # Fallback to copy if move fails across devices
            import shutil
            shutil.copy2(temp_video_path, final_output_path)
            os.remove(temp_video_path)
            print(f"Annotated output video saved successfully to: {final_output_path}")
            
        # Clean up temp run directory
        try:
            runs_root = os.path.dirname(os.path.dirname(os.path.dirname(temp_dir)))
            shutil.rmtree(runs_root)
        except:
            pass
    else:
        print("Error: Could not locate the saved annotated video.")

if __name__ == "__main__":
    # Check command line args
    video = sys.argv[1] if len(sys.argv) > 1 else "/home/saran/project/TrackZen/backend/models/train/Copy of Hafidz 2 Store-Picking and Putting-1.mp4"
    
    # Try to write to /mnt/user-data/outputs/, fallback to workspace outputs/
    output_dir = "/mnt/user-data/outputs"
    try:
        os.makedirs(output_dir, exist_ok=True)
        # Test write permission
        test_file = os.path.join(output_dir, "test_write.txt")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
    except Exception:
        output_dir = "/home/saran/project/TrackZen/backend/outputs"
        print(f"Warning: /mnt/user-data/outputs/ is not writable. Falling back to workspace: {output_dir}")

    import shutil
    run_tracking_pipeline(video, output_dir)
