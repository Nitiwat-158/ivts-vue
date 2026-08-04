"""
Pixel-to-GPS conversion via homography, for cameras calibrated in
config/homography_calibration.yaml.

For a camera with 4+ known pixel<->GPS point pairs, this computes a
perspective transform once at startup, then converts any detection's pixel
position into a real GPS coordinate - correctly handling cameras that see
multiple directions/an intersection/a road split, which a single fixed
camera-level lat/lng cannot represent accurately.

This treats (lat, lng) as a flat 2D plane for the transform, which is a fine
approximation over the small physical area a single camera actually covers
(tens of meters) - it is NOT valid over large distances/whole-city scale.
"""
from __future__ import annotations

from typing import List, Optional, Tuple

import numpy as np
import cv2

from common.config import CalibrationPoint

MIN_CALIBRATION_POINTS = 4


def build_homography(calibration_points: List[CalibrationPoint]) -> Optional[np.ndarray]:
    """Returns a 3x3 homography matrix, or None if there aren't enough points to calibrate."""
    if len(calibration_points) < MIN_CALIBRATION_POINTS:
        return None

    src_pixels = np.array([cp.pixel for cp in calibration_points], dtype=np.float32)
    dst_gps = np.array([cp.gps for cp in calibration_points], dtype=np.float32)

    matrix, _ = cv2.findHomography(src_pixels, dst_gps)
    return matrix


def pixel_to_gps(matrix: np.ndarray, pixel_x: float, pixel_y: float) -> Tuple[float, float]:
    """Converts one pixel coordinate to (lat, lng) using a precomputed homography matrix."""
    point = np.array([[[pixel_x, pixel_y]]], dtype=np.float32)
    transformed = cv2.perspectiveTransform(point, matrix)
    lat, lng = transformed[0][0]
    return float(lat), float(lng)


def ground_contact_point(x1: int, y1: int, x2: int, y2: int) -> Tuple[float, float]:
    """
    The pixel point on a detection box that best represents where the
    vehicle actually touches the ground - bottom-center of the box. This is
    what should be fed into pixel_to_gps(), not the box center, since the
    box center (especially for tall vehicles close to the camera) can be
    well above the vehicle's real ground position.
    """
    center_x = (x1 + x2) / 2
    bottom_y = y2
    return center_x, bottom_y
