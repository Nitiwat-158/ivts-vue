# T1-T20 Change Document: Update Emergency Report Status in MongoDB on Mobile Resolve

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | `chg-2026-08-09-mobile-resolve-emergency-mongo` |
| Module | IVTS User Mobile Application (`emergency_status_screen.dart`, `mobile_api_service.dart`) & Backend Mobile Service (`mobile.js`, `mobile.routes.js`) |
| Date | 2026-08-09 |
| Owner / Agent | AI Mobile & Backend Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-09-mobile-resolve-emergency-mongo.md` |

## T2 Requirement

- User request: "ใน mobile app เมื่อกด "แก้ไขแล้ว" ให้ update ข้อมูลใน mongodb ช่วยทำให้หน่อย"
- Business goal: When a user confirms resolution of an emergency report in the mobile app, update the emergency report status to `RESOLVED` directly in MongoDB `IVTS.emergency_reports` collection.
- Success outcome: 
  1. Tapping "ตกลง" (Confirm) sends `PATCH /api/v1/mobile/emergency-reports/:id` with `status: 'RESOLVED'`.
  2. Backend updates MongoDB `emergency_reports` collection using `EmergencyReport.findOneAndUpdate({ _id: id }, { $set: { status: 'RESOLVED', updated_at: new Date() } })`.
  3. App data repository refreshes, updating history state and clearing active emergency banner on Home screen.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route | `backend-node/server/Project/ivts/mobile.routes.js` | Added `PATCH /api/v1/mobile/emergency-reports/:id` endpoint |
| Backend service | `backend-node/server/Project/ivts/service/mobile.js` | Added `updateEmergencyReportStatus(id, payload)` updating MongoDB `emergency_reports` collection |
| Mobile API Service | `user-mobile-application/lib/services/mobile_api_service.dart` | Added `updateEmergencyReportStatus(id, {status})` method sending HTTP PATCH request |
| Emergency Status Screen | `user-mobile-application/lib/screens/emergency_status_screen.dart` | Updated `_confirmMarkResolved` handler to call PATCH API and refresh repository |

## T15 Implementation Summary

1. **Backend Route & Handler (`mobile.routes.js` & `mobile.js`)**:
   - Added `PATCH /api/v1/mobile/emergency-reports/:id` route calling `mobileService.updateEmergencyReportStatus`.
   - Updated document status in MongoDB `emergency_reports` collection to `RESOLVED` with updated timestamp.
2. **Mobile App API & Screen (`mobile_api_service.dart` & `emergency_status_screen.dart`)**:
   - Added `updateEmergencyReportStatus` HTTP method in `MobileApiService`.
   - Updated `_confirmMarkResolved` in `EmergencyStatusScreen` to execute the API call, clear local active state, and trigger `AppDataRepository.instance.refresh()`.

## T16 Tests & Verification

| Command / Check | Result | Evidence |
|---|---|---|
| `node --check backend-node/server/Project/ivts/service/mobile.js` | PASS | Exit code 0 (2026-08-09) |
| `node --check backend-node/server/Project/ivts/mobile.routes.js` | PASS | Exit code 0 (2026-08-09) |
| `flutter analyze` in `user-mobile-application` | PASS | No issues found! (0 errors / 0 warnings) |

## T17 PRD & Docs Update

- Updated `docs/prd/PRD-ivts.md` with mobile emergency status update endpoint requirement.
- Updated `docs/tasks/2026-08-09-mobile-resolve-emergency-mongo.md` active tasklist.
- Updated `docs/tasks/tasklist-progress.md` canonical system progress.

## T20 Final Handoff

- Pressing "ทำเครื่องหมายว่าแก้ไขแล้ว" (Mark resolved) in the Flutter mobile application now sends a PATCH request to the backend and updates the emergency report status to `RESOLVED` directly in MongoDB. All automated tests passed.
