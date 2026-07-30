# Tasklist: Vehicle Management Page Fix

| Field | Value |
|---|---|
| Date | 2026-07-27 |
| Project | IVTS |
| Module / Feature | Vehicle Management page — backend service + frontend table |
| Requirement | Show real vehicle data (vehicles + requests collections) instead of empty owner_vehicles |
| Active Change Record | `docs/changes/2026-07-27-vehicle-management-fix.md` |
| Overall Status | verifying |
| Overall Progress | 80% |
| Progress Type | Evidence-backed — backend + frontend changed + node --check PASS; live smoke pending |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| vehicles collection | 6 docs, _id=String("CR0001"), plate_number, vehicle_code, type, brand, model, color, owner_name, validity_start, validity_expiry (MongoDB Compass) |
| requests collection | 2 docs, request_status="pending_review", embedded vehicle_info.license_plate (MongoDB Compass) |
| owner_vehicles collection | EMPTY — root cause of "No data found" on Vehicle Management page |
| Backend service | `backend-node/server/Project/ivts/service/owner_vehicle.js` |
| Route | `ivts.routes.js` lines 320-327 — /owner-vehicles routes |
| Frontend page | `frontend-vue/src/projects/views/vehicles/VehicleManagement.vue` |
| Frontend table | `frontend-vue/src/projects/components/vehicles/VehicleTable.vue` |
| Frontend API composable | `frontend-vue/src/projects/views/vehicles/useVehicleApi.js` |

## T2. Root Cause

Backend owner_vehicle.js service read from `owner_vehicles` collection which is EMPTY in the live database.
Real vehicle data lives in `vehicles` (6 docs) and `requests` (2 docs) collections.

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-VM-001 | Source discovery | Backend | AI | none | done | 100 | All relevant files read; root cause identified | vehicles, requests, owner_vehicles (Compass), owner_vehicle.js, VehicleTable.vue | — | none | — | Root cause documented |
| ivts-VM-002 | Rewrite owner_vehicle.js service | Backend | AI | ivts-VM-001 | done | 100 | Service rewritten to use vehicles + requests; node --check PASS | service/owner_vehicle.js | node --check PASS 2026-07-27 | none | Run live smoke | Fixed service |
| ivts-VM-003 | Rewrite VehicleTable.vue | Frontend | AI | ivts-VM-001 | done | 100 | Table updated with plate_number, vehicle_code, type, owner_name, validity, document_status | VehicleTable.vue | n/a (Vue component) | none | Visual verify in browser | Updated component |
| ivts-VM-004 | Fix VehicleManagement.vue ConfirmDeleteModal prop | Frontend | AI | ivts-VM-003 | done | 100 | plate_number used instead of license_plate | VehicleManagement.vue line 54 | n/a | none | — | Fixed prop |
| ivts-VM-005 | Live smoke: GET /api/v1/ivts/owner-vehicles | Backend | Dev | ivts-VM-002 | pending | 0 | Not run | — | not run | requires running server | Restart server; verify 6 vehicles returned with correct data | HTTP 200 + 6 records |
| ivts-VM-006 | Visual verify in browser | Frontend | Dev | ivts-VM-003 | pending | 0 | Not run | — | not run | requires running frontend | Open /vehicles/management; verify table shows plate, type, owner, validity | UI shows real data |
| ivts-VM-007 | Update tasklist-progress.md + regen HTML | Ops | AI | ivts-VM-004 | in_progress | 50 | Being updated | docs/tasks/tasklist-progress.md | n/a | none | Regen HTML | Updated progress |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| node --check owner_vehicle.js | PASS | Exit code 0 — 2026-07-27 |
| Live GET /api/v1/ivts/owner-vehicles | not run | requires server restart |
| Frontend visual verify | not run | requires browser |

## T5. Blockers And Risks

none

## T6. Decision

Rewrote owner_vehicle.js to read from vehicles + requests (real data sources).
VehicleTable.vue updated with new columns: plate_number, vehicle_code, brand/model/color, owner_name, validity_expiry (Thai Buddhist year), document_status (derived from latest request).
approve/reject now updates request_status in requests collection.
delete removes from vehicles collection (requests kept as history).
