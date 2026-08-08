# T1-T20 Change Document: Fix Vehicle Request Approval MongoDB Sync (vehicles & owner_vehicles)

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | `chg-2026-08-08-vehicle-approval-sync` |
| Module | IVTS Vehicle Management (`vehicle_request`, `owner_vehicle`) |
| Date | 2026-08-08 |
| Owner / Agent | AI Backend Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-08-vehicle-approval-mongo-update.md` |

## T2 Requirement

- User request: "ในหน้าเว็บ Vehicle Management เมื่อทำการกด "อนุมัติ" แล้ว ข้อมูลของ vehicle กลับไม่ update ใน vehicles กับ owner_vehicles ใน mongodb ช่วยแก้ไขให้หน่อย"
- Business goal: Ensure that approving a vehicle registration or renewal request correctly creates/updates vehicle records in both `vehicles` and `owner_vehicles` collections in MongoDB without ID collisions or data corruption.
- Success outcome: Clicking "Approve" (อนุมัติ) on a request syncs both `vehicles` and `owner_vehicles` documents with unique codes (`CRxxxx`, `OVxxxx`), and existing database records are repaired.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route truth | `backend-node/server/routes/app.routes.js` | `/api/v1/ivts` router mount |
| Backend approval endpoint | `backend-node/server/Project/ivts/ivts.routes.js` | `PUT /requests/:id/review` and `PATCH /owner-vehicles/:id/approve` |
| Backend service logic | `backend-node/server/Project/ivts/service/vehicle_request.js` | Identified `countDocuments({})` ID collision bug and fixed `_syncVehicleOnApproval` & `_syncOwnerVehicleOnApproval` |
| Database repair script | `backend-node/scripts/fix-approved-requests-vehicles.js` | Synced 5 existing approved requests, creating missing `CRxxxx` and `OVxxxx` docs in MongoDB |
| Tests | `backend-node/test/vehicle-approval-sync.test.js` | 2 unit tests passed |

## T4 Current Behavior

- Previous behavior: `_generateVehicleCode` and `_generateOwnerVehicleId` counted documents (`countDocuments({})`) to generate sequential IDs (`CR0002`, `OV0002`). When IDs had gaps or deleted items, `count + 1` generated duplicate IDs (`CR0002`) which threw MongoDB E11000 duplicate key errors. The error was caught and logged with `skip`, resulting in missing `vehicles` docs and corrupted `owner_vehicles` docs.
- Fixed behavior: `_generateVehicleCode` and `_generateOwnerVehicleId` dynamically compute the maximum numeric suffix from existing documents (`CRxxxx`, `OVxxxx`), loop until a free candidate is found, and handle retry safety. Approved requests create/update both `vehicles` and `owner_vehicles` properly.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Workflow coordination |
| Backend | yes | `vehicle_request.js` refactoring and repair script execution |
| Frontend | no | Frontend UI already sends `PUT /requests/:id/review` or `PATCH /owner-vehicles/:id/approve` |
| Security IAM | no | No permission schema changes |
| QA/UAT | yes | Verified via unit test suite and repair script |
| Release/Ops | yes | Tasklist progress & HTML render |

## T6 Scope

In scope:
- Refactoring `_generateVehicleCode`, `_generateOwnerVehicleId`, `_syncVehicleOnApproval`, `_syncOwnerVehicleOnApproval` in `vehicle_request.js`.
- Script `fix-approved-requests-vehicles.js` to backfill and repair live MongoDB data.
- Unit tests `test/vehicle-approval-sync.test.js`.

Out of scope:
- Frontend layout modifications.

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-VA-001 | Approval of vehicle request MUST create or update vehicle in `vehicles` collection | Admin | Must |
| FR-VA-002 | Approval of vehicle request MUST create or update owner vehicle mapping in `owner_vehicles` collection | Admin | Must |
| FR-VA-003 | ID generation for `CRxxxx` and `OVxxxx` MUST NOT collide when gaps exist | System | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-VA-001 | FR-VA-001 | Pending request REQ17861800465241667 (plate ผด 5874) | Admin clicks "อนุมัติ" | Vehicle doc with plate `ผด 5874` exists in `vehicles` collection |
| AC-VA-002 | FR-VA-002 | Pending request REQ17861800465241667 (plate ผด 5874) | Admin clicks "อนุมัติ" | OwnerVehicle doc with plate `ผด 5874` and matching `vehicle_code` exists in `owner_vehicles` collection |

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | no | Field names remain `plate_number`, `vehicle_code`, `type`, `owner_name`, etc. |
| Migration/Repair | yes | `node backend-node/scripts/fix-approved-requests-vehicles.js` executed |
| Seed/backfill | yes | 5 approved requests processed, resulting in 5 vehicles and 5 owner_vehicles |

## T11 Backend Plan / Changes

- `backend-node/server/Project/ivts/service/vehicle_request.js`:
  - `_generateVehicleCode()`: parse max `CR` number + 1, loop until unused `_id` found.
  - `_generateOwnerVehicleId()`: parse max `OV` number + 1, loop until unused `_id` found.
  - `_syncOwnerVehicleOnApproval()`: search by plate and user_id to prevent overwriting wrong vehicle.
  - `_syncVehicleOnApproval()`: retry loop on `E11000` collisions, update existing vehicle if plate matches.

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/server/Project/ivts/service/vehicle_request.js` | Collision-proof ID generation & sync helper fix |
| `backend-node/scripts/fix-approved-requests-vehicles.js` | Data repair & backfill script |
| `backend-node/test/vehicle-approval-sync.test.js` | Unit tests for approval sync & collision avoidance |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `node --check backend-node/server/Project/ivts/service/vehicle_request.js` | PASS | Exit code 0 |
| `node backend-node/scripts/fix-approved-requests-vehicles.js` | PASS | Repaired 5 approved requests -> 5 vehicles, 5 owner_vehicles |
| `node --test backend-node/test/vehicle-approval-sync.test.js` | PASS | 2/2 unit tests passed |
| `node --test backend-node/server/Project/security/service/*.test.js` | PASS | 21/21 regression unit tests passed |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/tasks/2026-08-08-vehicle-approval-mongo-update.md` | yes | Active tasklist created & marked done |
| `docs/tasks/tasklist-progress.md` | yes | Canonical progress tasklist updated |
| `docs/tasks/tasklist-progress.html` | yes | Regenerated via `node scripts/render-tasklist-progress-html.js .` |
| `docs/AI-DOCS-INDEX.md` | yes | Updated with active tasklist & change record |

## T20 Final Handoff

```txt
Feature: Fix Vehicle Request Approval MongoDB Sync (vehicles & owner_vehicles)
Status: Done
Active tasklist: docs/tasks/2026-08-08-vehicle-approval-mongo-update.md
Task IDs: ivts-VA-001, ivts-VA-002, ivts-VA-003, ivts-VA-004, ivts-VA-005
Progress: 100%
Changed files: backend-node/server/Project/ivts/service/vehicle_request.js, backend-node/scripts/fix-approved-requests-vehicles.js, backend-node/test/vehicle-approval-sync.test.js
Tests run: 2/2 approval sync tests PASS; 21/21 IAM regression tests PASS; live MongoDB repair script PASS (5 vehicles, 5 owner_vehicles synced)
Open risks: None
```
