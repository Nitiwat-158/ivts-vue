# Tasklist: Emergency Report CastError Fix

| Field | Value |
|---|---|
| Date | 2026-07-27 |
| Project | IVTS |
| Module / Feature | Emergency Reports — getAll and updateStatus |
| Requirement | Fix CastError: vehicle_id in emergency_report stores vehicle_code (string e.g. "CR0001"), not ObjectId |
| Active Change Record | `docs/changes/2026-07-27-emergency-report-castError.md` |
| Overall Status | verifying |
| Overall Progress | 90% |
| Progress Type | Evidence-backed — implementation + syntax verification done; live smoke pending |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| Emergency report model | `backend-node/server/Project/ivts/models/emergency_report.model.js` — vehicle_id: { type: String } |
| Vehicle model | `backend-node/server/Project/ivts/models/vehicle.model.js` — _id is ObjectId; vehicle_code is real string key (per mobile.js live DB comment) |
| Buggy service | `backend-node/server/Project/ivts/service/emergency_report.js` — fallback branch sent string "CR0001" to `{ _id: { $in: vehicleIds } }` on Vehicle model → CastError |
| Pattern reference | `backend-node/server/Project/ivts/service/mobile.js` — confirms vehicles collection stores vehicle_code as string identifier |

## T2. Root Cause

emergency_report.vehicle_id stores vehicle_code string (e.g. "CR0001").
The old getAll logic tried to cast it to ObjectId and fell through to a dangerous fallback `{ _id: { $in: vehicleIds } }` which sent a non-hex string to Mongoose Vehicle model.
updateStatus similarly called Vehicle.findById(report.vehicle_id) with a string that is not an ObjectId.

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-ER-001 | Source discovery | Backend | AI | none | done | 100 | Files read and root cause identified | emergency_report.model.js, vehicle.model.js, mobile.js | — | none | — | Root cause documented |
| ivts-ER-002 | Fix getAll — vehicle lookup by vehicle_code | Backend | AI | ivts-ER-001 | done | 100 | Code changed + node --check PASS | service/emergency_report.js L34-45 | node --check PASS | none | — | Fixed getAll |
| ivts-ER-003 | Fix updateStatus — findOne by vehicle_code | Backend | AI | ivts-ER-001 | done | 100 | Code changed + node --check PASS | service/emergency_report.js L97-100 | node --check PASS | none | — | Fixed updateStatus |
| ivts-ER-004 | Remove unused mongoose import | Backend | AI | ivts-ER-002 | done | 100 | Code changed + node --check PASS | service/emergency_report.js L1-5 | node --check PASS | none | — | Clean imports |
| ivts-ER-005 | Live smoke: GET /api/v1/ivts/emergency-reports | Backend | Dev | ivts-ER-004 | pending | 0 | Not run — requires running server | — | not run | requires running server | Restart server; test GET endpoint | HTTP 200 with data |
| ivts-ER-006 | Update tasklist-progress.md + regen HTML | Ops | AI | ivts-ER-004 | in_progress | 50 | Files being updated | docs/tasks/tasklist-progress.md | n/a | none | Regen HTML | Updated progress docs |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| node --check emergency_report.js | PASS | Exit code 0 — 2026-07-27 |
| Live GET /api/v1/ivts/emergency-reports | not run | requires running server |

## T5. Blockers And Risks

none

## T6. Decision

vehicle_id in emergency_report collection stores vehicle_code string (e.g. "CR0001") per live DB evidence documented in mobile.js. Fixed both getAll (batch lookup) and updateStatus (single lookup) to use `{ vehicle_code: ... }` instead of `{ _id: ... }`. Removed now-unused mongoose import. node --check PASS.
