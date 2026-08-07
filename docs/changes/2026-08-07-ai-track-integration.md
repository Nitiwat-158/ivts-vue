# AI-Track Integration Summary (2026-08-07)

This document summarizes the recent integration work to expose the ai-track vehicle tracking system to the IVTS backend, mobile client, and admin UI.

Summary
- Exposed ai-track data via two surfaces:
  - Admin (protected): `/api/v1/ai-track/*` (mounted in `backend-node/server/routes/app.routes.js`) — requires IAM permission `/ivts/tracking:view`.
  - Mobile (public, read-only): `/api/v1/mobile/ai-track/*` (mounted in `backend-node/server/Project/ivts/mobile.routes.js`) — used by the Flutter client.

Key changes
- Backend (backend-node):
  - Added `server/services/aiTrackAdapter.js` with SQL helpers and timeline formatting.
  - Mobile routes: added mobile endpoints in `server/Project/ivts/mobile.routes.js`:
    - `GET /api/v1/mobile/ai-track/cameras` — camera metadata from `ai-track/config/cameras.yaml`.
    - `GET /api/v1/mobile/ai-track/vehicles/recent?limit=N` — recent ai-track `global_id` summaries.
    - `GET /api/v1/mobile/ai-track/vehicles/full-route?cameras=CAM1,CAM2` — vehicles visiting specified cameras.
    - `GET /api/v1/mobile/ai-track/vehicle/:global_id/timeline` — timeline + route polyline for a given ai-track `global_id`.
  - Mobile vehicle enrichment: added optional mapping collection and model `server/Project/ivts/models/ai_track_mapping.model.js` and updated `server/Project/ivts/service/mobile.js` to include `ai_track_global_id` in vehicle objects when mappings exist.
  - Test: added `backend-node/test/mobile-ai-track-mapping.test.js` to validate the mapping enrichment logic.

- Mobile client (Flutter):
  - Added `fetchAiTrackVehicleTimeline(int globalId)` to `user-mobile-application/lib/services/mobile_api_service.dart`.
  - Updated `user-mobile-application/lib/screens/vehicle_details_screen.dart` to provide a "Show Tracking Timeline" button that fetches and displays the ai-track timeline.
  - Added optional `aiTrackGlobalId` to `user-mobile-application/lib/models/vehicle.dart` and mapping logic in JSON parsing.

- CI / tests:
  - Ensured `dotenv` is installed and `smoke:ai-track` runs in CI using `npm ci --silent` (cached) before executing smoke script.
  - Added a local unit test to verify mapping behavior.

Environment & Usage
- Env vars used by ai-track DB connection in backend:
  - `AI_TRACK_DATABASE_URL` or `AI_TRACK_DB_USER`, `AI_TRACK_DB_HOST`, `AI_TRACK_DB_NAME`, `AI_TRACK_DB_PASSWORD`, `AI_TRACK_DB_PORT`.
- Run smoke script locally (backend-node):
  - `cd backend-node && node -r dotenv/config scripts/smoke-ai-track.js`

Developer notes
- `global_id` in ai-track is a cross-camera ReID identity (one row in `vehicle_identities` per physical vehicle). This is NOT the same as the IVTS `vehicle_id`/`vehicle_code` (which identifies a registered vehicle record). The integration uses an optional `ai_track_mappings` collection to map IVTS vehicle `_id` → ai-track `global_id` where available.
- Mobile clients should rely on `ai_track_global_id` when present. The UI falls back to parsing `vehicle.vehicleCode` only as a fallback when mapping is not available.

Next steps / Recommendations
1. Seed `ai_track_mappings` for reconciled vehicles (admin script or CSV importer). Without it, many mobile vehicles will lack `ai_track_global_id` and timeline lookups will not be possible.
2. Add permission seeding and verify `authorization.requirePermission('/ivts/tracking','view')` is present in the admin route mount.
3. Consider adding a small admin UI to manage `ai_track_mappings` (CSV import, manual link/unlink).
4. Add monitoring/health endpoints for the ai-track adapter (DB connectivity, last-sync times).
5. Privacy review: confirm PDPA guidance for delivering ReID data to mobile clients and audit logging for timeline requests.

Files changed (high level)
- backend-node/server/services/aiTrackAdapter.js
- backend-node/server/routes/aiTrack.routes.js
- backend-node/server/Project/ivts/mobile.routes.js
- backend-node/server/Project/ivts/service/mobile.js
- backend-node/server/Project/ivts/models/ai_track_mapping.model.js (new)
- backend-node/test/mobile-ai-track-mapping.test.js (new)
- user-mobile-application/lib/services/mobile_api_service.dart
- user-mobile-application/lib/screens/vehicle_details_screen.dart
- user-mobile-application/lib/models/vehicle.dart
- .gitlab-ci.yml (smoke job: `npm ci --silent`, caching)

If you'd like, I can:
- Add a simple `scripts/seed-ai-track-mappings.js` to insert mappings from a CSV, or
- Add an admin CSV import endpoint to upload mappings, or
- Draft a short runbook for CI secrets and manual smoke execution.

Contact
- For questions about the SQL schema see `ai-track/sql/schema.sql`.
