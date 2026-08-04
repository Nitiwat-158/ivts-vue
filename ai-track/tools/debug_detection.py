"""
Diagnostic tool - NOT part of the live pipeline.

Runs the raw YOLO detector (no ByteTrack, no confidence filtering) against
one camera's live stream and prints every single detection's class name and
confidence score, frame by frame. This tells you definitively whether the
model is:
  (a) never detecting the motorcycle at all (true recall problem - training
      data / camera angle / distance issue), or
  (b) detecting it, but at a confidence below whatever conf threshold is
      currently configured (a tunable threshold problem)

Usage:
    python -m tools.debug_detection CAM02_Gate_in
    python -m tools.debug_detection CAM02_Gate_in --seconds 30
    python -m tools.debug_detection CAM02_Gate_in --classes motorcycle

Press Ctrl+C to stop early.
"""
from __future__ import annotations

import argparse
import time

import cv2
from ultralytics import YOLO

from common.config import load_config
from pipeline.camera_stream import RTSPStreamThread
from pipeline.mask_utils import apply_mask


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("camera_id", help="Camera id from cameras.yaml, e.g. CAM02_Gate_in")
    parser.add_argument("--seconds", type=float, default=20.0, help="How long to run before stopping")
    parser.add_argument("--classes", nargs="*", default=None, help="Only print these class names (default: all)")
    parser.add_argument("--min-conf", type=float, default=0.01, help="Detector's own conf floor - keep this VERY low so nothing is hidden")
    args = parser.parse_args()

    config = load_config()
    cam = config.get_camera(args.camera_id)
    if cam is None:
        print(f"❌ Camera '{args.camera_id}' not found in cameras.yaml")
        return
    if not cam.rtsp_url:
        print(f"❌ No RTSP URL set for '{args.camera_id}' - check .env")
        return

    print(f"🔄 Loading detector from {config.detection.model_path} ...")
    model = YOLO(config.detection.model_path, task="detect")
    class_names = model.names  # {0: 'car', 1: 'motorcycle', ...} - depends on your training

    print(f"🔗 Connecting to {args.camera_id} ...")
    stream = RTSPStreamThread(
        cam.id, cam.rtsp_url, config.detection.frame_width, config.detection.frame_height
    ).start()

    print(f"\n📊 Logging ALL raw detections (conf >= {args.min_conf}) for {args.seconds}s. Ctrl+C to stop early.\n")
    start = time.time()
    frame_count = 0
    detection_count = 0

    try:
        while time.time() - start < args.seconds:
            frame = stream.read()
            if frame is None:
                time.sleep(0.05)
                continue

            frame_count += 1
            masked = apply_mask(frame, cam.mask_points)

            results = model.predict(source=masked, conf=args.min_conf, verbose=False, device=config.detection.device)
            result = results[0]

            if result.boxes is not None:
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    cls_name = class_names.get(cls_id, str(cls_id))
                    conf = float(box.conf[0])

                    if args.classes and cls_name not in args.classes:
                        continue

                    detection_count += 1
                    print(f"frame {frame_count:5d} | {cls_name:15s} | conf={conf:.3f}")

    except KeyboardInterrupt:
        pass
    finally:
        stream.stop()

    print(f"\n✅ Done. Read {frame_count} frames, logged {detection_count} matching detections.")
    print(f"   Model's known classes: {class_names}")
    if detection_count == 0:
        print("\n⚠️ ZERO detections logged even with conf as low as", args.min_conf)
        print("   This points to a genuine model/recall problem (too small/blurry/wrong angle),")
        print("   not just a threshold that's set too strict.")


if __name__ == "__main__":
    main()
