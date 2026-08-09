# T1-T20 Change Document: Mobile App Dynamic Emergency Request Pop-up / Banner by Request Type

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | `chg-2026-08-09-mobile-emergency-popup-type` |
| Module | IVTS User Mobile Application (`home_screen.dart`, `app_data_repository.dart`, `mobile_api_service.dart`, `locale_provider.dart`, `emergency_request_screen.dart`, `emergency_status_screen.dart`) & Backend Mobile Service (`mobile.js`) |
| Date | 2026-08-09 |
| Owner / Agent | AI Mobile & Backend Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-09-mobile-emergency-popup-type.md` |

## T2 Requirement

- User request: "ใน mobile app ช่วยทำให้ pop-up คำร้องฉุกเฉินแสดงขึ้นมาเมื่อ user ส่งคำร้องฉุกเฉินและจะเปลี่ยนไปตามประเภทของคำร้อง และ pop-up นี้จะหายไปเมื่อคำร้องได้รับการแก้ไขแล้ว"
- Business goal: Display dynamic emergency request pop-up / banner on the mobile app Home screen matching the request type (`theft`, `accident`, `breakdown`, `other`), and automatically hide the banner when the request is resolved.
- Success outcome: 
  1. Creating an emergency request shows the localized banner matching its type (e.g. `มีคำร้องฉุกเฉิน (อุบัติเหตุ) กำลังดำเนินการ — แตะเพื่อดู`).
  2. Marking the case as resolved (or status `RESOLVED` / `CLOSED`) clears the active emergency state and hides the banner.
  3. Re-opening or refreshing the app checks backend API for active user emergency reports.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend service | `backend-node/server/Project/ivts/service/mobile.js` | Updated `listEmergencyReports` to filter by `users_id` / `user_id` or matching user vehicles |
| Mobile API Service | `user-mobile-application/lib/services/mobile_api_service.dart` | Added `fetchEmergencyReports({userId, vehicleId})` HTTP method |
| App Data Repository | `user-mobile-application/lib/services/app_data_repository.dart` | Added `activeEmergencyReportNotifier`, updated `refresh()` to detect active report status |
| Localization Provider | `user-mobile-application/lib/providers/locale_provider.dart` | Added `getEmergencyBannerText(requestType)` with Thai/English dynamic strings |
| Home Screen UI | `user-mobile-application/lib/screens/home_screen.dart` | Listens to `activeEmergencyReportNotifier` and displays localized type-specific banner |
| Emergency Screens | `emergency_request_screen.dart`, `emergency_status_screen.dart` | Populates active report on creation, clears active report on resolve |

## T15 Implementation Summary

1. **Backend Filter (`mobile.js`)**: `listEmergencyReports` now extracts `users_id` or `user_id` from query params and queries user-owned emergency reports.
2. **Mobile API Service (`mobile_api_service.dart`)**: Added `fetchEmergencyReports` client method to call `GET /api/v1/mobile/emergency-reports?users_id=...`.
3. **State Management (`app_data_repository.dart`)**: Maintained `activeEmergencyReportNotifier` (Map of active report details). On refresh, checks for any report where `status` is not `RESOLVED` / `CLOSED`.
4. **Dynamic Localization (`locale_provider.dart`)**: `getEmergencyBannerText` maps request type keys (`theft`, `accident`, `breakdown`, `other`) to localized banner text.
5. **UI & Resolve Flow (`home_screen.dart`, `emergency_status_screen.dart`)**: Displays red action banner when active report is present, hides banner when active report is null or marked resolved.

## T16 Tests & Verification

| Command / Check | Result | Evidence |
|---|---|---|
| `node --check backend-node/server/Project/ivts/service/mobile.js` | PASS | Exit code 0 (2026-08-09) |
| `flutter analyze` in `user-mobile-application` | PASS | 0 errors / 0 warnings |

## T17 PRD & Docs Update

- Updated `docs/prd/PRD-ivts.md` with mobile emergency report dynamic banner & auto-dismiss requirements.
- Updated `docs/tasks/2026-08-09-mobile-emergency-popup-type.md` active tasklist.
- Updated `docs/tasks/tasklist-progress.md` canonical system progress.

## T20 Final Handoff

- The mobile emergency request pop-up / banner now dynamically displays according to request type and auto-dismisses upon case resolution. All tests passed.
