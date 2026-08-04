"""
Interactive mask calibration tool - replaces Maskpoint.py.

Usage:
    python -m tools.maskpoint_picker CAM03

Grabs one frame from the requested camera's RTSP stream, lets you click
points to outline the area to black out (e.g. a road outside your zone of
interest), and on pressing 'q' writes the polygon straight back into
config/cameras.yaml under that camera's mask_points - no more manual
copy-pasting an array into source code.
"""
from __future__ import annotations

import sys

import cv2

from common.config import load_config, save_camera_mask_points

points: list[list[int]] = []


def click_event(event, x, y, flags, params):
    global img
    if event == cv2.EVENT_LBUTTONDOWN:
        print(f"📍 Point {len(points) + 1}: [{x}, {y}]")
        points.append([x, y])
        cv2.circle(img, (x, y), 5, (0, 0, 255), -1)
        if len(points) > 1:
            cv2.line(img, tuple(points[-2]), (x, y), (0, 255, 0), 2)
        cv2.imshow("MFU - Find Mask Points", img)


def main():
    if len(sys.argv) != 2:
        print("Usage: python -m tools.maskpoint_picker <CAMERA_ID>")
        print("Example: python -m tools.maskpoint_picker CAM03")
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

    print("💡 Left-click to outline the area to mask (clockwise, close the loop).")
    print("👉 Press 'q' when done to save the polygon into cameras.yaml.")

    cv2.namedWindow("MFU - Find Mask Points", cv2.WINDOW_NORMAL)
    cv2.setMouseCallback("MFU - Find Mask Points", click_event)

    while True:
        cv2.imshow("MFU - Find Mask Points", img)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cv2.destroyAllWindows()

    if points:
        save_camera_mask_points(camera_id, points)
        print(f"\n✅ Saved {len(points)} points to config/cameras.yaml under '{camera_id}'.")
        print(f"mask_points: {points}")
    else:
        print("\n⚠️ No points clicked - cameras.yaml left unchanged.")


if __name__ == "__main__":
    main()
