"""
Threaded RTSP reader - same design as the original test.py, extracted into
its own module so it can be reused/tested independently and scaled to 10
cameras without duplicating code.
"""
from __future__ import annotations

import os
import threading
import time

import cv2

# Force FFmpeg to use RTSP-over-TCP instead of the default UDP. UDP silently
# drops packets on unstable networks, which shows up as HEVC decode errors
# like "PPS id out of range" / "Could not find ref with POC 0" and choppy
# framerate. TCP retransmits lost packets instead of dropping them. This must
# be set before any cv2.VideoCapture(...) call.
os.environ.setdefault("OPENCV_FFMPEG_CAPTURE_OPTIONS", "rtsp_transport;tcp")


class RTSPStreamThread:
    def __init__(self, camera_id: str, rtsp_url: str, frame_width: int = 1920, frame_height: int = 1080):
        self.camera_id = camera_id
        self.rtsp_url = rtsp_url
        self.cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, float(frame_width))
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, float(frame_height))
        # Keep as small a buffer as the backend allows, so we always read the
        # NEWEST frame rather than falling behind and displaying stale ones.
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1.0)
        self.frame = None
        self.started = False
        self.read_lock = threading.Lock()
        self.thread: threading.Thread | None = None

    def start(self) -> "RTSPStreamThread":
        if self.started:
            return self
        self.started = True
        self.thread = threading.Thread(target=self._update, args=(), daemon=True)
        self.thread.start()
        return self

    def _update(self):
        while self.started:
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(0.05)
                continue
            with self.read_lock:
                self.frame = frame

    def read(self):
        with self.read_lock:
            return self.frame

    def stop(self):
        self.started = False
        if self.thread is not None:
            self.thread.join(timeout=2)
        self.cap.release()
