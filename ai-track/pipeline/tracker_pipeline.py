"""
Main real-time pipeline: detection + ByteTrack tracking + OSNet ReID +
cross-camera matching + DB persistence, for ALL cameras defined in
config/cameras.yaml.

This replaces test.py. Key differences from the original:
  - Reads camera list / RTSP URLs / masks / model paths from config instead
    of being hardcoded, so it scales from 2 to 10 (or more) cameras by
    editing YAML only.
  - ReID backbone is OSNet (via common/reid_extractor.py) instead of ResNet18.
  - Every detection saved to DB gets a cross-camera `global_id` via
    common/reid_matcher.py, instead of just the camera-local ByteTrack
    track_id. This is what lets the API return one continuous route per
    vehicle for the polyline.
  - DB writes run on a small bounded thread pool instead of spawning an
    unbounded thread per detection (important once you have 10 cameras'
    worth of vehicles instead of 2).

IMPORTANT - one YOLO model instance PER CAMERA:
Each camera gets its own YOLO(...) instance (all loaded from the same
best_9000.onnx weights file, just separate inference/tracker objects). This
is required for two independent reasons:
  1. Most exported YOLO ONNX models (including this one) have a FIXED batch
     size of 1, so a single model.track() call can't process multiple
     cameras' frames at once as one batch.
  2. Even if batching worked, ByteTrack's persist=True state assumes
     consecutive calls come from the SAME camera feed. Feeding frames from
     different cameras through one shared tracker would corrupt track
     continuity for all of them. Separate instances = separate, correct
     tracker state per camera.
This costs more RAM (10x small model + 10x tracker state) but is the
correct way to run ByteTrack across multiple independent camera feeds.
"""
from __future__ import annotations

import json
import os
import threading
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

import cv2
import numpy as np
from ultralytics import YOLO

from common.config import AppConfig, load_config
from common.db import Database, get_dict_cursor
from common.fusion import try_fuse_with_recent_detection
from common.geolocation import build_homography, ground_contact_point, pixel_to_gps
from common.reid_extractor import OSNetExtractor
from common.reid_matcher import match_or_create_global_id
from pipeline.camera_stream import RTSPStreamThread
from pipeline.mask_utils import apply_mask

DB_WORKER_THREADS = 4


