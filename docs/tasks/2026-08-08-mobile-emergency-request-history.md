# Active Tasklist: User Mobile Emergency Request History Integration

| Field | Value |
|---|---|
| Date | 2026-08-08 |
| Project | IVTS |
| Topic | Include emergency reports ("คำร้องฉุกเฉิน") in user mobile request history ("ประวัติการแจ้งเรื่อง") |
| Target Files | `backend-node/server/Project/ivts/models/emergency_report.model.js`, `backend-node/server/Project/ivts/service/mobile.js`, `user-mobile-application/lib/screens/emergency_request_screen.dart`, `user-mobile-application/lib/providers/locale_provider.dart` |
| Active Change Record | `docs/changes/2026-08-08-mobile-emergency-request-history.md` |
| Status | done |
| Progress % | 100% |

## Source Evidence
- `backend-node/server/Project/ivts/service/mobile.js` (`listRequestHistory` previously only queried `Request.find()`, excluding emergency reports from `EmergencyReport` collection)
- `backend-node/server/Project/ivts/models/emergency_report.model.js` (Added `user_id` / `users_id` fields)
- `user-mobile-application/lib/screens/emergency_request_screen.dart` (Passed `user_id` / `users_id` in payload and called `AppDataRepository.refresh()`)
- `user-mobile-application/lib/screens/request_history_screen.dart` (UI rendering `RequestHistoryItem`s from `MockData.requestHistory`)

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-MERH-001 | Source Discovery & Implementation Plan Approval | Backend | AI | none | done | 100 | Source code inspected and Implementation Plan approved | `service/mobile.js`, `emergency_request_screen.dart` | Plan approved by user | none | — | Tasklist & Plan |
| ivts-MERH-002 | Update `emergency_report.model.js` & `mobile.js` service | Backend | AI | ivts-MERH-001 | done | 100 | Schema & service updated | `emergency_report.model.js`, `service/mobile.js` | `node --check` PASS | none | — | Backend changes |
| ivts-MERH-003 | Update `emergency_request_screen.dart` & `locale_provider.dart` | Mobile | AI | ivts-MERH-002 | done | 100 | Flutter payload, localization, and request-history refresh wiring updated | `emergency_request_screen.dart`, `locale_provider.dart`, `request_history_screen.dart` | `flutter analyze` PASS, `flutter test test/request_history_screen_test.dart` PASS | none | — | Flutter app changes |
| ivts-MERH-004 | Run verification tests (backend syntax check & flutter analyze) | QA | AI | ivts-MERH-003 | done | 100 | Syntax check, flutter analyze, and widget-test verification completed | `backend-node/`, `user-mobile-application/` | `node --check` PASS, `flutter analyze` 0 errors, `flutter test test/request_history_screen_test.dart` PASS | none | — | Verification evidence |
| ivts-MERH-005 | Update docs control (PRD, tasklist-progress, index, T1-T20 change record) | Ops | AI | ivts-MERH-004 | done | 100 | Docs updated & HTML rendered | `PRD-ivts.md`, `tasklist-progress.md`, `AI-DOCS-INDEX.md` | HTML rendering PASS | none | — | T1-T20 change doc & HTML |

## Progress Gate Weights
- Discovery Evidence (T1-T4): 20% (Completed)
- Implementation / Code Changes: 30% (Completed)
- Tests / Verification Evidence: 30% (Completed)
- PRD / Docs Decision: 10% (Completed)
- T1-T20 Handoff: 10% (Completed)
