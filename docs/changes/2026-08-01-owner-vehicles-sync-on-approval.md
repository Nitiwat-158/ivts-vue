# T1-T20 Change Document: Owner Vehicles MongoDB Sync on Approval

## T1. Executive Summary
- **Topic**: Automatic `owner_vehicles` MongoDB synchronization on vehicle request approval.
- **Date**: 2026-08-01
- **Status**: Completed (Done)
- **Author / Agent**: AI Agent

## T2. Source Evidence
1. [app.routes.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/routes/app.routes.js#L10-L13) - Backend route mounting at `/api/v1/ivts`.
2. [ivts.routes.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/ivts.routes.js#L204-L216) - `PUT /requests/:id/review` and `PATCH /owner-vehicles/:id/approve` endpoints.
3. [vehicle_request.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/service/vehicle_request.js) - Request approval business logic & `_syncVehicleOnApproval` / `_syncOwnerVehicleOnApproval` helper.
4. [owner_vehicle.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/service/owner_vehicle.js) - Admin vehicle management approve handler.
5. [owner_vehicle.model.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/models/owner_vehicle.model.js) - Mongoose schema for `owner_vehicles` collection.
6. MongoDB Compass Screenshots provided by user - Confirmed schema fields for `owner_vehicles` (`_id: "OV000x"`, `vehicle_code`, `plate_number`, `relationship`, `is_primary`, `status`, `user_id`, `created_at`, `updated_at`).

## T3. Problem Statement & Background
Previously, when an admin approved a user's vehicle registration request (`PUT /api/v1/ivts/requests/:id/review` or `PATCH /api/v1/ivts/owner-vehicles/:id/approve`), the backend updated the `requests` status and upserted the `vehicles` document, but did NOT write to the `owner_vehicles` MongoDB collection.

## T4. Solution & Technical Implementation
1. **Schema Update (`owner_vehicle.model.js`)**:
   - Added schema fields: `vehicle_code`, `plate_number`, `relationship`, `is_primary`, `status`, `created_at`, `updated_at`.
   - Set `{ strict: false }` for Mongoose collection to allow schema flexibility and backward compatibility.
2. **Approval Synchronization Helper (`vehicle_request.js`)**:
   - Added `_generateOwnerVehicleId()` generating sequential IDs (`OV0001`, `OV0002`, `OV0003`, ...).
   - Added `_syncOwnerVehicleOnApproval(requestDoc, vehicleCode, plateSrc, now)` helper to search for existing record by `vehicle_code` / `plate_number` / `user_id`, or insert a new `OwnerVehicle` document with `status: 'active'` and `document_status: 'Approved'`.
   - Updated `_syncVehicleOnApproval` to invoke `_syncOwnerVehicleOnApproval` and exported `_syncVehicleOnApproval`.
3. **Owner Vehicle Admin Approval Endpoint (`owner_vehicle.js`)**:
   - Updated `approve` method to call `vehicleRequestService._syncVehicleOnApproval(request, now)` so both approval routes trigger sync to `vehicles` and `owner_vehicles`.

## T15. File Modifications Summary
- `backend-node/server/Project/ivts/models/owner_vehicle.model.js`: Expanded schema fields and set `strict: false`.
- `backend-node/server/Project/ivts/service/vehicle_request.js`: Added `_syncOwnerVehicleOnApproval` logic and exported `_syncVehicleOnApproval`.
- `backend-node/server/Project/ivts/service/owner_vehicle.js`: Added import and invoked `_syncVehicleOnApproval` inside `approve()` method.

## T16. Verification & Test Evidence
- Syntax verification: `node --check` on all updated backend files passed cleanly (Exit Code 0).
- Live MongoDB integration test: Executed `node scratch_test_owner_vehicle_sync.js` against local MongoDB.
  - Request submission -> `req_2026_00001` created.
  - Request approval -> `Vehicle` created as `CR0009`.
  - Request approval -> `OwnerVehicle` created as `OV0004` (`user_id: "test_user_sync_99"`, `vehicle_code: "CR0009"`, `plate_number: "ทด 9999"`, `relationship: "owner"`, `is_primary: true`, `status: "active"`, `document_status: "Approved"`).
  - Test result: **SUCCESS**.

## T17. PRD & Documentation Impact
- PRD Requirements: Request approval workflow now updates both `vehicles` and `owner_vehicles` collections in MongoDB.
- Task tracking: Active tasklist `docs/tasks/2026-08-01-owner-vehicles-sync-on-approval.md` updated to `done` (100%).
- System progress: `docs/tasks/tasklist-progress.md` updated and HTML dashboard regenerated.

## T20. Final Handoff
- Feature completed and verified against live MongoDB.
- No unresolved blockers.
