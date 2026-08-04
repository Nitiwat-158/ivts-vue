"""
Seeds ONE fake vehicle "crossing" all your active cameras in order, so you
can test /api/vehicle/timeline/{global_id} and the Leaflet polyline
rendering WITHOUT waiting for a real car to be seen on multiple cameras.

This writes directly to vehicle_identities / vehicle_logs using the same
shape the live pipeline produces - it bypasses the ReID matcher entirely
(no point comparing vectors here, we WANT all these rows under one
global_id on purpose).

Usage:
    python -m tools.seed_test_data
    python -m tools.seed_test_data --interval-minutes 3
    python -m tools.seed_test_data --cameras CAM01_Gate_in CAM02_Gate_in

    # Full manual control - type your own exact lat/lng per stop instead of
    # relying on calibration/homography auto-guessing (see
    # config/example_manual_route.yaml for the file format):
    python -m tools.seed_test_data --route-file config/my_route.yaml

Clean up afterward with:
    python -m tools.seed_test_data --cleanup
"""
from __future__ import annotations

import argparse
import random
from datetime import datetime, timedelta

import yaml

from common.config import load_config
from common.db import Database
from common.geolocation import build_homography, pixel_to_gps


def make_fake_vector(dim: int, seed: int) -> list[float]:
    """A deterministic-ish fake OSNet-shaped vector - same seed vehicle stays
    self-similar across cameras, like a real ReID vector would."""
    rng = random.Random(seed)
    base = [rng.uniform(-1, 1) for _ in range(dim)]
    # tiny per-camera jitter, like real detections of the same car would have
    return [v + rng.uniform(-0.01, 0.01) for v in base]


def fake_detection_gps(cam, rng: random.Random) -> tuple[float, float] | tuple[None, None]:
    """
    For a CALIBRATED camera, picks a random pixel point within the bounding
    box of its calibration_points and converts it through the real
    homography - this is what makes seeded vehicles land somewhere
    realistic/on-the-road instead of every fake detection sitting on the
    exact same spot. For an uncalibrated camera, returns (None, None) so the
    API falls back to that camera's single fixed lat/lng, same as before.
    """
    if len(cam.calibration_points) < 4:
        return None, None

    matrix = build_homography(cam.calibration_points)
    if matrix is None:
        return None, None

    xs = [p.pixel[0] for p in cam.calibration_points]
    ys = [p.pixel[1] for p in cam.calibration_points]
    # Random point within the calibrated area's bounding box - a rough stand-in
    # for "wherever in frame the vehicle happened to be", not the exact corners.
    px = rng.uniform(min(xs), max(xs))
    py = rng.uniform(min(ys), max(ys))

    return pixel_to_gps(matrix, px, py)


def seed_manual(config, route_entries: list[dict], interval_minutes: float):
    """
    Same as seed(), but uses the EXACT lat/lng you typed in a route file -
    no calibration/homography guessing at all. Use this when you already
    know exactly where you want the fake path to go (e.g. you plotted it by
    hand on a map) and just want the DB to reflect those exact points.
    """
    db = Database(config)
    camera_lookup = {c.id: c for c in config.cameras}

    valid_entries = []
    for entry in route_entries:
        cid = entry.get("camera_id")
        if cid not in camera_lookup:
            print(f"⚠️ Camera id '{cid}' not found in cameras.yaml - skipping this stop")
            continue
        valid_entries.append(entry)

    if not valid_entries:
        print("❌ No valid stops found in the route file")
        return

    with db.connection() as conn:
        cur = conn.cursor()

        start_time = datetime.now() - timedelta(minutes=interval_minutes * len(valid_entries))
        global_id = db.create_new_identity(cur, start_time)

        print(f"🆕 Created fake vehicle_identities.global_id = {global_id}")

        vector = make_fake_vector(config.reid.vector_dim, seed=global_id)
        fake_track_id = 9001  # obviously fake local track_id, easy to spot/clean up later

        for i, entry in enumerate(valid_entries):
            timestamp = start_time + timedelta(minutes=interval_minutes * i)
            log_id = db.insert_vehicle_log(
                cur,
                global_id=global_id,
                track_id=fake_track_id,
                camera_id=entry["camera_id"],
                predicted_class="car",
                vector=vector,
                timestamp=timestamp,
                detected_lat=entry["lat"],
                detected_lng=entry["lng"],
            )
            print(f"  📍 log_id={log_id} | {entry['camera_id']} | ({entry['lat']}, {entry['lng']}) | {timestamp.strftime('%Y-%m-%d %H:%M:%S')}")

        conn.commit()

    print(f"\n✅ Done. Test it with:")
    print(f"   GET /api/vehicle/timeline/{global_id}")


