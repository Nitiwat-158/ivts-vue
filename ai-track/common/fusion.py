"""
Multi-camera detection fusion.

Fixes the "zigzag at intersections" problem: when two cameras have
overlapping fields of view (e.g. both watching the same intersection), each
one's homography has a small independent error (~2-5m). If both cameras log
the SAME vehicle within a second of each other, the vehicle's timeline would
otherwise alternate between two slightly-different points every second,
drawing a jagged zigzag on the map instead of a smooth line.

Fix: when a fresh detection's global_id already has a very recent detection
(within `fusion_window_seconds`) from a DIFFERENT camera, merge the two
positions into ONE point instead of keeping both - weighted by bounding box
area, since a bigger box generally means a closer/clearer/more reliable view
of the vehicle.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from common.db import Database


@dataclass
class FusionResult:
    fused: bool
    log_id: Optional[int] = None  # the existing log_id that got updated, if fused


def try_fuse_with_recent_detection(
    db: Database,
    cur,
    global_id: int,
    camera_id: str,
    detected_lat: Optional[float],
    detected_lng: Optional[float],
    box_area: float,
    timestamp: datetime,
    fusion_window_seconds: float,
) -> FusionResult:
    """
    Checks for a recent same-vehicle detection from a different camera and,
    if found, fuses this new detection INTO that existing row (weighted by
    box area) instead of the caller inserting a brand new row.

    Returns FusionResult(fused=False) if there's nothing to fuse with (either
    no recent cross-camera detection, or this detection has no computed GPS
    to fuse - e.g. an uncalibrated camera) - the caller should insert a
    normal new row in that case, same as before this feature existed.
    """
    if detected_lat is None or detected_lng is None:
        return FusionResult(fused=False)

    recent = db.get_recent_log_for_fusion(
        cur,
        global_id=global_id,
        exclude_camera_id=camera_id,
        new_timestamp=timestamp,
        window_seconds=fusion_window_seconds,
    )
    if recent is None:
        return FusionResult(fused=False)

    old_log_id, old_camera_id, old_lat, old_lng, old_box_area, old_timestamp = recent

    # If either box area is missing/zero, fall back to a plain 50/50 average
    # rather than dividing by zero or letting one missing value dominate.
    w_old = old_box_area if old_box_area and old_box_area > 0 else 1.0
    w_new = box_area if box_area and box_area > 0 else 1.0
    total_weight = w_old + w_new

    fused_lat = (old_lat * w_old + detected_lat * w_new) / total_weight
    fused_lng = (old_lng * w_old + detected_lng * w_new) / total_weight
    fused_box_area = max(w_old, w_new)  # keep the larger/clearer view's box size for future fusions
    fused_timestamp = max(old_timestamp, timestamp)

    db.fuse_update_log(cur, old_log_id, fused_lat, fused_lng, fused_box_area, fused_timestamp)

    print(
        f"🔀 [Fusion] {camera_id} + {old_camera_id} -> merged into log_id={old_log_id} "
        f"(weights: {old_camera_id}={w_old:.0f}, {camera_id}={w_new:.0f})"
    )

    return FusionResult(fused=True, log_id=old_log_id)