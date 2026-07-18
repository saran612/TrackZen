import os
from collections import Counter

def is_point_in_polygon(x, y, polygon):
    """
    Ray casting point-in-polygon test.
    """
    inside = False
    n = len(polygon)
    for i in range(n):
        x1, y1 = polygon[i]
        x2, y2 = polygon[(i + 1) % n]
        if min(y1, y2) < y <= max(y1, y2):
            if x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-9) + x1:
                inside = True
    return inside

def merge_intervals(intervals):
    """
    Merge overlapping intervals to avoid double-counting durations.
    intervals: list of [start, end]
    """
    if not intervals:
        return []
    # Sort by start frame
    sorted_intervals = sorted(intervals, key=lambda x: x[0])
    merged = [sorted_intervals[0]]
    for current in sorted_intervals[1:]:
        prev_start, prev_end = merged[-1]
        curr_start, curr_end = current
        if curr_start <= prev_end:
            # Overlap, merge them
            merged[-1][1] = max(prev_end, curr_end)
        else:
            merged.append(current)
    return merged

def compute_interaction_dwell_conversion(
    tracking_results: list,
    shelf_zones: list,
    touch_events: list,
    action_events: list,
    fps: float = 15.15,
    state_machine = None
) -> dict:
    """
    Perform deep analytical calculation of visitor dwell times, interaction counts,
    and conversion insights (attention, conversion, rejection).
    
    CRITICAL WARNING & HARD CONSTRAINT:
    The conversion metrics computed here (converted, rejected) are BEHAVIORAL PROXIES 
    (based on product pickup/return actions detected in video) and NOT verified point-of-sale 
    purchase data. Dwell times are lower-bound estimates due to motion-triggered, 120-degree 
    CCTV coverage constraints.
    
    Args:
        tracking_results: List of frame-level detection dicts containing {track_id, bbox, frame_number, timestamp}.
        shelf_zones: List of defined shelf zones containing {name, polygon}.
        touch_events: List of completed touch events from touch_detection.
        action_events: List of completed action events from action_recognition.
        fps: Frames per second of the video.
        
    Returns:
        A dictionary containing:
            - "per_person": list of records per (track_id, shelf_id)
            - "per_shelf": list of records per shelf_id
    """
    # 1. Compute Zone Visits and Dwell Time from tracking_results
    # Group detections by track_id
    detections_by_track = {}
    for d in tracking_results:
        t_id = d["track_id"]
        if t_id not in detections_by_track:
            detections_by_track[t_id] = []
        detections_by_track[t_id].append(d)

    # Calculate entry/exit cycles (visits) per track_id per shelf
    visits = {}  # key: (track_id, shelf_name) -> list of [entry_frame, exit_frame]
    
    for t_id, dets in detections_by_track.items():
        # Sort detections chronologically
        dets_sorted = sorted(dets, key=lambda x: x["frame_number"])
        
        for zone in shelf_zones:
            shelf_name = zone["name"]
            in_zone_frames = []
            
            for d in dets_sorted:
                bbox = d["bbox"]
                # Use bottom center (feet/standing point) of bounding box for spatial test
                bx = (bbox[0] + bbox[2]) / 2.0
                by = bbox[3]
                
                if is_point_in_polygon(bx, by, zone["polygon"]):
                    in_zone_frames.append(d["frame_number"])
                    
            if not in_zone_frames:
                continue
                
            # Segment frames into distinct visits with a tolerance gap of 15 frames (~1 sec)
            zone_visits = []
            start_f = in_zone_frames[0]
            prev_f = in_zone_frames[0]
            
            for f in in_zone_frames[1:]:
                if f - prev_f > 15:
                    # Visit ended
                    zone_visits.append([start_f, prev_f])
                    start_f = f
                prev_f = f
            zone_visits.append([start_f, prev_f])
            
            visits[(t_id, shelf_name)] = zone_visits

    # 2. Compute Pick-up & Interaction Metrics
    unique_track_ids = set([t_id for t_id, _ in visits.keys()])
    per_person = []
    
    # Track-shelf interaction map
    for (t_id, shelf_name), zone_visits in visits.items():
        # Dwell Time calculations
        visit_count = len(zone_visits)
        total_dwell_sec = sum((vis[1] - vis[0] + 1) / fps for vis in zone_visits)
        avg_dwell_sec = total_dwell_sec / visit_count if visit_count > 0 else 0.0

        # Filter touch events for this track and shelf
        track_touches = [te for te in touch_events if te["track_id"] == t_id and te["shelf_id"] == shelf_name]
        touch_count = len(track_touches)
        
        # Filter action events for this track and shelf
        track_actions = [ae for ae in action_events if ae["track_id"] == t_id and ae["shelf_id"] == shelf_name]
        
        # Count pick-ups (Picking and Putting + Picking and Returning)
        pickup_actions = [ae for ae in track_actions if ae["action_class"] in ["Picking and Putting", "Picking and Returning"]]
        pickup_count = len(pickup_actions)
        
        # Determine dominant hand
        hands = [te["hand_used"] for te in track_touches if te.get("hand_used")]
        dominant_hand = Counter(hands).most_common(1)[0][0] if hands else "Unknown"
        
        # Find first/last interaction frames
        all_interact_frames = []
        for te in track_touches:
            all_interact_frames.extend([te["start_frame"], te["end_frame"]])
        for ae in track_actions:
            all_interact_frames.extend([ae["start_frame"], ae["end_frame"]])
            
        first_interact = min(all_interact_frames) if all_interact_frames else None
        last_interact = max(all_interact_frames) if all_interact_frames else None
        
        # Compute active interaction duration (union of Touch + active action intervals)
        intervals = []
        for te in track_touches:
            intervals.append([te["start_frame"], te["end_frame"]])
        for ae in track_actions:
            if ae["action_class"] in ["Touching", "Picking and Putting", "Picking and Returning"]:
                intervals.append([ae["start_frame"], ae["end_frame"]])
                
        merged = merge_intervals(intervals)
        interaction_duration_sec = sum((interval[1] - interval[0] + 1) / fps for interval in merged)

        # 3. Conversion Insights (mutually exclusive)
        put_count = sum(1 for ae in track_actions if ae["action_class"] == "Picking and Putting")
        ret_count = sum(1 for ae in track_actions if ae["action_class"] == "Picking and Returning")
        
        attention_only = False
        converted = False
        rejected = False
        
        if pickup_count == 0:
            attention_only = True
        elif put_count > ret_count:
            converted = True
        else:
            rejected = True

        # Get state machine totals if available
        total_no_interaction_sec = 0.0
        total_dwell_sec_sm = total_dwell_sec
        total_examining_sec = 0.0
        total_interaction_sec = interaction_duration_sec
        dominant_state = "No Interaction"
        
        if state_machine:
            totals = state_machine.get_session_totals(t_id, shelf_name)
            if totals:
                total_no_interaction_sec = totals.get("total_no_interaction_sec", 0.0)
                total_dwell_sec_sm = totals.get("total_dwell_sec", 0.0)
                total_examining_sec = totals.get("total_examining_sec", 0.0)
                total_interaction_sec = totals.get("total_interaction_sec", 0.0)
                dominant_state = totals.get("dominant_state", "No Interaction")

        per_person.append({
            "track_id": t_id,
            "shelf_id": shelf_name,
            "touch_count": touch_count,
            "pickup_count": pickup_count,
            "interaction_duration_sec": round(interaction_duration_sec, 2),
            "hand_used": dominant_hand,
            "total_dwell_sec": round(total_dwell_sec, 2),
            "visit_count": visit_count,
            "avg_dwell_sec": round(avg_dwell_sec, 2),
            "attention_only": attention_only,
            "converted": converted,
            "rejected": rejected,
            "first_interaction_frame": first_interact,
            "last_interaction_frame": last_interact,
            # State Machine session totals
            "total_no_interaction_sec": total_no_interaction_sec,
            "total_dwell_sec_sm": total_dwell_sec_sm,
            "total_examining_sec": total_examining_sec,
            "total_interaction_sec": total_interaction_sec,
            "dominant_state": dominant_state
        })

    # 4. Compute Shelf-level Aggregates
    per_shelf = []
    for zone in shelf_zones:
        shelf_name = zone["name"]
        shelf_persons = [p for p in per_person if p["shelf_id"] == shelf_name]
        
        unique_visitors = len(set(p["track_id"] for p in shelf_persons))
        
        # Counts for ratio
        att_cnt = sum(1 for p in shelf_persons if p["attention_only"])
        conv_cnt = sum(1 for p in shelf_persons if p["converted"])
        rej_cnt = sum(1 for p in shelf_persons if p["rejected"])
        
        total_valid = att_cnt + conv_cnt + rej_cnt
        conversion_ratio = conv_cnt / total_valid if total_valid > 0 else 0.0
        
        avg_dwell_shelf = sum(p["total_dwell_sec"] for p in shelf_persons) / unique_visitors if unique_visitors > 0 else 0.0
        total_touches = sum(p["touch_count"] for p in shelf_persons)
        total_pickups = sum(p["pickup_count"] for p in shelf_persons)
        
        per_shelf.append({
            "shelf_id": shelf_name,
            "unique_visitors": unique_visitors,
            "conversion_ratio": round(conversion_ratio, 3),
            "avg_dwell_sec_shelf": round(avg_dwell_shelf, 2),
            "total_touch_events": total_touches,
            "total_pickup_events": total_pickups
        })

    # 5. Print Concise Console Summary
    print("\n" + "="*50)
    print("RETAIL ENGAGEMENT & CONVERSION ANALYTICS")
    print("="*50)
    print("NOTE: Conversion metrics are BEHAVIORAL PROXIES (pickup without return)")
    print("and NOT verified point-of-sale transaction data.")
    print("Dwell times are lower-bound constraints.")
    print("-"*50)
    
    if per_shelf:
        most_conv = max(per_shelf, key=lambda s: s["conversion_ratio"])
        least_conv = min(per_shelf, key=lambda s: s["conversion_ratio"])
        max_dwell = max(per_shelf, key=lambda s: s["avg_dwell_sec_shelf"])
        
        print(f"Most Converting Shelf: {most_conv['shelf_id']} ({round(most_conv['conversion_ratio']*100, 1)}% conv)")
        print(f"Least Converting Shelf: {least_conv['shelf_id']} ({round(least_conv['conversion_ratio']*100, 1)}% conv)")
        print(f"Highest Dwell Leader: {max_dwell['shelf_id']} ({max_dwell['avg_dwell_sec_shelf']}s avg)")
        print(f"Total Touch Events: {sum(s['total_touch_events'] for s in per_shelf)}")
        print(f"Total Pick-up Events: {sum(s['total_pickup_events'] for s in per_shelf)}")
    else:
        print("No shelf interactions detected.")
    print("="*50 + "\n")

    return {
        "per_person": per_person,
        "per_shelf": per_shelf
    }
