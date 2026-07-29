# T1-T20 Change Record: Mobile Add Vehicle - vehicle_info.type MongoDB Field Standardisation

## Document Control

| Item | Details |
|---|---|
| Date | 2026-07-29 |
| Topic | Mobile Add Vehicle - Change `vehicle_info.vehicle_type` to `type` in MongoDB |
| Author | AI Pair Programming Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-29-mobile-add-vehicle-type-field.md` |

---

## T1. Requirement Summary
When submitting a new vehicle request from `user-mobile-application`, the MongoDB document saved in the `requests` collection under `vehicle_info` stored the vehicle type under the field `vehicle_type` instead of `type`. The requirement is to change `vehicle_info.vehicle_type` to `vehicle_info.type` in MongoDB while maintaining backward-compatibility for existing records.

---

## T2. Source Discovery & Impacted Components

- [add_vehicle_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/add_vehicle_screen.dart): Sends `'type': _mapVehicleType(selectedType)` in payload.
- [request.model.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/models/request.model.js): Mongoose schema defined `vehicle_type` inside `vehicleInfoSchema`. Updated to `type`.
- [mobile.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/service/mobile.js): Saved `vehicle_type: cleanText(...)`. Updated to save `type: cleanText(vehicleInfo.type || vehicleInfo.vehicle_type) || 'car'`.
- [VehicleRequestTable.vue](file:///g:/MFU/Project/ivts-vue/ivts-vue/frontend-vue/src/projects/components/vehicles/VehicleRequestTable.vue): Updated to render `req.vehicle_info.type || req.vehicle_info.vehicle_type`.
- [ConfirmRequestModal.vue](file:///g:/MFU/Project/ivts-vue/ivts-vue/frontend-vue/src/projects/components/vehicles/ConfirmRequestModal.vue): Already reads `vi.type || vi.vehicle_type`.

---

## T15. Implementation Summary

1. Updated `request.model.js` Mongoose schema (`vehicleInfoSchema`) to define `type` instead of `vehicle_type`.
2. Updated `mobile.js` service `createVehicleRequest` to store `type` field in `vehicle_info` object saved to MongoDB.
3. Updated `VehicleRequestTable.vue` in Vue frontend to check `type` with `vehicle_type` fallback for older documents.

---

## T16. Verification Evidence

- `node --check backend-node/server/Project/ivts/models/request.model.js backend-node/server/Project/ivts/service/mobile.js backend-node/server/Project/ivts/service/vehicle_request.js`: PASS (Exit code 0)
- `flutter analyze lib/`: PASS

---

## T17. PRD & Docs Impact
No breaking API changes. MongoDB field inside `requests.vehicle_info` now consistently uses `type` for all new submissions from mobile and web, matching the `vehicles` collection schema.

---

## T20. Final Handoff

| Field | Value |
|---|---|
| Work Completed | `vehicle_info.vehicle_type` changed to `type` in MongoDB |
| Verification | Node syntax check PASS, Flutter analyze PASS |
| Open Blockers | None |
| Next Action | Test live submission from mobile app |
