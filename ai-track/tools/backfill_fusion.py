"""
Retroactively applies fusion to EXISTING data - for detections that were
saved before the live fusion feature (common/fusion.py) existed, or from any
gap where fusion didn't trigger for some reason.

Uses the exact same weighting logic as live fusion (box_area-weighted
average), just applied after the fact by scanning history instead of at
insert-time.

SAFETY: defaults to --dry-run (prints what WOULD change, touches nothing).
You must pass --apply to actually modify the database.

Usage:
    # Preview only - safe, no changes made
    python -m tools.backfill_fusion

    # Preview for one specific vehicle
    python -m tools.backfill_fusion --global-id 42

    # Actually perform the merge (deletes redundant rows)
    python -m tools.backfill_fusion --apply

    # Override the fusion time window (default: config.reid.fusion_window_seconds)
    python -m tools.backfill_fusion --window-seconds 1.5 --apply
"""
from __future__ import annotations

import argparse
from datetime import datetime
from typing import List, Optional

from common.config import load_config
from common.db import Database


def fetch_fusable_rows(cur, global_id: int) -> List[dict]:
    """All rows for this global_id that HAVE a computed GPS (fusion candidates only),
    ordered oldest -> newest - same requirement as live fusion (both sides need real GPS)."""
    cur.execute(
        """
        SELECT log_id, camera_id, timestamp, detected_lat, detected_lng, box_area
        FROM vehicle_logs
        WHERE global_id = %s
          AND detected_lat IS NOT NULL
          AND detected_lng IS NOT NULL
        ORDER BY timestamp ASC;
        """,
        (global_id,),
    )
    cols = ["log_id", "camera_id", "timestamp", "detected_lat", "detected_lng", "box_area"]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


def build_clusters(rows: List[dict], window_seconds: float) -> List[List[dict]]:
    """
    Chains consecutive rows together when they're within window_seconds of
    the PREVIOUS row in the growing cluster AND from a different camera -
    mirrors exactly what live fusion checks (recent detection, different
    camera). This naturally handles 3+ camera chains (A->B->C all quick
    catches of the same vehicle), not just pairs.
    """
    clusters: List[List[dict]] = []
    for row in rows:
        if clusters:
            last = clusters[-1][-1]
            gap = (row["timestamp"] - last["timestamp"]).total_seconds()
            if gap <= window_seconds and row["camera_id"] != last["camera_id"]:
                clusters[-1].append(row)
                continue
        clusters.append([row])
    return clusters


def fuse_cluster(cluster: List[dict]) -> dict:
    """Weighted-average merge of a cluster's positions - same math as common/fusion.py."""
    total_weight = 0.0
    lat_sum = 0.0
    lng_sum = 0.0
    max_weight = 0.0
    latest_timestamp = cluster[0]["timestamp"]

    for row in cluster:
        w = row["box_area"] if row["box_area"] and row["box_area"] > 0 else 1.0
        lat_sum += row["detected_lat"] * w
        lng_sum += row["detected_lng"] * w
        total_weight += w
        max_weight = max(max_weight, w)
        latest_timestamp = max(latest_timestamp, row["timestamp"])

    return {
        "target_log_id": cluster[0]["log_id"],  # keep the earliest row, same as live fusion
        "fused_lat": lat_sum / total_weight,
        "fused_lng": lng_sum / total_weight,
        "fused_box_area": max_weight,
        "fused_timestamp": latest_timestamp,
        "merged_away_log_ids": [row["log_id"] for row in cluster[1:]],
        "cameras_involved": [row["camera_id"] for row in cluster],
    }


def run(config, target_global_id: Optional[int], window_seconds: float, apply: bool):
    db = Database(config)

    with db.connection() as conn:
        cur = conn.cursor()

        if target_global_id is not None:
            global_ids = [target_global_id]
        else:
            cur.execute("SELECT DISTINCT global_id FROM vehicle_logs WHERE global_id IS NOT NULL ORDER BY global_id;")
            global_ids = [row[0] for row in cur.fetchall()]

        total_clusters_merged = 0
        total_rows_removed = 0

        for global_id in global_ids:
            rows = fetch_fusable_rows(cur, global_id)
            if len(rows) < 2:
                continue

            clusters = build_clusters(rows, window_seconds)
            mergeable = [c for c in clusters if len(c) > 1]

            if not mergeable:
                continue

            print(f"\n🚗 global_id {global_id}: {len(mergeable)} cluster(s) to merge")
            for cluster in mergeable:
                fused = fuse_cluster(cluster)
                cams = " + ".join(fused["cameras_involved"])
                print(
                    f"   {cams} -> log_id {fused['target_log_id']} "
                    f"({fused['fused_lat']:.6f}, {fused['fused_lng']:.6f}) "
                    f"| removing log_id(s) {fused['merged_away_log_ids']}"
                )

                if apply:
                    cur.execute(
                        """
                        UPDATE vehicle_logs
                        SET detected_lat = %s, detected_lng = %s, box_area = %s, timestamp = %s
                        WHERE log_id = %s;
                        """,
                        (
                            fused["fused_lat"], fused["fused_lng"], fused["fused_box_area"],
                            fused["fused_timestamp"], fused["target_log_id"],
                        ),
                    )
                    cur.execute(
                        "DELETE FROM vehicle_logs WHERE log_id = ANY(%s);",
                        (fused["merged_away_log_ids"],),
                    )

                total_clusters_merged += 1
                total_rows_removed += len(fused["merged_away_log_ids"])

        if apply:
            conn.commit()
            print(f"\n✅ Applied: merged {total_clusters_merged} cluster(s), removed {total_rows_removed} redundant row(s).")
        else:
            print(f"\n👀 Dry run only - nothing was changed.")
            print(f"   Would merge {total_clusters_merged} cluster(s), remove {total_rows_removed} row(s).")
            print(f"   Re-run with --apply to actually perform this.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--global-id", type=int, default=None, help="Only process this one global_id (default: all)")
    parser.add_argument("--window-seconds", type=float, default=None, help="Fusion time window override (default: config.reid.fusion_window_seconds)")
    parser.add_argument("--apply", action="store_true", help="Actually modify the database (default: dry-run preview only)")
    args = parser.parse_args()

    config = load_config()
    window_seconds = args.window_seconds if args.window_seconds is not None else config.reid.fusion_window_seconds

    print(f"{'⚠️ APPLYING CHANGES' if args.apply else '👀 DRY RUN (preview only)'} - fusion window: {window_seconds}s")
    run(config, args.global_id, window_seconds, args.apply)


if __name__ == "__main__":
    main()