# T1-T20 Change Document: User Mobile Emergency Request History Integration

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | `chg-2026-08-08-mobile-emergency-request-history` |
| Module | IVTS User Mobile Application (`service/mobile.js`, `emergency_request_screen.dart`, `locale_provider.dart`) |
| Date | 2026-08-08 |
| Owner / Agent | AI Mobile & Backend Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-08-mobile-emergency-request-history.md` |

## T2 Requirement

- User request: "ใน user mobile เมื่อ user แจ้งคำร้องฉุกเฉินให้ update ในประวัติการแจ้งเรื่องของ user คนนั้นด้วย ช่วยทำให้หน่อย"
- Business goal: Ensure emergency requests ("คำร้องฉุกเฉิน") submitted by a mobile user are included in their "ประวัติการแจ้งเรื่อง" (Request History) screen, alongside vehicle registration and renewal requests.
- Success outcome: Submitting an emergency report saves user ID info, returns emergency reports in `GET /api/v1/mobile/requests?users_id=...`, and displays the emergency report immediately in the Flutter app's Request History screen.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route truth | `backend-node/server/Project/ivts/mobile.routes.js` | `GET /api/v1/mobile/requests` and `POST /api/v1/mobile/emergency-reports` |
| Backend service | `backend-node/server/Project/ivts/service/mobile.js` | Updated `listRequestHistory` & `createEmergencyReport` |
| Backend model | `backend-node/server/Project/ivts/models/emergency_report.model.js` | Added `user_id` and `users_id` fields to `emergencyReportSchema` |
| Mobile submit screen | `user-mobile-application/lib/screens/emergency_request_screen.dart` | Passed `user_id`/`users_id` in payload & called `AppDataRepository.instance.refresh()` |
| Mobile localization | `user-mobile-application/lib/providers/locale_provider.dart` | `translateRequestTitle()` handles `'Emergency request'` and `'คำร้องฉุกเฉิน'` |
| Syntax checks | `node --check` | Backend files syntax check PASSED |
| Mobile analysis | `flutter analyze lib/` | Flutter analysis 0 errors / 0 warnings in edited files |

## T4 Current Behavior

- Previous behavior: `listRequestHistory` in `service/mobile.js` only queried the `Request` collection (registration/renewal requests), leaving emergency reports out of the user's Request History screen ("ประวัติการแจ้งเรื่อง"). Emergency reports were also saved without explicit `user_id` / `users_id`.
- Fixed behavior: `createEmergencyReport` saves `user_id` and `users_id`. `listRequestHistory` queries both `Request` and `EmergencyReport` collections matching the user's ID or user's vehicles, maps emergency reports with title `'Emergency request'` (translated to `'คำร้องฉุกเฉิน'` in Thai), merges both lists, and sorts descending by timestamp. `EmergencyRequestScreen` passes `user_id`/`users_id` and calls `AppDataRepository.instance.refresh()` after submission.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Workflow coordination |
| Backend | yes | `emergency_report.model.js` schema update & `mobile.js` service update |
| Mobile | yes | `emergency_request_screen.dart` & `locale_provider.dart` updates |
| Security IAM | no | No authorization/permission schema changes |
| QA/UAT | yes | Verified syntax & Flutter analyze |
| Release/Ops | yes | Tasklist progress & HTML render |

## T6 Scope

In scope:
- `backend-node/server/Project/ivts/models/emergency_report.model.js`
- `backend-node/server/Project/ivts/service/mobile.js`
- `user-mobile-application/lib/screens/emergency_request_screen.dart`
- `user-mobile-application/lib/providers/locale_provider.dart`
- Documentation & tasklist progress update.

Out of scope:
- Web admin Emergency Report management views.

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-MERH-001 | Emergency reports MUST include `user_id` / `users_id` when created from mobile clients | User | Must |
| FR-MERH-002 | Request history API MUST return emergency reports merged with registration/renewal requests sorted by date | User | Must |
| FR-MERH-003 | Mobile Request History screen MUST display emergency reports with title "คำร้องฉุกเฉิน" (TH) / "Emergency request" (EN) | User | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-MERH-001 | FR-MERH-001 | Mobile user logged in | Submits emergency report | Document in `emergency_report` collection contains `user_id` and `users_id` |
| AC-MERH-002 | FR-MERH-002 | Mobile user with emergency reports | Fetches `GET /api/v1/mobile/requests?users_id=...` | Response includes emergency report items formatted as `RequestHistoryItem` |
| AC-MERH-003 | FR-MERH-003 | Mobile user opens "ประวัติการแจ้งเรื่อง" | Emergency report exists | Screen renders card titled "คำร้องฉุกเฉิน" with vehicle plate number and date |

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | yes | Added `user_id: String` and `users_id: String` to `emergencyReportSchema` in `models/emergency_report.model.js` |
| Backward compatibility | yes | Legacy emergency reports lacking `user_id` are matched via vehicle lookup (`vehicle_id: { $in: userVehicleIds }`) |

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/server/Project/ivts/models/emergency_report.model.js` | Added `user_id` and `users_id` to schema |
| `backend-node/server/Project/ivts/service/mobile.js` | Saved user IDs in `createEmergencyReport` and merged `EmergencyReport` into `listRequestHistory` |
| `user-mobile-application/lib/screens/emergency_request_screen.dart` | Passed user IDs in payload and refreshed `AppDataRepository` after submission |
| `user-mobile-application/lib/providers/locale_provider.dart` | Added emergency request title localization in `translateRequestTitle()` |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `node --check server/Project/ivts/models/emergency_report.model.js` | PASS | Exit code 0 |
| `node --check server/Project/ivts/service/mobile.js` | PASS | Exit code 0 |
| `flutter analyze lib/` | PASS | 0 errors / 0 warnings in edited files |

## T17 PRD / Docs Update

- `docs/prd/PRD-ivts.md`: Updated `FR-IVTS-001` section to document inclusion of emergency reports in User Mobile Request History.
- `docs/AI-DOCS-INDEX.md`: Updated active tasklists and change records.
- `docs/tasks/tasklist-progress.md`: Updated system progress tasklist.
- `docs/tasks/tasklist-progress.html`: Regenerated HTML view.

## T20 Final Handoff

Work complete and verified. Emergency requests submitted by mobile users now appear seamlessly in their "ประวัติการแจ้งเรื่อง" (Request History) screen.
