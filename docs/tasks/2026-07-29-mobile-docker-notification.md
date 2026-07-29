# Tasklist: Mobile App Docker Connection Notification Alert

| Field | Value |
|---|---|
| Date | 2026-07-29 |
| Project | IVTS |
| Module / Feature | user-mobile-application / Docker Notification |
| Requirement | Implement status tracking and UI notification alert when mobile app connects to Docker backend server |
| Active Change Record | `docs/changes/2026-07-29-mobile-docker-notification.md` |
| Overall Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed task progress |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| Mobile data repository | `user-mobile-application/lib/services/app_data_repository.dart` |
| Mobile localization provider | `user-mobile-application/lib/providers/locale_provider.dart` |
| Mobile home screen & UI | `user-mobile-application/lib/screens/home_screen.dart` |

## T2. Progress Calculation

| Readiness Area | Weight | Earned | Basis |
|---|---:|---:|---|
| Source Discovery | 20 | 20 | T1-T4 source code inspected |
| Implementation | 30 | 30 | Code changes completed in AppDataRepository, LocaleProvider & HomeScreen |
| Verification | 30 | 30 | Flutter analyze PASS |
| PRD / Docs Decision | 10 | 10 | Docs index & task progress updated |
| T1-T20 Handoff | 10 | 10 | T1-T20 change record created |
| **Total** | **100** | **100** | Task completed and verified |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-TASK-031 | Source Discovery: inspect app_data_repository & home_screen | Orchestrator | AI | none | done | 100 | Discovered repository & screen structure | `app_data_repository.dart`, `home_screen.dart` | file inspection | none | — | Source map |
| ivts-TASK-032 | Add dockerConnectedNotifier & status check in AppDataRepository | Mobile | AI | ivts-TASK-031 | done | 100 | Updated AppDataRepository | `app_data_repository.dart` | code inspection | none | — | Updated repository |
| ivts-TASK-033 | Add localization keys for Docker connection alert | Mobile | AI | ivts-TASK-032 | done | 100 | Added keys to LocaleProvider | `locale_provider.dart` | code inspection | none | — | Updated locale provider |
| ivts-TASK-034 | Add Docker Connection Banner & SnackBar alert in HomeScreen | Mobile | AI | ivts-TASK-033 | done | 100 | Updated HomeScreen UI | `home_screen.dart` | code inspection | none | — | Updated screen |
| ivts-TASK-035 | Verification: run flutter analyze lib/ | QA/Mobile | AI | ivts-TASK-034 | done | 100 | Validated mobile code | `pubspec.yaml` | `flutter analyze lib/` PASS | none | — | Verification log |
| ivts-TASK-036 | Docs & Handoff: update tasklist progress & T1-T20 change record | Ops | AI | ivts-TASK-035 | done | 100 | Final docs update | `tasklist-progress.md` | HTML regenerated | none | — | Final handoff |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| `flutter analyze lib/` | PASS | Exit code 0 |
| `node scripts/render-tasklist-progress-html.js .` | PASS | HTML generated successfully |


## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| none | none | open | none | none | none |

## T6. Decision

Implement `dockerConnectedNotifier` in `AppDataRepository` to track Docker connection status. Render a Docker Connection banner and SnackBar alert in `HomeScreen` when connected to Docker backend.
