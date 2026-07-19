import math


def calculate_engagement_score(
    dwell_time: float,
    proximity_index: float = 0.8,  # Proxy for proximity (0 to 1, higher is closer)
    revisit_count: int = 1         # Proxy for revisit frequency
) -> float:
    """
    Formulation of the Engagement Quality Score (EQS):
    EQS = w_d * (1 - e^(-lambda * dwell_time)) + w_p * proximity_index + w_r * ln(1 + revisit_count)
    
    Weights:
      w_d = 0.5 (Dwell time weight)
      w_p = 0.3 (Proximity weight)
      w_r = 0.2 (Revisit frequency weight)
    
    Decay rate lambda = 0.05 (saturates around 60 seconds)
    
    Returns a float score between 0.0 and 1.0 (with max saturation up to 1.0).
    """
    w_d = 0.5
    w_p = 0.3
    w_r = 0.2
    
    decay_rate = 0.05
    
    # 1. Dwell factor (S-curve style saturation using exponential decay)
    dwell_factor = 1.0 - math.exp(-decay_rate * dwell_time)
    
    # 2. Proximity factor (bounded between 0 and 1)
    proximity_factor = min(max(proximity_index, 0.0), 1.0)
    
    # 3. Revisit factor (logarithmic scaling to prevent dominant outliers)
    revisit_factor = math.log(1 + revisit_count) / math.log(5)  # Normalized around 4 revisits
    revisit_factor = min(revisit_factor, 1.0)
    
    # Calculate score
    raw_score = (w_d * dwell_factor) + (w_p * proximity_factor) + (w_r * revisit_factor)
    return round(min(max(raw_score, 0.0), 1.0), 3)