def notify_node_tracking_history(user_payload: dict):
    """HTTP bridge: Python tells Node to persist a tracking_history event."""
    node_url = os.getenv('IVTS_NODE_TRACKING_HISTORY_URL', 'http://localhost:8203/api/v1/mobile/ai-track/ownership/history')
    if not node_url:
        return

    data = json.dumps(user_payload).encode('utf-8')
    req = urllib.request.Request(
        node_url,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            resp.read()
    except Exception as exc:
        print(f"⚠️ [Ownership Bridge] failed to push tracking history to Node: {exc}")


def save_detection(
    db: Database,
    reid_extractor: OSNetExtractor,
    config: AppConfig,
    camera_id: str,
    track_id: int,
    cropped_car: np.ndarray,
    global_id_lookup: dict,
    global_id_lock: threading.Lock,
    detected_lat: float = None,
    detected_lng: float = None,
    box_area: float = None,
    predicted_class: str = "car",
):
    """
    Runs on the thread pool: extract OSNet vector, match/create global_id, save log.
    Also writes the resulting global_id into a shared lookup so the main
    display loop can overlay it on screen - this is what lets you SEE
    cross-camera ReID matching happen in real time, not just check it in the DB.

    detected_lat/detected_lng: per-detection GPS from homography (if this
    camera is calibrated in config/homography_calibration.yaml), otherwise
    None - the API falls back to the camera's fixed lat/lng in that case.

    box_area: bounding box pixel area, used to weight fusion (see
    common/fusion.py) if this global_id was ALSO just seen by another
    (overlapping) camera within config.reid.fusion_window_seconds - in that
    case this detection gets merged into the existing point instead of
    creating a second, zigzag-causing one.
    """
    vector = reid_extractor.extract(cropped_car)
    timestamp = datetime.now()

    try:
        with db.connection() as conn:
            cur = conn.cursor()
            match = match_or_create_global_id(
                db=db,
                cur=cur,
                config=config,
                camera_id=camera_id,
                vector=vector,
                timestamp=timestamp,
                match_threshold=config.reid.match_threshold,
                match_window_minutes=config.reid.match_window_minutes,
            )

            fusion_result = try_fuse_with_recent_detection(
                db=db,
                cur=cur,
                global_id=match.global_id,
                camera_id=camera_id,
                detected_lat=detected_lat,
                detected_lng=detected_lng,
                box_area=box_area or 0.0,
                timestamp=timestamp,
                fusion_window_seconds=config.reid.fusion_window_seconds,
            )

            if fusion_result.fused:
                log_id = fusion_result.log_id
            else:
                log_id = db.insert_vehicle_log(
                    cur,
                    global_id=match.global_id,
                    track_id=track_id,
                    camera_id=camera_id,
                    predicted_class=predicted_class,
                    vector=vector,
                    timestamp=timestamp,
                    detected_lat=detected_lat,
                    detected_lng=detected_lng,
                    box_area=box_area,
                )

            # Independent user-ownership side-channel: compare this new live
            # vector to the Registered Vehicles reference-vector table. This is
            # not replacing the global_id ReID matcher; it runs in parallel.
            user_match = db.find_registered_vehicle_match(
                cur,
                vector=vector,
                threshold=config.reid.user_match_threshold,
            )
            conn.commit()

        if user_match:
            payload = {
                'user_id': user_match['user_id'],
                'vehicle_id': user_match.get('vehicle_id'),
                'global_id': match.global_id,
                'camera_id': camera_id,
                'lat': detected_lat,
                'lng': detected_lng,
                'timestamp': timestamp.isoformat(),
                'log_id': log_id,
            }
            notify_node_tracking_history(payload)

        cooldown_key = f"{camera_id}_{track_id}"
        with global_id_lock:
            global_id_lookup[cooldown_key] = match.global_id

        status = "🆕 new vehicle" if match.is_new_identity else f"🔗 matched (dist={match.matched_distance:.4f})"
        fuse_note = " [fused]" if fusion_result.fused else ""
        print(f"💾 [DB Saved] {camera_id} | local track {track_id} -> global_id {match.global_id} | {status} | log_id={log_id}{fuse_note}")
    except Exception as e:
        print(f"❌ [DB Error] {camera_id} track {track_id}: {e}")


def run_pipeline(config: AppConfig):
    db = Database(config)

    print("🔄 Loading OSNet ReID extractor...")
    reid_extractor = OSNetExtractor(model_name=config.reid.model_name, device=config.reid.device)

    print(f"🔄 Starting {len(config.cameras)} camera stream(s)...")
    streams: dict[str, RTSPStreamThread] = {}
    models: dict[str, YOLO] = {}
    for cam in config.cameras:
        if not cam.rtsp_url:
            print(f"⚠️ Skipping {cam.id}: no RTSP URL set (check .env)")
            continue
        streams[cam.id] = RTSPStreamThread(
            cam.id, cam.rtsp_url, config.detection.frame_width, config.detection.frame_height
        ).start()
        # Separate model/tracker instance per camera - see module docstring.
        models[cam.id] = YOLO(config.detection.model_path, task="detect")

    mask_lookup = {cam.id: cam.mask_points for cam in config.cameras}
    cam_conf_lookup = {cam.id: cam.conf for cam in config.cameras}
    cam_tracker_lookup = {cam.id: cam.tracker for cam in config.cameras}
    last_saved_time: dict[str, float] = {}

    # Homography matrix per camera that has calibration_points configured
    # (config/homography_calibration.yaml) - None for cameras without one,
    # which just keep using their fixed lat/lng (handled in the API).
    homography_lookup: dict[str, object] = {}
    for cam in config.cameras:
        matrix = build_homography(cam.calibration_points)
        if matrix is not None:
            homography_lookup[cam.id] = matrix
            print(f"📐 {cam.id}: homography calibration active ({len(cam.calibration_points)} points)")

    # Shared between the DB-save thread pool (writer) and this loop (reader),
    # so we can show the ReID-assigned global_id on screen as soon as it's
    # known, without blocking the display loop on the DB round-trip.
    global_id_lookup: dict[str, int] = {}
    global_id_lock = threading.Lock()

    executor = ThreadPoolExecutor(max_workers=DB_WORKER_THREADS)

    print("\n🚀 Pipeline running across all cameras... press 'q' in any display window to stop.")
    try:
        while True:
            any_frame_processed = False

            for cam_id, stream in streams.items():
                frame = stream.read()
                if frame is None:
                    continue
                any_frame_processed = True

                masked_frame = apply_mask(frame, mask_lookup[cam_id])

                results = models[cam_id].track(
                    source=masked_frame,
                    persist=True,
                    tracker=(cam_tracker_lookup.get(cam_id) or config.detection.tracker),
                    conf=(cam_conf_lookup.get(cam_id) if cam_conf_lookup.get(cam_id) is not None else config.detection.conf),
                    verbose=False,
                    device=config.detection.device,
                )
                result = results[0]
                annotated_frame = result.plot()

                if result.boxes is not None and result.boxes.id is not None:
                    boxes = result.boxes.xyxy.cpu().numpy()
                    track_ids = result.boxes.id.cpu().numpy()

                    for box, track_id in zip(boxes, track_ids):
                        x1, y1, x2, y2 = map(int, box)
                        current_time = time.time()
                        cooldown_key = f"{cam_id}_{int(track_id)}"

                        with global_id_lock:
                            known_global_id = global_id_lookup.get(cooldown_key)

                        if known_global_id is not None:
                            display_text = f"ID:{int(track_id)} G:{known_global_id}"
                            box_width = 115
                        else:
                            display_text = f"ID:{int(track_id)} G:..."  # not yet ReID-matched - DB save/match still pending
                            box_width = 100

                        cv2.rectangle(annotated_frame, (x1, y1 - 22), (x1 + box_width, y1), (0, 255, 0), -1)
                        cv2.putText(
                            annotated_frame, display_text, (x1 + 5, y1 - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2,
                        )

                        cooldown = config.detection.save_cooldown_seconds
                        if cooldown_key not in last_saved_time or (current_time - last_saved_time[cooldown_key]) > cooldown:
                            cropped_car = frame[y1:y2, x1:x2]
                            if cropped_car.size > 0:
                                detected_lat, detected_lng = None, None
                                homography_matrix = homography_lookup.get(cam_id)
                                if homography_matrix is not None:
                                    px, py = ground_contact_point(x1, y1, x2, y2)
                                    detected_lat, detected_lng = pixel_to_gps(homography_matrix, px, py)

                                box_area = float((x2 - x1) * (y2 - y1))

                                executor.submit(
                                    save_detection, db, reid_extractor, config, cam_id, int(track_id),
                                    cropped_car.copy(), global_id_lookup, global_id_lock,
                                    detected_lat, detected_lng, box_area,
                                )
                                last_saved_time[cooldown_key] = current_time

                if config.detection.display:
                    display_frame = cv2.resize(annotated_frame, (400, 225))
                    cv2.imshow(f"MFU Integrated System - {cam_id}", display_frame)

            if config.detection.display and (cv2.waitKey(1) & 0xFF == ord("q")):
                break
            if not any_frame_processed:
                time.sleep(0.01)  # no camera had a frame ready yet, avoid busy-spinning

    finally:
        print("🛑 Shutting down camera threads and thread pool...")
        for stream in streams.values():
            stream.stop()
        executor.shutdown(wait=True)
        cv2.destroyAllWindows()
        print("✅ Pipeline stopped safely.")


if __name__ == "__main__":
    cfg = load_config()
    run_pipeline(cfg)