# MFU Vehicle Tracking System — Reconstructed

Reconstruction of your 4 original scripts (`main.py`, `Maskpoint.py`, `test.py`,
`test_reid_match.py`) into one project, scaled from 2 → 10 cameras, with
ResNet18 swapped for **OSNet** and **ByteTrack** kept as the tracker.

## What changed, and why

| Old file | New location | What changed |
|---|---|---|
| `test.py` | `pipeline/tracker_pipeline.py` + `pipeline/camera_stream.py` + `pipeline/mask_utils.py` | Config-driven (10 cams via YAML), OSNet instead of ResNet18, batched multi-camera ByteTrack, bounded DB thread pool instead of unbounded threads |
| `Maskpoint.py` | `tools/maskpoint_picker.py` | Picks a camera by id from config, writes calibrated points **directly into `cameras.yaml`** instead of printing an array to copy-paste |
| `test_reid_match.py` | `tools/reid_lookup_cli.py` + `common/reid_matcher.py` | Matching logic extracted into a shared module so the **live pipeline** and this **offline debug tool** use identical logic |
| `main.py` | `api/main.py` | Camera list from config, timeline now keyed by cross-camera `global_id` instead of per-camera `track_id`, new `/api/vehicles/recent` endpoint, configurable CORS |
| *(new)* | `common/config.py`, `common/db.py`, `common/reid_extractor.py` | Shared config/DB/ReID code so nothing is copy-pasted across files anymore |
| *(new)* | `sql/schema.sql` | Adds `vehicle_identities` table + `global_id` column |

## The one architectural fix that matters most for your goal

Your original schema tracked vehicles by ByteTrack's `track_id`, which is
**only unique within one camera's live session** — it resets when the script
restarts and has no relationship to `track_id`s on other cameras. With 2
cameras you could mostly get away with treating each camera's timeline
separately. With **10 cameras**, that breaks the actual goal: *one polyline
per vehicle across all cameras.*

Fix: every detection saved to the DB now goes through `common/reid_matcher.py`,
which uses OSNet cosine-distance matching (the same logic your
`test_reid_match.py` did manually) to either attach the detection to an
**existing** `global_id` (same physical vehicle, seen on another camera
recently) or create a **new** one. `vehicle_logs.global_id` is what the API's
`/api/vehicle/timeline/{global_id}` endpoint queries — it returns the vehicle's
full cross-camera route, ordered by time, ready for `L.polyline()` in Leaflet.

## Setup

```bash
pip install -r requirements.txt --break-system-packages   # if using this sandboxed env
# or in your own venv:
pip install -r requirements.txt

copy config\.env.example config\.env
# edit config/.env: DB password + all 10 CAMxx_RTSP_URL values

# edit config/cameras.yaml: fill in real GPS coords + location_name for CAM03-CAM10
# (CAM01/CAM02 already carry your original coordinates)

psql -U postgres -d mfu_vehicle_track -f sql/schema.sql
```

> **torchreid note**: `pip install torchreid` pulls a community-maintained
> PyPI package. If it's out of date or errors on install, use:
> `pip install git+https://github.com/KaiyangZhou/deep-person-reid.git`
> Both work with `common/reid_extractor.py` unchanged.

## Calibrate masks (once per camera)

```bash
python -m tools.maskpoint_picker CAM03
```
Click the polygon, press `q`. Points are written straight into
`config/cameras.yaml` — no more copy-pasting a printed array.

## Run

```bash
# Live pipeline (detection + tracking + ReID + DB save) — all 10 cameras
python -m pipeline.tracker_pipeline

# API (for your Leaflet frontend)
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Offline debug lookup for a specific log_id
python -m tools.reid_lookup_cli 10
```

## API for the Leaflet frontend

- `GET /api/cameras` — pins for all 10 cameras (unchanged shape from before)
- `GET /api/vehicles/recent?limit=50` — list of recently-seen vehicles
  (`global_id`, first/last seen, how many cameras) to populate a selector
- `GET /api/vehicle/timeline/{global_id}` — ordered `[{lat, lng, timestamp,
  camera_id, ...}]` across **all** cameras that vehicle was seen on — feed
  the `lat`/`lng` pairs in order directly into `L.polyline()`

## Things worth deciding before you go to production with 10 cameras

1. **GPU for OSNet + YOLO.** `reid.device` and `detection.device` are separate
   in `cameras.yaml` on purpose — with 10 streams, running both on CPU will
   likely bottleneck. If you have a GPU, set both to `cuda`.
2. **`match_threshold: 0.35` and `match_window_minutes: 30`** are carried over
   from your original script unchanged — worth re-tuning once you have real
   OSNet vectors from more cameras/distances, since OSNet's distance
   distribution may differ slightly from ResNet18's.
3. **The `ivfflat` vector index** in `sql/schema.sql` is commented out —
   build it once you have real data, or 10 cameras' worth of `vehicle_logs`
   will make the matcher's nearest-neighbour query slow over time.
4. **Existing data migration**: if you already have rows in the old schema,
   see the migration notes at the bottom of `sql/schema.sql`.
