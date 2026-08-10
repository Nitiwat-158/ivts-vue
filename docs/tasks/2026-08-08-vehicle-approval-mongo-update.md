# Active Tasklist: Fix Vehicle Approval MongoDB Sync (vehicles & owner_vehicles)

| Field | Value |
|---|---|
| Date | 2026-08-08 |
| Project | IVTS |
| Topic | Fix vehicle request approval MongoDB synchronization for `vehicles` and `owner_vehicles` collections |
| Target Files | `backend-node/server/Project/ivts/service/vehicle_request.js`, `backend-node/server/Project/ivts/service/owner_vehicle.js`, `backend-node/scripts/fix-approved-requests-vehicles.js` |
| Active Change Record | `docs/changes/2026-08-08-vehicle-approval-mongo-update.md` |
| Status | done |
| Progress % | 100% |

## Source Evidence
- `backend-node/server/Project/ivts/service/vehicle_request.js` (Root cause: `_generateVehicleCode` & `_generateOwnerVehicleId` rely on `countDocuments({})` resulting in E11000 duplicate key errors which get silently caught & skipped, leading to missing `vehicles` docs and corrupted `owner_vehicles` docs)
- `backend-node/server/Project/ivts/service/owner_vehicle.js` (`_syncVehicleOnApproval` caller & `buildRow` vehicle display)
- MongoDB Compass screenshot evidence (2026-08-08):
  - Request `REQ17861800465241667` for plate `ผด 5874` approved, but `vehicles` collection only has `CR0002` (`ผป 4862`)
  - `owner_vehicles` collection `OV0002` had `vehicle_code: "CR0002"` overwritten with plate `ผด 5874`

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-VA-001 | Source Discovery & Root Cause Analysis | Backend | AI | none | done | 100 | Identified countDocuments ID collision bug in `vehicle_request.js` | `vehicle_request.js`, `owner_vehicle.js` | Visual DB inspection | none | — | Tasklist & Root cause analysis |
| ivts-VA-002 | Refactor `_generateVehicleCode` & `_generateOwnerVehicleId` and fix `_syncVehicleOnApproval` & `_syncOwnerVehicleOnApproval` | Backend | AI | ivts-VA-001 | done | 100 | Collision-proof max ID logic written & node --check PASS | `vehicle_request.js` | node --check PASS | none | — | Refactored `vehicle_request.js` |
| ivts-VA-003 | Create & run data repair script for approved requests | Backend | AI | ivts-VA-002 | done | 100 | `fix-approved-requests-vehicles.js` executed, repaired 5 vehicles & 5 owner_vehicles | `scripts/fix-approved-requests-vehicles.js` | Repair script execution log | none | — | Repaired MongoDB collections |
| ivts-VA-004 | Run unit/smoke verification tests | Backend | AI | ivts-VA-003 | done | 100 | `vehicle-approval-sync.test.js` 2/2 PASS; 21/21 IAM unit tests PASS | `backend-node/test/vehicle-approval-sync.test.js` | node --test PASS | none | — | Verification evidence |
| ivts-VA-005 | Update docs control (PRD, tasklist-progress, index, README, T1-T20 change record) | Ops | AI | ivts-VA-004 | done | 100 | Docs updated & HTML rendered | `docs/tasks/tasklist-progress.md`, `docs/AI-DOCS-INDEX.md`, `docs/changes/2026-08-08-vehicle-approval-mongo-update.md` | HTML rendering PASS | none | — | Final T1-T20 handoff |

## Progress Gate Weights
- Discovery Evidence (T1-T4): 20% (Completed)
- Implementation / Code Changes: 30% (Completed)
- Tests / Verification Evidence: 30% (Completed)
- PRD / Docs Decision: 10% (Completed)
- T1-T20 Handoff: 10% (Completed)
