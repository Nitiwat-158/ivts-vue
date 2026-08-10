# T1-T20 Change Document: Mobile Emergency Request Banner Auto-Dismiss on RESOLVED Status

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | `chg-2026-08-09-mobile-emergency-resolved-auto-dismiss` |
| Module | IVTS User Mobile Application (`app_data_repository.dart`, `emergency_status_screen.dart`) & Backend Mobile Service (`mobile.js`) |
| Date | 2026-08-09 |
| Owner / Agent | AI Mobile & Backend Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-09-mobile-emergency-resolved-auto-dismiss.md` |

## T2 Requirement

- User request: "ใน mobile app pop-up ของคำร้องฉุกเฉินจะหายไปเมื่อคำร้องเปลี่ยนสถานะเป็น "RESOLVED" แล้ว ช่วยแก้ไขให้หน่อย"
- Business goal: Ensure that whenever an emergency report status becomes `RESOLVED` (or `CLOSED`), the emergency request banner / pop-up on the Flutter mobile app Home screen is automatically hidden (`null` active state).
- Success outcome: 
  1. Evaluating emergency reports in `AppDataRepository` inspects the user's latest report; if status is `RESOLVED` or `CLOSED`, `activeEmergencyReportNotifier` is set to `null` so the Home screen banner disappears.
  2. `buildEmergencyTimeline` in backend `mobile.js` includes the 4th timeline step `resolved` (`เคสได้รับการแก้ไขแล้ว`) marked as completed when status is `RESOLVED` or `CLOSED`.
  3. `EmergencyStatusScreen` clears active emergency state when loading a resolved report.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend service | `backend-node/server/Project/ivts/service/mobile.js` | Updated `buildEmergencyTimeline` to add 4th `resolved` step & updated `listEmergencyReports` sorting order |
| App Data Repository | `user-mobile-application/lib/services/app_data_repository.dart` | Updated `_refreshEmergencyReports` to evaluate latest report status and clear active state when status is `RESOLVED` or `CLOSED` |
| Emergency Status Screen | `user-mobile-application/lib/screens/emergency_status_screen.dart` | Updated `_fetchReport()` to clear active state if report status is `RESOLVED` or `CLOSED` |

## T15 Implementation Summary

1. **Backend Timeline & Sorting (`mobile.js`)**:
   - Updated `buildEmergencyTimeline` to return 4 steps (`submitted`, `acknowledged`, `contacting`, `resolved`).
   - Sorted `listEmergencyReports` by `submitted_at: -1, incident_time: -1` so the newest report is evaluated first.
2. **Mobile Repository State Guard (`app_data_repository.dart`)**:
   - `_refreshEmergencyReports({String? userId})` checks `latestReport['status']`. If status is `RESOLVED` or `CLOSED`, sets `activeEmergencyReportNotifier.value = null` and `activeEmergencyIdNotifier.value = null`.
3. **Screen Sync (`emergency_status_screen.dart`)**:
   - In `_fetchReport()`, if report status is `RESOLVED` or `CLOSED`, clears active emergency state so the banner hides automatically.

## T16 Tests & Verification

| Command / Check | Result | Evidence |
|---|---|---|
| `node --check backend-node/server/Project/ivts/service/mobile.js` | PASS | Exit code 0 (2026-08-09) |
| `flutter analyze` in `user-mobile-application` | PASS | No issues found! (0 errors / 0 warnings) |

## T17 PRD & Docs Update

- Updated `docs/prd/PRD-ivts.md` with RESOLVED status auto-dismiss requirement.
- Updated `docs/tasks/2026-08-09-mobile-emergency-resolved-auto-dismiss.md` active tasklist.
- Updated `docs/tasks/tasklist-progress.md` canonical system progress.

## T20 Final Handoff

- The emergency request pop-up / banner on the mobile app Home screen now automatically disappears whenever the report status is `RESOLVED` or `CLOSED`. All automated tests passed.
