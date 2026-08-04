"""
Cross-camera vehicle matching.

This is the logic that used to live only in test_reid_match.py as an OFFLINE,
manual lookup tool. It's now shared so the SAME matching logic runs live
inside the tracking pipeline (assigning a global_id to every detection as it
happens), and is also reusable for offline/manual debugging.

Why this matters for your goal (polyline per vehicle across 10 cameras):
ByteTrack's track_id only means something within one camera's session. To draw
one polyline per real vehicle across 10 cameras, every detection needs to be
linked to a stable "global_id" - that's what this module assigns, using OSNet
cosine-distance matching against recent detections from OTHER cameras.

PLAUSIBILITY CHECK: cosine distance alone isn't always enough to avoid
mismatches - two different vehicles can occasionally look similar enough to
fall under match_threshold, especially at a busy intersection with many
candidate vehicles. Two independent additional checks guard against this:

  1. TIME: a candidate match is only accepted if the elapsed time since that
     candidate's last sighting is at least the minimum realistic travel time
     between the two cameras involved (config/camera_travel_times.yaml) - a
     vehicle "seen" at CAM02 and then again 2 seconds later at a camera 40
     seconds away by road is rejected as physically impossible, even if the
     vectors looked similar.

  2. DIRECTION (opt-in): if config/camera_route_graph.yaml exists, a
     candidate match is only accepted if (candidate_camera -> this_camera)
     is a legal one-way transition on your campus's real road layout - a
     vehicle can't have arrived here from a camera that isn't actually
     upstream of this one, even if the timing and vectors both looked fine.

We check multiple candidates (nearest first) and take the first one that
passes ALL checks, rather than giving up after the single nearest one fails.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

from common.config import AppConfig
from common.db import Database


@dataclass
class MatchResult:
    global_id: int
    is_new_identity: bool
    matched_distance: Optional[float] = None


def match_or_create_global_id(
    db: Database,
    cur,
    config: AppConfig,
    camera_id: str,
    vector: List[float],
    timestamp: datetime,
    match_threshold: float,
    match_window_minutes: int,
    candidate_limit: int = 5,
) -> MatchResult:
    """
    Given a freshly-extracted OSNet vector for a detection on `camera_id`:
      1. Look at the top `candidate_limit` closest vectors from DIFFERENT
         cameras within the time window, nearest first.
      2. Take the FIRST candidate that passes ALL of: close enough
         (< match_threshold), physically plausible timing (see
         common/config.py get_min_travel_seconds), AND a legal direction on
         the route graph if camera_route_graph.yaml is configured - reuse
         that vehicle's global_id.
      3. If no candidate passes every check, this is a "new" vehicle as far
         as the system has seen - create a fresh global_id.

    Must be called within an existing DB transaction (same cursor `cur`) that
    the caller commits, so the log insert + identity creation stay atomic.
    """
    candidates = db.find_nearest_recent_matches(
        cur,
        camera_id=camera_id,
        vector=vector,
        timestamp=timestamp,
        window_minutes=match_window_minutes,
        limit=candidate_limit,
    )

    for global_id, distance, _candidate_camera_id, _candidate_timestamp in candidates:
        if distance >= match_threshold:
            continue  # too dissimilar - candidates are nearest-first, all remaining are worse too

        last_known = db.get_last_known_position(cur, global_id)
        if last_known is None:
            continue  # shouldn't happen, but don't crash if it does
        last_camera_id, last_timestamp = last_known

        elapsed_seconds = (timestamp - last_timestamp).total_seconds()
        min_required_seconds = config.get_min_travel_seconds(last_camera_id, camera_id)

        if elapsed_seconds < min_required_seconds:
            continue  # physically implausible (too fast) - try next candidate

        if not config.is_valid_transition(last_camera_id, camera_id):
            continue  # illegal direction from this vehicle's TRUE last position

        db.touch_identity(cur, global_id, timestamp)
        return MatchResult(global_id=global_id, is_new_identity=False, matched_distance=distance)

    new_global_id = db.create_new_identity(cur, timestamp)
    return MatchResult(global_id=new_global_id, is_new_identity=True, matched_distance=None)