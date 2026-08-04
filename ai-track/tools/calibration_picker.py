"""
Homography calibration tool - generates pixel<->GPS point pairs for
config/homography_calibration.yaml.

Usage:
    python -m tools.calibration_picker CAM05

Workflow:
  1. Grabs one frame from the camera.
  2. You click a landmark in the frame (a building corner, curb, manhole
     cover, distinct lane marking - anything fixed and precisely pinpointable).
  3. The terminal prompts you to type that SAME landmark's real GPS
     coordinate - find it by opening Google Maps satellite view, zooming into
     the exact spot, and right-clicking to copy its coordinates.
  4. Repeat for at least 4 points (5-8 gives a more robust calibration).
  5. Press 'q' in the image window when done - this writes the calibration
     into config/homography_calibration.yaml automatically.

Pick points spread across the frame (not clustered in one corner) for a
more accurate transform - e.g. two points near the camera, two points
farther away, on both sides of the road/split you're calibrating for.
"""
from __future__ import annotations

import sys

import cv2
import yaml

from common.config import CONFIG_DIR, load_config

clicked_points: list[list[int]] = []


def click_event(event, x, y, flags, params):
    global img
    if event == cv2.EVENT_LBUTTONDOWN:
        clicked_points.append([x, y])
        cv2.circle(img, (x, y), 6, (0, 0, 255), -1)
        cv2.putText(img, str(len(clicked_points)), (x + 8, y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.imshow("MFU - Homography Calibration", img)
        print(f"📍 Point {len(clicked_points)} clicked at pixel ({x}, {y})")


def main():
    if len(sys.argv) != 2:
        print("Usage: python -m tools.calibration_picker <CAMERA_ID>")
        print("Example: python -m tools.calibration_picker CAM05")
        sys.exit(1)

    camera_id = sys.argv[1]
    config = load_config()
    cam = config.get_camera(camera_id)
    if cam is None:
        print(f"❌ Camera '{camera_id}' not found in config/cameras.yaml")
        sys.exit(1)
    if not cam.rtsp_url:
        print(f"❌ No RTSP URL set for '{camera_id}' - check config/.env")
        sys.exit(1)

    global img
    print(f"🔗 Connecting to {camera_id} ...")
    cap = cv2.VideoCapture(cam.rtsp_url)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, float(config.detection.frame_width))
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, float(config.detection.frame_height))
    ret, img = cap.read()
    cap.release()

    if not ret:
        print("❌ Could not grab a frame - check the RTSP URL / network.")
        sys.exit(1)

    print("\n💡 Click on a landmark in the image (building corner, curb, manhole cover, etc).")
    print("👉 After each click, come back to THIS terminal to type its real GPS coordinate.")
    print("👉 Click at least 4 points, spread across the frame. Press 'q' in the image window when done.\n")

    cv2.namedWindow("MFU - Homography Calibration", cv2.WINDOW_NORMAL)
    cv2.setMouseCallback("MFU - Homography Calibration", click_event)

    gps_points: list[list[float]] = []

    while True:
        cv2.imshow("MFU - Homography Calibration", img)
        key = cv2.waitKey(1) & 0xFF

        # As soon as a new pixel point was clicked but has no matching GPS
        # entry yet, prompt for it right here (blocks the loop briefly, which
        # is fine - clicking is a slow, deliberate action anyway).
        if len(clicked_points) > len(gps_points):
            try:
                raw = input(
                    f"   Enter GPS for point {len(clicked_points)} as 'lat,lng' "
                    f"(e.g. 20.045159,99.889588): "
                ).strip()
                lat_str, lng_str = raw.split(",")
                gps_points.append([float(lat_str.strip()), float(lng_str.strip())])
            except (ValueError, IndexError):
                print("   ⚠️ Couldn't parse that - format must be 'lat,lng'. Try again after the next click, or undo this point by pressing 'u'.")
                clicked_points.pop()  # let them re-click

        if key == ord("q"):
            break
        if key == ord("u") and clicked_points:
            clicked_points.pop()
            if gps_points and len(gps_points) > len(clicked_points):
                gps_points.pop()
            print("   ↩️ Undid last point.")

    cv2.destroyAllWindows()

    if len(gps_points) < 4:
        print(f"\n⚠️ Only {len(gps_points)} point(s) collected - need at least 4 for a valid calibration. Nothing saved.")
        return

    # Load, update, and save the calibration file (preserving other cameras' entries)
    calibration_path = CONFIG_DIR / "homography_calibration.yaml"
    if calibration_path.exists():
        with open(calibration_path, "r", encoding="utf-8") as f:
            raw = yaml.safe_load(f) or {}
    else:
        raw = {}
    if "cameras" not in raw or raw["cameras"] is None:
        raw["cameras"] = {}

    raw["cameras"][camera_id] = {
        "calibration_points": [
            {"pixel": px, "gps": gps} for px, gps in zip(clicked_points, gps_points)
        ]
    }

    with open(calibration_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(raw, f, allow_unicode=True, sort_keys=False, default_flow_style=None)

    print(f"\n✅ Saved {len(gps_points)} calibration points for '{camera_id}' to {calibration_path}")
    print("   Restart the pipeline for this to take effect.")


if __name__ == "__main__":
    main()