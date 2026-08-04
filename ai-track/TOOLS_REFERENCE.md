# MFU Vehicle Tracking - Tools Reference

## Quick decision table

| What you want to do | Command | When to use it |
|---|---|---|
| **Block out an irrelevant area** in a camera's view (e.g. a sidewalk, a zone outside your interest) | `python -m tools.maskpoint_picker CAM08` | Only if that specific camera has junk/irrelevant area to hide. **Optional per camera** — skip it if the camera's whole frame is fine as-is |
| **Fix a camera that sees multiple directions/corners** (so vehicles get the correct GPS, not one fixed point) | `python -m tools.calibration_picker CAM08` | Only for cameras at intersections/splits/corners. Most cameras don't need this |
| **Make the road between 2 cameras look smooth on the map** (not a straight line) | Double-click `tools/waypoint_picker.html` to open it in a browser (no terminal command) | Only for camera pairs where the road curves. Manually copy-paste the result into `route_segments.yaml` after |
| **Check why a detection isn't showing up** (debug low confidence) | `python -m tools.debug_detection CAM08 --seconds 30` | Only when troubleshooting a detection problem |
| **Check a specific detection's cross-camera match** (debug ReID) | `python -m tools.reid_lookup_cli <log_id>` | Only for debugging, needs a real `log_id` from the DB |
| **Create fake test data (auto-guessed positions)** | `python -m tools.seed_test_data --cameras CAM01 CAM02 ...` | Only for testing the API/frontend without waiting for real traffic |
| **Create fake test data (exact hand-typed positions)** | `python -m tools.seed_test_data --route-file config/manual_route.yaml` | When you want full manual control over the seeded polyline shape - see `config/example_manual_route.yaml` |
| **Delete previously seeded fake test data** | `python -m tools.seed_test_data --cleanup` | Clean up before/after testing with fake data |
| **Merge zigzagging overlapping-camera detections in EXISTING data** | `python -m tools.backfill_fusion` (preview), then `--apply` | One-off cleanup for data saved before live fusion existed. Always preview first - it deletes rows once applied |
| **Find a good `match_threshold` value using your real data** | `python -m tools.analyze_reid_distances` | Run this before guessing a threshold - or whenever ReID seems to be merging different vehicles into one ID |
| **Run the actual system** (cameras + detection + tracking + ReID + saving to DB) | `python -m pipeline.tracker_pipeline` | **Main one you run every time** to actually operate the system |
| **Run the API** (so the Flutter app / frontend can fetch data) | `uvicorn api.main:app --reload --host 0.0.0.0 --port 8000` | **Also run every time**, alongside the pipeline |

## The only 2 commands you need every single time you actually run the system

```powershell
# Terminal 1
python -m pipeline.tracker_pipeline

# Terminal 2
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Everything else in the table above is a **one-time setup/calibration step per camera**, a **debugging/diagnostic tool**, or a **test-data helper** — not something you run every time.

## Config files these tools read/write

| File | Written by | Purpose |
|---|---|---|
| `config/cameras.yaml` | You (manual edits) + `maskpoint_picker` | Camera list, RTSP URLs, GPS, mask points, per-camera conf/tracker overrides |
| `config/homography_calibration.yaml` | `calibration_picker` | Pixel↔GPS points for cameras that see multiple directions/corners |
| `config/route_segments.yaml` | You (manual paste from `waypoint_picker.html`) | Road-following waypoints between camera pairs |
| `config/camera_travel_times.yaml` | You (manual edits) | Minimum realistic seconds to drive between camera pairs, used to reject implausible ReID matches |
| `config/example_manual_route.yaml` | You (copy + edit) | Template for `seed_test_data --route-file` |

## Notes on the calibration/route tools

- **`maskpoint_picker`** and **`calibration_picker`** only save when you press `q` in the image window. If you don't want to keep what you clicked, press **Ctrl+C** in the terminal instead of `q`.
- Both tools write into plain YAML config files — you can always open these files and manually edit/delete entries by hand if needed, no tool required to undo something.
- **`waypoint_picker.html`** is different from the other tools — it runs entirely in your browser (no Python, no terminal), and clicking gives you real GPS directly (since it's a real map, not a camera frame). It doesn't save automatically; you copy-paste its output into `config/route_segments.yaml` yourself.
- For camera pairs with a one-way loop or a divided road with a traffic island, run `waypoint_picker.html` **twice** (once per direction, checkbox unchecked both times) — see the tool's built-in note for details.
- Route segment waypoints should only cover the road **between** two cameras' viewing areas - never reach into either camera's own calibrated zone, or you'll get an overshoot/spike shape on the map.

## Notes on the ReID/matching diagnostic tools

- **`analyze_reid_distances`** only needs real data already in your database (no live cameras required at the moment you run it) - it looks at same-camera-same-track_id pairs (near-certain same vehicle) vs. same-camera-different-track_id pairs seen close in time (guaranteed different vehicles) to suggest a `match_threshold`. If it reports the two distributions overlap, no threshold alone will fully fix mismatches - you also need `camera_travel_times.yaml` tuned well, or eventually fine-tuned (not generic ImageNet) ReID weights.
- **`backfill_fusion`** always defaults to a dry-run (prints what it *would* merge, changes nothing) - you must pass `--apply` to actually modify the database. Always run the preview first.
- If you see one `global_id` cycling through many different `track_id`s over a long time span at the same intersection, that's the ReID matcher merging different real vehicles into one identity - not a route segment/waypoint issue. Fix via `match_threshold` (informed by `analyze_reid_distances`) and/or `camera_travel_times.yaml`, not by touching route segments.
