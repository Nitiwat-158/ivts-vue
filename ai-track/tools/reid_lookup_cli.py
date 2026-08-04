"""
Offline / manual ReID lookup tool - replaces test_reid_match.py.

Given a log_id, shows which global_id (cross-camera vehicle identity) it
belongs to, and prints that vehicle's full timeline across cameras. Useful
for debugging the matcher without running the live pipeline.

Usage:
    python -m tools.reid_lookup_cli 10
"""
from __future__ import annotations

import sys

from common.config import load_config
from common.db import Database, get_dict_cursor


def lookup(log_id: int):
    config = load_config()
    db = Database(config)

    with db.connection() as conn:
        cur = conn.cursor()
        row = db.get_log_by_id(cur, log_id)
        if row is None:
            print(f"❌ log_id {log_id} not found in the database.")
            return

        found_log_id, global_id, camera_id, timestamp, _vector = row

        if global_id is None:
            print(f"⚠️ log_id {log_id} has no global_id assigned (pre-migration row?).")
            return

        print(f"🎯 log_id {log_id} -> global_id {global_id} (seen on {camera_id} at {timestamp})")

        dict_cur = get_dict_cursor(conn)
        timeline = db.get_timeline_by_global_id(dict_cur, global_id)

        print(f"\n📍 Full cross-camera timeline for global_id {global_id} ({len(timeline)} detections):")
        for entry in timeline:
            marker = "👉" if entry["log_id"] == log_id else "  "
            print(f"{marker} {entry['timestamp']} | {entry['camera_id']} | local track {entry['track_id']} | log_id={entry['log_id']}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m tools.reid_lookup_cli <log_id>")
        sys.exit(1)
    lookup(int(sys.argv[1]))
