"""
Central config loader.

Merges config/cameras.yaml (structure) with config/.env (secrets) so every
other module (pipeline, api, tools) reads from ONE place instead of having
DB credentials / RTSP URLs hardcoded in multiple files like the original
project did.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

import yaml
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONFIG_DIR = PROJECT_ROOT / "config"

# Load .env once (config/.env, falling back to project-root .env)
_env_path = CONFIG_DIR / ".env"
if _env_path.exists():
    load_dotenv(_env_path)
else:
    load_dotenv(PROJECT_ROOT / ".env")


@dataclass
class CalibrationPoint:
    pixel: List[float]  # [x, y] in camera frame
    gps: List[float]    # [lat, lng]


@dataclass
class CameraConfig:
    id: str
    rtsp_url: Optional[str]
    location_name: str
    lat: float
    lng: float
    mask_points: List[List[int]] = field(default_factory=list)
    conf: Optional[float] = None       # overrides detection.conf for this camera only, if set
    tracker: Optional[str] = None      # overrides detection.tracker for this camera only, if set
    calibration_points: List[CalibrationPoint] = field(default_factory=list)  # for homography - see config/homography_calibration.yaml


@dataclass
class ReidConfig:
    model_name: str
    device: str
    match_threshold: float
    match_window_minutes: int
    vector_dim: int
    fusion_window_seconds: float = 2.0  # optional in cameras.yaml - see common/fusion.py docstring


@dataclass
class DetectionConfig:
    model_path: str
    tracker: str
    conf: float
    device: str
    frame_width: int
    frame_height: int
    save_cooldown_seconds: int
    display: bool


@dataclass
class DbConfig:
    dbname: str
    user: str
    password: str
    host: str
    port: str

    def as_psycopg2_kwargs(self) -> dict:
        return {
            "dbname": self.dbname,
            "user": self.user,
            "password": self.password,
            "host": self.host,
            "port": self.port,
        }


@dataclass
class RouteSegment:
    camera_a: str
    camera_b: str
    waypoints: List[List[float]]  # ordered [lat, lng] points, direction: camera_a -> camera_b
    directional: bool = False     # True = ONLY valid camera_a -> camera_b (e.g. one-way loop/rectangle roads).
                                   # False = same physical road either direction, waypoints get reversed automatically.


@dataclass
class AppConfig:
    cameras: List[CameraConfig]
    reid: ReidConfig
    detection: DetectionConfig
    db: DbConfig
    cors_origins: List[str]
    route_segments: List[RouteSegment] = field(default_factory=list)
    travel_times: dict = field(default_factory=dict)         # {(camA, camB) sorted tuple: min_seconds}
    default_min_travel_seconds: float = 3.0
    route_graph: dict = field(default_factory=dict)          # {camera_id: [allowed_next_camera_id, ...]}
    route_graph_enabled: bool = False                         # only True if config/camera_route_graph.yaml exists

    def get_camera(self, camera_id: str) -> Optional[CameraConfig]:
        return next((c for c in self.cameras if c.id == camera_id), None)

    def is_valid_transition(self, previous_camera: str, current_camera: str) -> bool:
        """
        Checks config/camera_route_graph.yaml (if present) for whether a
        vehicle could legally have travelled from previous_camera directly
        to current_camera, based on your campus's real one-way traffic flow.

        This is an OPT-IN check: if camera_route_graph.yaml doesn't exist,
        this always returns True (no restriction) - the file's absence means
        the feature is simply off, not "everything forbidden".

        A camera key missing from the file (or present with no items under
        it) means that camera is treated as a dead end - no legal next hop.
        """
        if not self.route_graph_enabled:
            return True
        allowed = self.route_graph.get(previous_camera) or []
        return current_camera in allowed

    def get_min_travel_seconds(self, camera_a: str, camera_b: str) -> float:
        """
        Minimum realistic seconds to drive between two cameras - used to
        reject a ReID match that would require impossible-speed travel.
        Symmetric (order doesn't matter). Falls back to
        default_min_travel_seconds if this specific pair isn't configured
        in config/camera_travel_times.yaml.
        """
        key = tuple(sorted([camera_a, camera_b]))
        return self.travel_times.get(key, self.default_min_travel_seconds)

    def get_route_waypoints(self, camera_from: str, camera_to: str) -> List[List[float]]:
        """
        Returns waypoints (ordered [lat, lng]) to travel FROM camera_from TO
        camera_to.

        - Non-directional segments (defined with `between:` in
          route_segments.yaml) represent the SAME physical road either
          direction - matched regardless of order, reversing the waypoint
          list automatically if travelling the opposite way it was defined.
        - Directional segments (defined with `from:`/`to:`) represent a
          ONE-WAY path only - e.g. a rectangular one-way loop where going
          CAM06->CAM07 and CAM07->CAM06 are physically DIFFERENT roads, not
          the same road reversed. These only match the exact direction they
          were defined in; the opposite direction needs its OWN separate
          directional entry with its own waypoints.

        Returns [] if no segment connects these two cameras (caller should
        just draw a straight line in that case, same as before this feature
        existed).
        """
        for seg in self.route_segments:
            if seg.camera_a == camera_from and seg.camera_b == camera_to:
                return seg.waypoints
            if not seg.directional and seg.camera_a == camera_to and seg.camera_b == camera_from:
                return list(reversed(seg.waypoints))
        return []


def load_config(yaml_path: Optional[Path] = None) -> AppConfig:
    yaml_path = yaml_path or (CONFIG_DIR / "cameras.yaml")
    with open(yaml_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    # Optional homography calibration file - camera_id -> list of {pixel, gps} pairs
    calibration_by_camera: dict[str, list] = {}
    calibration_path = CONFIG_DIR / "homography_calibration.yaml"
    if calibration_path.exists():
        with open(calibration_path, "r", encoding="utf-8") as f:
            calibration_raw = yaml.safe_load(f) or {}
        for cam_id, cam_data in (calibration_raw.get("cameras") or {}).items():
            points = [
                CalibrationPoint(pixel=p["pixel"], gps=p["gps"])
                for p in (cam_data.get("calibration_points") or [])
            ]
            calibration_by_camera[cam_id] = points

    cameras = []
    for cam in raw["cameras"]:
        rtsp_url = os.getenv(cam["rtsp_url_env"])
        tracker_override = cam.get("tracker")
        if tracker_override and not os.path.isabs(tracker_override):
            # Only resolve custom file paths, not ultralytics' built-in names
            # like "bytetrack.yaml" / "botsort.yaml" which it resolves itself.
            candidate = PROJECT_ROOT / tracker_override
            if candidate.exists():
                tracker_override = str(candidate)

        cameras.append(
            CameraConfig(
                id=cam["id"],
                rtsp_url=rtsp_url,
                location_name=cam["location_name"],
                lat=cam["lat"],
                lng=cam["lng"],
                mask_points=cam.get("mask_points", []) or [],
                conf=cam.get("conf"),
                tracker=tracker_override,
                calibration_points=calibration_by_camera.get(cam["id"], []),
            )
        )

    reid = ReidConfig(**raw["reid"])
    detection = DetectionConfig(**raw["detection"])

    db = DbConfig(
        dbname=os.getenv("DB_NAME", "mfu_vehicle_track"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )

    cors_raw = os.getenv("API_CORS_ORIGINS", "*")
    cors_origins = ["*"] if cors_raw.strip() == "*" else [o.strip() for o in cors_raw.split(",")]

    route_segments: List[RouteSegment] = []
    segments_path = CONFIG_DIR / "route_segments.yaml"
    if segments_path.exists():
        with open(segments_path, "r", encoding="utf-8") as f:
            segments_raw = yaml.safe_load(f) or {}
        for seg in segments_raw.get("segments", []) or []:
            waypoints = seg.get("waypoints", []) or []
            if "between" in seg:
                # Symmetric - same physical road, either direction (reversed automatically)
                cam_a, cam_b = seg["between"]
                route_segments.append(RouteSegment(camera_a=cam_a, camera_b=cam_b, waypoints=waypoints, directional=False))
            elif "from" in seg and "to" in seg:
                # Directional - a ONE-WAY path only (e.g. one-way loop/rectangle roads).
                # The opposite direction needs its own separate directional entry.
                route_segments.append(
                    RouteSegment(camera_a=seg["from"], camera_b=seg["to"], waypoints=waypoints, directional=True)
                )
            else:
                raise ValueError(
                    f"route_segments.yaml entry must have either 'between: [A, B]' or 'from: A' + 'to: B': {seg}"
                )

    travel_times: dict = {}
    default_min_travel_seconds = 3.0
    travel_times_path = CONFIG_DIR / "camera_travel_times.yaml"
    if travel_times_path.exists():
        with open(travel_times_path, "r", encoding="utf-8") as f:
            travel_raw = yaml.safe_load(f) or {}
        default_min_travel_seconds = travel_raw.get("default_min_seconds", 3.0)
        for pair in travel_raw.get("pairs", []) or []:
            cam_a, cam_b = pair["between"]
            travel_times[tuple(sorted([cam_a, cam_b]))] = pair["min_seconds"]

    route_graph: dict = {}
    route_graph_enabled = False
    route_graph_path = CONFIG_DIR / "camera_route_graph.yaml"
    if route_graph_path.exists():
        with open(route_graph_path, "r", encoding="utf-8") as f:
            graph_raw = yaml.safe_load(f) or {}
        allowed_next = graph_raw.get("allowed_next") or {}
        # Guard against YAML parsing an empty block (e.g. "CAM05:" with
        # nothing under it) as None instead of [] - both mean "dead end".
        route_graph = {cam_id: (next_list or []) for cam_id, next_list in allowed_next.items()}
        route_graph_enabled = True

    return AppConfig(
        cameras=cameras, reid=reid, detection=detection, db=db,
        cors_origins=cors_origins, route_segments=route_segments,
        travel_times=travel_times, default_min_travel_seconds=default_min_travel_seconds,
        route_graph=route_graph, route_graph_enabled=route_graph_enabled,
    )


def save_camera_mask_points(camera_id: str, mask_points: List[List[int]], yaml_path: Optional[Path] = None) -> None:
    """Used by tools/maskpoint_picker.py to write calibrated points straight back into cameras.yaml."""
    yaml_path = yaml_path or (CONFIG_DIR / "cameras.yaml")
    with open(yaml_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    found = False
    for cam in raw["cameras"]:
        if cam["id"] == camera_id:
            cam["mask_points"] = mask_points
            found = True
            break

    if not found:
        raise ValueError(f"Camera id '{camera_id}' not found in {yaml_path}")

    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(raw, f, allow_unicode=True, sort_keys=False)