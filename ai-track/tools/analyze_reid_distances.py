"""
Analyzes REAL collected data to find good match_threshold value, instead of
guessing. Uses two reliable ground-truth signals pulled straight from your
own database (no manual labeling needed):

  - "Same vehicle" reference: multiple detections with the SAME camera_id
    AND SAME track_id. ByteTrack keeps one track_id per physical vehicle
    within a single camera session, so these are almost certainly the same
    real car - their vector distances show how similar the SAME car's
    vectors are to each other over time (should be LOW).

  - "Different vehicle" reference: detections with the SAME camera_id but
    DIFFERENT track_ids, active within a few seconds of each other. Two
    different active track_ids in one camera at the same time are
    guaranteed to be different physical vehicles - their vector distances
    show how similar DIFFERENT cars can accidentally look (should be HIGH,
    but if your camera sees a lot of same-colored/same-model cars, might be
    lower than you'd like - which is exactly the point of checking).

If these two distributions overlap a lot, that tells you OSNet's generic
(non-fine-tuned) features aren't discriminating well for your specific
vehicles/cameras, and match_threshold alone can't fully solve it - you'd
need the time-distance plausibility check too (or fine-tuned ReID weights).

Usage:
    python -m tools.analyze_reid_distances
    python -m tools.analyze_reid_distances --hours 6
"""
from __future__ import annotations

import argparse
from collections import defaultdict
from datetime import datetime, timedelta

import numpy as np

from common.config import load_config
from common.db import Database


def parse_pgvector(raw) -> np.ndarray:
    """psycopg2 returns pgvector columns as a string like '[0.1,0.2,...]' unless
    a vector adapter is registered - parse it manually into a numpy array."""
    if isinstance(raw, str):
        raw = raw.strip("[]")
        return np.array([float(x) for x in raw.split(",")])
    return np.array(raw)  # already a list/array


def cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    similarity = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    return float(1.0 - similarity)


def summarize(label: str, distances: list[float]):
    if not distances:
        print(f"{label}: no data found")
        return
    arr = np.array(distances)
    print(f"{label} (n={len(arr)}):")
    print(f"  min={arr.min():.4f}  p5={np.percentile(arr,5):.4f}  median={np.median(arr):.4f}  "
          f"p95={np.percentile(arr,95):.4f}  max={arr.max():.4f}  mean={arr.mean():.4f}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hours", type=float, default=24.0, help="How far back to analyze (default: last 24 hours)")
    parser.add_argument("--different-vehicle-window-seconds", type=float, default=5.0,
                         help="Max time gap to consider two different track_ids in the same camera as a 'simultaneous, definitely different vehicles' pair")
    args = parser.parse_args()

    config = load_config()
    db = Database(config)

    since = datetime.now() - timedelta(hours=args.hours)

    with db.connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT camera_id, track_id, timestamp, live_vector
            FROM vehicle_logs
            WHERE timestamp >= %s
            ORDER BY camera_id, timestamp ASC;
            """,
            (since,),
        )
        rows = cur.fetchall()

    print(f"Analyzing {len(rows)} detections from the last {args.hours} hour(s)...\n")

    # Group by (camera_id, track_id) for the "same vehicle" reference
    by_camera_track = defaultdict(list)
    # Group by camera_id only, for the "different vehicle" reference
    by_camera = defaultdict(list)

    for camera_id, track_id, timestamp, raw_vector in rows:
        vector = parse_pgvector(raw_vector)
        by_camera_track[(camera_id, track_id)].append((timestamp, vector))
        by_camera[camera_id].append((track_id, timestamp, vector))

    # --- Same-vehicle distances: consecutive detections of the SAME (camera, track_id) ---
    same_vehicle_distances = []
    for (camera_id, track_id), entries in by_camera_track.items():
        entries.sort(key=lambda e: e[0])
        for i in range(len(entries) - 1):
            same_vehicle_distances.append(cosine_distance(entries[i][1], entries[i + 1][1]))

    # --- Different-vehicle distances: different track_ids in the same camera, close in time ---
    different_vehicle_distances = []
    window = timedelta(seconds=args.different_vehicle_window_seconds)
    for camera_id, entries in by_camera.items():
        entries.sort(key=lambda e: e[1])
        for i in range(len(entries)):
            for j in range(i + 1, len(entries)):
                if entries[j][1] - entries[i][1] > window:
                    break
                if entries[i][0] != entries[j][0]:  # different track_id = guaranteed different vehicle
                    different_vehicle_distances.append(cosine_distance(entries[i][2], entries[j][2]))

    summarize("SAME vehicle (should be LOW)", same_vehicle_distances)
    print()
    summarize("DIFFERENT vehicle (should be HIGH)", different_vehicle_distances)
    print()

    if same_vehicle_distances and different_vehicle_distances:
        same_p95 = np.percentile(same_vehicle_distances, 95)
        diff_p5 = np.percentile(different_vehicle_distances, 5)
        print(f"Same-vehicle p95 = {same_p95:.4f}, Different-vehicle p5 = {diff_p5:.4f}")
        if same_p95 < diff_p5:
            suggested = (same_p95 + diff_p5) / 2
            print(f"✅ Good separation - suggested match_threshold ≈ {suggested:.4f}")
        else:
            print("⚠️ These distributions OVERLAP - no single threshold will cleanly separate same vs "
                  "different vehicles here. match_threshold alone can't fully fix this; you likely also "
                  "need the time-distance plausibility check, and/or fine-tuned (not generic ImageNet) "
                  "ReID weights for real accuracy gains.")


if __name__ == "__main__":
    main()