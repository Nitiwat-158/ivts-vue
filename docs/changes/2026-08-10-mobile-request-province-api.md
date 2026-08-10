# T1-T20 Change Record: Mobile Registration Request Province API & Detail Integration

**Document Date:** 2026-08-10  
**Topic:** `mobile-request-province-api`  
**Status:** `done`  

---

## T1 Target & Scope
Implement backend API support (`GET /api/v1/mobile/requests/:id` and enriched `province_license` / `province` mappings) and integrate Flutter mobile app to fetch and display the vehicle province in registration request history detail view.

## T2 Source Evidence
- Backend routes: `backend-node/server/Project/ivts/mobile.routes.js`
- Backend mobile service: `backend-node/server/Project/ivts/service/mobile.js`
- Request model schema: `backend-node/server/Project/ivts/models/request.model.js` (`vehicle_info.province_license`)
- Vehicle model schema: `backend-node/server/Project/ivts/models/vehicle.model.js` (`province_license`)
- Flutter vehicle model: `user-mobile-application/lib/models/vehicle.dart`
- Flutter history model: `user-mobile-application/lib/models/history_entry.dart`
- Flutter API service: `user-mobile-application/lib/services/mobile_api_service.dart`
- Flutter history screen: `user-mobile-application/lib/screens/request_history_screen.dart`
- Flutter add/detail screen: `user-mobile-application/lib/screens/add_vehicle_screen.dart`

## T3 Open Questions & Risk Assessment
- Risks: Backwards compatibility with existing mobile clients — solved by mapping both `province` and `provinceLicense` fields in API responses.
- PDPA Decision: N/A — province is vehicle metadata.

## T4 Architecture & Data Model Decisions
- `Request` documents store province under `vehicle_info.province_license`.
- Endpoint `GET /api/v1/mobile/requests/:id` returns request JSON with `vehicle_info.province_license` and `vehicle_info.province`.
- Flutter `AddVehicleScreen` populates `_provinceController` using `v.province` when present, and calls `_loadRequestDetails(v.id)` to fetch full request details from backend MongoDB collection.

## T15 Implementation Summary
- [mobile.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/service/mobile.js): Implemented `getRequestById`, updated `listRequestHistory`, `mapVehicle`, and `createRequest` to handle `province` / `province_license`.
- [mobile.routes.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/mobile.routes.js): Added route `GET /api/v1/mobile/requests/:id`.
- [vehicle.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/models/vehicle.dart) & [history_entry.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/models/history_entry.dart): Added optional `province` property to `Vehicle` and `RequestHistoryItem`.
- [mobile_api_service.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/services/mobile_api_service.dart): Implemented `fetchRequestById(String requestId)` and mapped `province` in `_vehicleFromJson` and `_requestHistoryFromJson`.
- [request_history_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/request_history_screen.dart): Passed `request.province` when constructing `Vehicle` for navigation.
- [add_vehicle_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/add_vehicle_screen.dart): Populated `_provinceController.text` with `v.province` and added `_loadRequestDetails` to fetch live MongoDB details for `isReadOnly` request views.

## T16 Verification & Evidence
- Backend automated unit tests: `node --test test/mobile-request-province.test.js` (2/2 tests passed)
- Flutter test suite: `flutter test test/request_history_screen_test.dart` (Passed 100%)
- Progress HTML generation: `node scripts/render-tasklist-progress-html.js .` (Passed cleanly)

## T17 PRD & Control Documentation Updates
- Updated [AI-DOCS-INDEX.md](file:///g:/MFU/Project/ivts-vue/ivts-vue/docs/AI-DOCS-INDEX.md)
- Updated [tasklist-progress.md](file:///g:/MFU/Project/ivts-vue/ivts-vue/docs/tasks/tasklist-progress.md)
- Regenerated [tasklist-progress.html](file:///g:/MFU/Project/ivts-vue/ivts-vue/docs/tasks/tasklist-progress.html)

## T20 Final Handoff Status
- Completed. All requirements fulfilled and verified.
