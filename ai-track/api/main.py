"""
MFU Vehicle Tracking API - replaces main.py.

Key changes from the original:
  - Camera registry now comes from config/cameras.yaml (10 cameras) instead
    of a 2-entry hardcoded dict, so adding a camera is a YAML edit only.
  - Timeline endpoint is now keyed by GLOBAL_ID (cross-camera vehicle
    identity), not the old camera-local track_id, so it returns one
    continuous route across all 10 cameras.
  - The timeline endpoint also returns a `route` field: the polyline path
    with road-following waypoints (config/route_segments.yaml) inserted
    between cameras, so the drawn line follows the actual road instead of
    jumping in a straight line from camera to camera.
  - New /api/vehicles/recent endpoint so the frontend can list/search which
    vehicles are available to plot, instead of needing to already know an id.
  - CORS origins are configurable via .env instead of a hardcoded "*".

Run:
    uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from common.config import load_config
from common.db import Database, get_dict_cursor

config = load_config()
db = Database(config)

app = FastAPI(
    title="MFU Vehicle Tracking System API",
    description="API สำหรับดึงข้อมูลพิกัดกล้องและประวัติ Timeline ข้ามกล้องของรถยนต์ภายใน มฟู.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "Online", "message": "MFU Vehicle Tracking API ยินดีต้อนรับครับ", "cameras": len(config.cameras)}


@app.get("/api/cameras")
def get_cameras():
    """Camera pins for the Leaflet map - one entry per camera in cameras.yaml."""
    return {
        cam.id: {
            "lat": cam.lat,
            "lng": cam.lng,
            "location_name": cam.location_name,
        }
        for cam in config.cameras
    }


@app.get("/api/vehicles/recent")
def get_recent_vehicles(limit: int = 50):
    """
    Lists recently-seen vehicles (global_ids) with how many cameras they've
    been spotted on - use this to populate a search/select list in the
    frontend before requesting a specific timeline/polyline.
    """
    try:
        with db.connection() as conn:
            cur = get_dict_cursor(conn)
            rows = db.get_recent_vehicles(cur, limit=limit)
        return {"count": len(rows), "vehicles": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vehicles/full-route")
def get_vehicles_full_route(cameras: str = None):
    """
    Finds vehicles (global_ids) that have been detected by EVERY camera in
    the given comma-separated list - e.g.
    /api/vehicles/full-route?cameras=CAM01_Gate_in,CAM02_Gate_in,CAM03,CAM05

    If `cameras` is omitted, defaults to every camera currently in
    cameras.yaml (i.e. "find vehicles that went through ALL configured cameras").
    """
    required = [c.strip() for c in cameras.split(",")] if cameras else [c.id for c in config.cameras]
    try:
        with db.connection() as conn:
            cur = conn.cursor()
            rows = db.get_vehicles_visiting_all_cameras(cur, required)
        results = [
            {
                "global_id": row[0],
                "cameras_visited": row[1],
                "first_seen": row[2].strftime("%Y-%m-%d %H:%M:%S"),
                "last_seen": row[3].strftime("%Y-%m-%d %H:%M:%S"),
            }
            for row in rows
        ]
        return {"required_cameras": required, "count": len(results), "vehicles": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vehicle/timeline/{global_id}")
def get_vehicle_timeline(global_id: int):
    """
    Cross-camera timeline for one vehicle (global_id), ordered oldest -> newest.

    Returns TWO things for the frontend:
      - `timeline`: one entry per actual detection (unchanged from before) -
        use this for markers/info popups at each camera.
      - `route`: the full path as [lat, lng] pairs, INCLUDING any
        road-following waypoints from config/route_segments.yaml inserted
        between consecutive cameras - use THIS (not `timeline`) to draw the
        polyline, so it follows the actual road instead of a straight line
        jumping camera-to-camera.
    """
    try:
        with db.connection() as conn:
            cur = get_dict_cursor(conn)
            rows = db.get_timeline_by_global_id(cur, global_id)

        if not rows:
            raise HTTPException(status_code=404, detail=f"ไม่พบประวัติข้อมูลของรถยนต์ Global ID: {global_id}")

        formatted_timeline = []
        for row in rows:
            cam = config.get_camera(row["camera_id"])
            if cam is None:
                continue  # camera removed from config since this log was written

            # Prefer the per-detection GPS from homography calibration (if this
            # camera has one and it was computed at detection-time); otherwise
            # fall back to the camera's single fixed lat/lng - this is what
            # keeps uncalibrated cameras working exactly as before.
            point_lat = row["detected_lat"] if row["detected_lat"] is not None else cam.lat
            point_lng = row["detected_lng"] if row["detected_lng"] is not None else cam.lng

            formatted_timeline.append(
                {
                    "log_id": row["log_id"],
                    "global_id": row["global_id"],
                    "track_id": row["track_id"],
                    "camera_id": row["camera_id"],
                    "location_name": cam.location_name,
                    "timestamp": row["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
                    "predicted_class": row["predicted_class"],
                    "lat": point_lat,
                    "lng": point_lng,
                }
            )

        # Build the polyline route: each camera point, with any calibrated
        # road-following waypoints inserted between consecutive cameras.
        route: list[list[float]] = []
        for i, point in enumerate(formatted_timeline):
            if i > 0:
                prev_camera_id = formatted_timeline[i - 1]["camera_id"]
                waypoints = config.get_route_waypoints(prev_camera_id, point["camera_id"])
                route.extend(waypoints)
            route.append([point["lat"], point["lng"]])

        return {
            "global_id": global_id,
            "total_records": len(formatted_timeline),
            "timeline": formatted_timeline,
            "route": route,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))