# T1-T20 Change Document: Vehicle Management License Plate View Display Fix

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-VM-002 |
| Module | Frontend Vue / Backend IVTS |
| Date | 2026-08-05 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-05-vehicle-license-plate-view-fix.md` |

## T2 Requirement

- User request: In Vehicle Management screen, when clicking "View", License Plate is displayed as `- ⚠️` instead of showing the actual license plate number.
- Business goal: Accurately display vehicle license plate, province, vehicle attributes, owner details, and document evidence when admins view vehicle details in Vehicle Management modal.
- Success outcome: Clicking View displays `vehicleLicensePlate` correctly from `license_plate` or `plate_number`, along with owner contact phone and evidence document image URL.

## T3 Source Evidence

| Area | Source path | What was verified |
|---|---|---|
| Frontend Modal | `frontend-vue/src/projects/components/vehicles/VehicleVerificationModal.vue` | Updated computed properties `vehicleLicensePlate`, `vehicleProvince`, `vehicleColor`, `vehicleBrand`, `vehicleModel`, `ownerFullName`, `ownerPhone`, and `certificateImageUrl` |
| Backend Service | `backend-node/server/Project/ivts/service/owner_vehicle.js` | Updated `buildRow` to populate `license_plate`, `user.phone`, and `certificate_image_url` |
| Verification | `node --check` & `node --test` | Syntax verified & 25/25 unit tests PASS |

## T4 Current Behavior

- When clicking View on Vehicle Management:
  - `vehicleLicensePlate` checks `vehicle.license_plate`, `vehicle.plate_number`, `vehicle_info.license_plate`, `vehicle_info.plate_number`, `license_plate`, and `plate_number`.
  - `ownerPhone` checks `user.phone`, `owner_info.phone`, and `vehicle.phone`.
  - `certificateImageUrl` falls back to `latestRequest.documents.vehicle_registration`, `evidence_image_url`, or `vehicle.certificate_image_url`.
- All fields are populated cleanly without `-` fallbacks when data exists.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Frontend | yes | Updated `VehicleVerificationModal.vue` computed properties |
| Backend | yes | Updated `owner_vehicle.js` `buildRow` mapping |
| QA/UAT | yes | Verified syntax & test suite |
| Ops / Tasklist | yes | Updated system progress & change control |

## T6 Scope

In scope:
- `VehicleVerificationModal.vue`: fallback field accessor updates.
- `owner_vehicle.js`: `buildRow` property extensions.
- Verification and tasklist update.

Out of scope:
- Web Admin IAM (`iam-admin-client.js`).

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-VM-001 | Display valid license plate number when viewing vehicle details | Admin | Must |
| FR-VM-002 | Display complete owner phone number and evidence image when available | Admin | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-VM-001 | FR-VM-001 | Vehicle record with `plate_number` exists | Admin clicks View icon | License plate is rendered correctly instead of `-` |

## T9 API Contract

No contract change. `GET /api/v1/ivts/owner-vehicles` returns enriched `vehicle` object containing both `plate_number` and `license_plate`.

## T10 Data Model / Migration

- No database migration required.

## T11 Backend Plan / Changes

- `backend-node/server/Project/ivts/service/owner_vehicle.js`: Added `license_plate`, `user.phone`, and `certificate_image_url` to `buildRow`.

## T12 Frontend Plan / Changes

- `frontend-vue/src/projects/components/vehicles/VehicleVerificationModal.vue`: Updated computed property accessors for vehicle attributes, owner phone, and evidence image.

## T13 Security / Permission

- Existing authorization and role checks remain enforced.

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-VM-001 | syntax | AI | Run `node --check server/Project/ivts/service/owner_vehicle.js` | PASS |
| TC-VM-002 | unit | AI | Run `node --test` test suite | 25/25 PASS |

## T15 Implementation Summary

| File | Change |
|---|---|
| `frontend-vue/src/projects/components/vehicles/VehicleVerificationModal.vue` | Added fallbacks for `license_plate` / `plate_number` and `phone` |
| `backend-node/server/Project/ivts/service/owner_vehicle.js` | Populated `license_plate`, `phone`, and `certificate_image_url` in `buildRow` |

## T16 Tests Run / Evidence

| Command | Result | Notes |
|---|---|---|
| `node --check server/Project/ivts/service/owner_vehicle.js` | PASS | Exit code 0 |
| `node --test` | PASS | 25/25 unit tests pass |

## T17 PRD / Docs Updated

- `docs/changes/2026-08-05-vehicle-license-plate-view-fix.md`
- `docs/tasks/2026-08-05-vehicle-license-plate-view-fix.md`
- `docs/tasks/tasklist-progress.md`

## T18 Risks / Blockers / Assumptions / Decisions

- Decision: Support both `plate_number` and `license_plate` across backend and frontend to guarantee compatibility across older and newer vehicle records.

## T19 Release / Rollback

- Release: Deploy updated frontend component and restart backend server.
- Rollback: Revert `VehicleVerificationModal.vue` and `owner_vehicle.js`.

## T20 Final Handoff

```txt
Feature: Vehicle Management License Plate View Display Fix
Status: Done
Active tasklist: docs/tasks/2026-08-05-vehicle-license-plate-view-fix.md
Task IDs: ivts-VM-002
Progress: 100%
Changed files: VehicleVerificationModal.vue, owner_vehicle.js
Tests run: node --check (PASS), node --test (25/25 PASS)
Docs: 2026-08-05-vehicle-license-plate-view-fix.md, tasklist-progress.md, tasklist-progress.html
```
