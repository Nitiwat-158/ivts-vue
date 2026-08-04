"""
OSNet feature extractor - replaces the ResNet18-based extract_vehicle_vector()
from the original test.py.

Uses torchreid's FeatureExtractor helper, which downloads pretrained OSNet
weights automatically on first use and handles preprocessing internally.

Install:
    pip install torchreid
    (if the PyPI release lags behind, install from source instead:
     pip install git+https://github.com/KaiyangZhou/deep-person-reid.git)
"""
from __future__ import annotations

from typing import List

import cv2
import numpy as np

try:
    # Newer / GitHub-source torchreid layout: torchreid.utils.FeatureExtractor
    from torchreid.utils import FeatureExtractor
except ImportError:
    try:
        # PyPI release 0.2.5 nests everything under torchreid.reid.*
        from torchreid.reid.utils import FeatureExtractor
    except ImportError as e:  # pragma: no cover
        raise ImportError(
            "torchreid is not installed (or its layout wasn't recognized). "
            "Run: pip install torchreid "
            "(or pip install --no-build-isolation git+https://github.com/KaiyangZhou/deep-person-reid.git)"
        ) from e


class OSNetExtractor:
    """
    Thin wrapper so the rest of the codebase doesn't care which ReID backbone
    is in use - swap the model_name here (e.g. 'osnet_x0_25' for a lighter/
    faster model on 10 concurrent streams) without touching pipeline code.
    """

    def __init__(self, model_name: str = "osnet_x1_0", device: str = "cuda"):
        self.extractor = FeatureExtractor(
            model_name=model_name,
            model_path="",  # empty = use torchreid's pretrained ImageNet/ReID weights
            device=device,
        )

    def extract(self, cropped_bgr_frame: np.ndarray) -> List[float]:
        """
        cropped_bgr_frame: a BGR numpy array as produced by OpenCV (frame[y1:y2, x1:x2]).
        Returns a 512-d python list ready to be inserted into pgvector.
        """
        try:
            rgb = cv2.cvtColor(cropped_bgr_frame, cv2.COLOR_BGR2RGB)
            # torchreid's FeatureExtractor accepts a list of numpy images (RGB, HWC)
            features = self.extractor([rgb])
            vector = features[0].cpu().numpy().tolist()
            return vector
        except Exception as e:
            print(f"⚠️ [ReID Error] OSNet feature extraction failed: {e}")
            return [0.0] * 512
