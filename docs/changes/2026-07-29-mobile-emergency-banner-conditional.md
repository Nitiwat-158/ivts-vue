# T1-T20 Change Record: Mobile App Emergency Request Banner Conditional Display

## Document Control

| Item | Details |
|---|---|
| Date | 2026-07-29 |
| Topic | Display Emergency Request Banner on HomeScreen ONLY when an active emergency report has been submitted |
| Author | AI Pair Programming Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-29-mobile-emergency-banner-conditional.md` |

---

## T1. Requirement Summary
Update `user-mobile-application` so that the Red Emergency Banner ("มีคำร้องฉุกเฉิน Theft / Stolen กำลังดำเนินการ — แตะเพื่อดู") is rendered on `HomeScreen` **only** when an active emergency request has been submitted by the user, and is removed when marked as resolved.

---

## T2. Source Discovery & Impacted Components

- [app_data_repository.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/services/app_data_repository.dart): Added `hasActiveEmergencyNotifier` (`ValueNotifier<bool>`).
- [emergency_request_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/emergency_request_screen.dart): Updated SUBMIT button handler to set `hasActiveEmergencyNotifier.value = true`.
- [emergency_status_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/emergency_status_screen.dart): Updated "mark resolved" handler to set `hasActiveEmergencyNotifier.value = false`.
- [home_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/home_screen.dart): Wrapped Emergency Banner in `ValueListenableBuilder<bool>`, rendering it **only** when `hasActiveEmergency == true`.

---

## T15. Implementation Summary

1. Updated `AppDataRepository`: Added `hasActiveEmergencyNotifier` to maintain reactive active emergency report state.
2. Updated `EmergencyRequestScreen`: When user submits an emergency report, `hasActiveEmergencyNotifier.value` is set to `true`.
3. Updated `EmergencyStatusScreen`: When user marks the case as resolved, `hasActiveEmergencyNotifier.value` is set to `false`.
4. Updated `HomeScreen`: Wrapped the Red Emergency Banner with `ValueListenableBuilder<bool>`, ensuring it is hidden by default and displayed only when an active report exists.

---

## T16. Verification Evidence

- `flutter analyze lib/`: PASS (No issues found!)
- `node scripts/render-tasklist-progress-html.js .`: PASS

---

## T17. PRD & Docs Impact

Updated `docs/AI-DOCS-INDEX.md` and canonical system progress tasklist.

---

## T20. Final Handoff

| Field | Value |
|---|---|
| Work Completed | Emergency request banner conditional display implemented based on active emergency report state |
| Verification | Flutter analyze PASS |
| Open Blockers | None |
| Next Action | Test live app user flow |
