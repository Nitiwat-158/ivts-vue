"""
Applies each camera's calibrated mask polygon (from cameras.yaml, produced by
tools/maskpoint_picker.py) to black out irrelevant regions before detection.
"""
from __future__ import annotations

from typing import List

import cv2
import numpy as np


def apply_mask(frame: np.ndarray, mask_points: List[List[int]]) -> np.ndarray:
    """Returns a masked COPY of frame. If mask_points is empty, returns an
    unmasked copy (i.e. masking is a no-op for cameras not yet calibrated)."""
    masked = frame.copy()
    if not mask_points:
        return masked
    polygon = np.array(mask_points, dtype=np.int32)
    cv2.fillPoly(masked, [polygon], (0, 0, 0))
    return masked
