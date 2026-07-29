# T1-T20 Change Record: Temporary Mobile App Docker Connection Alert

## Document Control

| Item | Details |
|---|---|
| Date | 2026-07-29 |
| Topic | Display Docker connection notification alert temporarily (3 seconds) only |
| Author | AI Pair Programming Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-29-mobile-docker-temporary-alert.md` |

---

## T1. Requirement Summary
Update `user-mobile-application` so that the Docker connection alert is displayed temporarily as a 3-second floating SnackBar pop-up upon connection and automatically disappears, rather than remaining persistently on the home screen.

---

## T2. Source Discovery & Impacted Components

- [home_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/home_screen.dart): Added listener to `AppDataRepository.instance.dockerConnectedNotifier`, triggering a 3-second floating SnackBar alert ("เชื่อมต่อกับระบบ Docker Server เรียบร้อยแล้ว") when connection is established, and removed the persistent inline banner from the screen body.

---

## T15. Implementation Summary

1. Updated `HomeScreen`:
   - Added `_onDockerStatusChanged` listener listening to `dockerConnectedNotifier`.
   - Fires a floating `SnackBar` pop-up (duration: 3 seconds, green color theme with `Icons.dns_rounded` icon) once upon Docker connection.
   - Removed the inline `_ActionBanner` for Docker from the home list view so the screen remains clean and un-cluttered.

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
| Work Completed | Docker connection notification alert converted to temporary 3-second SnackBar |
| Verification | Flutter analyze PASS |
| Open Blockers | None |
| Next Action | Test live app execution |
