# T1-T20 Change Record: Mobile App Docker Connection Notification Alert

## Document Control

| Item | Details |
|---|---|
| Date | 2026-07-29 |
| Topic | Write code to notify when mobile app connects to Docker backend server |
| Author | AI Pair Programming Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-29-mobile-docker-notification.md` |

---

## T1. Requirement Summary
Implement real-time connection status detection and UI notification alert in `user-mobile-application` when it successfully connects to the backend Docker server.

---

## T2. Source Discovery & Impacted Components

- [app_data_repository.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/services/app_data_repository.dart): Added `dockerConnectedNotifier` (`ValueNotifier<bool?>`) and updated API refresh response tracking.
- [locale_provider.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/providers/locale_provider.dart): Added translation keys for Docker connection title and messages in Thai and English.
- [home_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/home_screen.dart): Added `ValueListenableBuilder` listening to `dockerConnectedNotifier`, rendering a green Docker Connection Banner ("เชื่อมต่อกับระบบ Docker Server เรียบร้อยแล้ว") and SnackBar notification upon tap.

---

## T15. Implementation Summary

1. Updated `AppDataRepository`: Added `dockerConnectedNotifier` to track Docker connection status on `refresh()`.
2. Updated `LocaleProvider`: Added `'docker_connected_title'`, `'docker_connected_msg'`, and `'docker_disconnected_msg'` keys.
3. Updated `HomeScreen`: Integrated `ValueListenableBuilder<bool?>` to display an inline `_ActionBanner` and SnackBar alert when connected to Docker.

---

## T16. Verification Evidence

- `flutter analyze lib/`: PASS
- `node scripts/render-tasklist-progress-html.js .`: PASS

---

## T17. PRD & Docs Impact

Updated `docs/AI-DOCS-INDEX.md` and canonical system progress tasklist.

---

## T20. Final Handoff

| Field | Value |
|---|---|
| Work Completed | Mobile app Docker connection status tracking and UI notification banner added |
| Verification | Flutter analyze PASS |
| Open Blockers | None |
| Next Action | Test live app connection to Docker backend |