def seed(config, camera_ids: list[str], interval_minutes: float):
    db = Database(config)

    # Build the route in the EXACT order given, allowing the same camera to
    # repeat (e.g. a backtrack like CAM07 -> CAM06 -> CAM05) - previously
    # this filtered config.cameras' fixed CAM01->CAM10 order instead of
    # following the requested sequence, so backtracks/custom order were
    # silently ignored.
    camera_lookup = {c.id: c for c in config.cameras}
    cameras = []
    for cid in camera_ids:
        cam = camera_lookup.get(cid)
        if cam is None:
            print(f"⚠️ Camera id '{cid}' not found in cameras.yaml - skipping")
            continue
        cameras.append(cam)

    if not cameras:
        print("❌ None of the requested camera ids were found in cameras.yaml")
        return

    rng = random.Random()

    with db.connection() as conn:
        cur = conn.cursor()

        start_time = datetime.now() - timedelta(minutes=interval_minutes * len(cameras))
        global_id = db.create_new_identity(cur, start_time)

        print(f"🆕 Created fake vehicle_identities.global_id = {global_id}")

        vector = make_fake_vector(config.reid.vector_dim, seed=global_id)
        fake_track_id = 9001  # obviously fake local track_id, easy to spot/clean up later

        for i, cam in enumerate(cameras):
            timestamp = start_time + timedelta(minutes=interval_minutes * i)
            detected_lat, detected_lng = fake_detection_gps(cam, rng)

            log_id = db.insert_vehicle_log(
                cur,
                global_id=global_id,
                track_id=fake_track_id,
                camera_id=cam.id,
                predicted_class="car",
                vector=vector,
                timestamp=timestamp,
                detected_lat=detected_lat,
                detected_lng=detected_lng,
            )
            calib_note = " (homography)" if detected_lat is not None else " (fixed point - not calibrated)"
            print(f"  📍 log_id={log_id} | {cam.id} | {timestamp.strftime('%Y-%m-%d %H:%M:%S')}{calib_note}")

        conn.commit()

    print(f"\n✅ Done. Test it with:")
    print(f"   GET /api/vehicle/timeline/{global_id}")


def cleanup(config):
    db = Database(config)
    with db.connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM vehicle_logs WHERE track_id = 9001;")
        deleted_logs = cur.rowcount
        cur.execute(
            """
            DELETE FROM vehicle_identities
            WHERE global_id NOT IN (SELECT DISTINCT global_id FROM vehicle_logs WHERE global_id IS NOT NULL);
            """
        )
        deleted_identities = cur.rowcount
        conn.commit()
    print(f"🧹 Removed {deleted_logs} fake log row(s) and {deleted_identities} now-orphaned identity row(s).")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cameras", nargs="*", default=None, help="Camera ids to use, in order (default: all in cameras.yaml)")
    parser.add_argument("--route-file", default=None, help="Path to a YAML file with your OWN exact lat/lng per stop - see config/example_manual_route.yaml. Overrides --cameras.")
    parser.add_argument("--interval-minutes", type=float, default=2.0, help="Minutes between each camera 'sighting'")
    parser.add_argument("--cleanup", action="store_true", help="Delete previously seeded fake data instead of creating more")
    args = parser.parse_args()

    config = load_config()

    if args.cleanup:
        cleanup(config)
        return

    if args.route_file:
        with open(args.route_file, "r", encoding="utf-8") as f:
            route_data = yaml.safe_load(f) or {}
        route_entries = route_data.get("route", [])
        seed_manual(config, route_entries, args.interval_minutes)
        return

    camera_ids = args.cameras or [c.id for c in config.cameras]
    seed(config, camera_ids, args.interval_minutes)


if __name__ == "__main__":
    main()