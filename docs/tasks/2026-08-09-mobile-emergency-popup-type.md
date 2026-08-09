# Tasklist: Mobile App Dynamic Emergency Request Pop-up / Banner by Request Type

## Task Metadata

| Field | Value |
|---|---|
| Tasklist ID | `ivts-TASK-054` |
| Feature / Topic | Dynamic Mobile Emergency Request Banner / Pop-up by Request Type |
| Date | 2026-08-09 |
| Owner | AI Mobile & Backend Agent |
| Target Release | v1.0.0 (IVTS Mobile App) |

## Work Items & Progress Tracking

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ivts-TASK-054-01 | Source Discovery & Requirements Analysis | Orchestrator | AI Agent | none | done | 100% | T1-T4 source discovery completed | `mobile.js`, `home_screen.dart`, `emergency_request_screen.dart`, `locale_provider.dart` | Inspected existing codebase and localization keys | none | — | Tasklist initialized |
| ivts-TASK-054-02 | Backend API Enhancement for User Emergency Reports | Backend Agent | AI Agent | ivts-TASK-054-01 | done | 100% | `listEmergencyReports` updated with `users_id` filtering | `backend-node/server/Project/ivts/service/mobile.js` | `node --check` PASS | none | — | Filtered emergency reports endpoint |
| ivts-TASK-054-03 | Mobile App Emergency State & Localized Banner | Frontend Agent | AI Agent | ivts-TASK-054-02 | done | 100% | `activeEmergencyReportNotifier`, `getEmergencyBannerText` & `HomeScreen` updated | `app_data_repository.dart`, `locale_provider.dart`, `home_screen.dart` | `flutter analyze` PASS (0 issues) | none | — | Updated Flutter mobile app |
| ivts-TASK-054-04 | Verification & T1-T20 Handoff Document | QA Agent | AI Agent | ivts-TASK-054-03 | done | 100% | T16 tests run and T1-T20 document finalized | `docs/changes/2026-08-09-mobile-emergency-popup-type.md` | `node --check` PASS & `flutter analyze` PASS | none | — | Completed change doc & updated progress HTML |
