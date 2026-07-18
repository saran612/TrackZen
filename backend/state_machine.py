import json
from collections import Counter

class ShopperStateMachine:
    def __init__(self, fps=15.15):
        self.fps = fps
        # Map track_id -> state data
        # { track_id: {
        #    "current_state": str,
        #    "current_state_frames": int,
        #    "cumulative_frames": {state: int},
        #    "state_history": list of dict,
        #    "last_raw_state": str,
        #    "consecutive_raw_frames": int,
        #    "start_frame_of_current_state": int
        # } }
        self.tracks = {}

    def get_or_create_track(self, track_id, frame_idx):
        if track_id not in self.tracks:
            self.tracks[track_id] = {
                "current_state": "No Interaction",
                "current_state_frames": 0,
                "cumulative_frames": {
                    "No Interaction": 0,
                    "Dwell": 0,
                    "Examining": 0,
                    "Interaction": 0
                },
                "state_history": [],
                "last_raw_state": "No Interaction",
                "consecutive_raw_frames": 0,
                "start_frame_of_current_state": frame_idx
            }
        return self.tracks[track_id]

    def update(self, track_id, frame_idx, in_zone, touch_active, gaze_active, action_active):
        """
        Update the state machine for a track_id at frame_idx.
        
        Args:
            track_id: Integer tracking ID.
            frame_idx: Integer frame number.
            in_zone: Boolean, is the person inside any shelf/rack zone.
            touch_active: Boolean, is a touch event active.
            gaze_active: Boolean, is a gaze target event active.
            action_active: Boolean, is an action event active (Touching/Picking/Putting/Returning).
            
        Returns:
            Tuple of (smoothed_state, current_state_timer_seconds)
        """
        track = self.get_or_create_track(track_id, frame_idx)

        # 1. Determine raw state based on priority: Interaction > Examining > Dwell > No Interaction
        if in_zone:
            if action_active:
                raw_state = "Interaction"
            elif touch_active or gaze_active:
                raw_state = "Examining"
            else:
                raw_state = "Dwell"
        else:
            raw_state = "No Interaction"

        # 2. Temporal Smoothing (Hysteresis):
        # A state change requires 5 consecutive frames of the new raw state before transitioning.
        if raw_state == track["current_state"]:
            # Reset transition counter
            track["consecutive_raw_frames"] = 0
        else:
            if raw_state == track["last_raw_state"]:
                track["consecutive_raw_frames"] += 1
            else:
                track["consecutive_raw_frames"] = 1
                track["last_raw_state"] = raw_state

            # If the new raw state persists for 5 consecutive frames, execute state transition
            if track["consecutive_raw_frames"] >= 5:
                # Close the old state segment
                old_state = track["current_state"]
                start_f = track["start_frame_of_current_state"]
                end_f = frame_idx - 1
                duration_frames = end_f - start_f + 1
                
                if duration_frames > 0:
                    track["state_history"].append({
                        "state": old_state,
                        "start_frame": start_f,
                        "end_frame": end_f,
                        "start_ts_sec": round(start_f / self.fps, 2),
                        "end_ts_sec": round(end_f / self.fps, 2),
                        "duration_sec": round(duration_frames / self.fps, 2)
                    })

                # Transition to new state
                track["current_state"] = raw_state
                track["current_state_frames"] = track["consecutive_raw_frames"]
                track["start_frame_of_current_state"] = frame_idx - track["consecutive_raw_frames"] + 1
                track["consecutive_raw_frames"] = 0
                track["last_raw_state"] = raw_state

        # 3. Accumulate frames
        current_state = track["current_state"]
        track["current_state_frames"] += 1
        track["cumulative_frames"][current_state] += 1

        # Calculate timer
        timer_sec = round(track["current_state_frames"] / self.fps, 2)
        return current_state, timer_sec

    def finalize_track(self, track_id, last_frame):
        """
        Close any active state segment at the end of the video.
        """
        if track_id not in self.tracks:
            return
        track = self.tracks[track_id]
        old_state = track["current_state"]
        start_f = track["start_frame_of_current_state"]
        end_f = last_frame
        duration_frames = end_f - start_f + 1
        
        if duration_frames > 0:
            track["state_history"].append({
                "state": old_state,
                "start_frame": start_f,
                "end_frame": end_f,
                "start_ts_sec": round(start_f / self.fps, 2),
                "end_ts_sec": round(end_f / self.fps, 2),
                "duration_sec": round(duration_frames / self.fps, 2)
            })

    def get_session_totals(self, track_id, rack_id):
        """
        Compute session totals for a track_id at a shelf/rack.
        """
        if track_id not in self.tracks:
            return {}
        track = self.tracks[track_id]
        
        # Calculate dominant state
        cum_sec = {state: round(frames / self.fps, 2) for state, frames in track["cumulative_frames"].items()}
        dominant_state = max(cum_sec, key=cum_sec.get)
        
        return {
            "track_id": track_id,
            "rack_id": rack_id,
            "total_no_interaction_sec": cum_sec["No Interaction"],
            "total_dwell_sec": cum_sec["Dwell"],
            "total_examining_sec": cum_sec["Examining"],
            "total_interaction_sec": cum_sec["Interaction"],
            "dominant_state": dominant_state
        }
