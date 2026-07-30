# Tasklist: Mobile App Emergency Request Banner Conditional Display

| Field | Value |
|---|---|
| Date | 2026-07-29 |
| Project | IVTS |
| Module / Feature | user-mobile-application / Emergency Request Banner |
| Requirement | Display Emergency Request Banner on HomeScreen ONLY when an active emergency report has been submitted |
| Active Change Record | `docs/changes/2026-07-29-mobile-emergency-banner-conditional.md` |
| Overall Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed task progress |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| Mobile home screen | `user-mobile-application/lib/screens/home_screen.dart` |
| Mobile data repository | `user-mobile-application/lib/services/app_data_repository.dart` |
| Mobile emergency request screen | `user-mobile-application/lib/screens/emergency_request_screen.dart` |
| Mobile emergency status screen | `user-mobile-application/lib/screens/emergency_status_screen.dart` |

## T2. Progress Calculation

| Readiness Area | Weight | Earned | Basis |
|---|---:|---:|---|
| Source Discovery | 20 | 20 | T1-T4 source code inspected |
| Implementation | 30 | 30 | Code changes completed in screens & repository |
| Verification | 30 | 30 | `flutter analyze lib/` PASS |
| PRD / Docs Decision | 10 | 10 | Docs index & task progress updated |
| T1-T20 Handoff | 10 | 10 | T1-T20 change record created |
| **Total** | **100** | **100** | Task completed and verified |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-TASK-041 | Source Discovery: inspect emergency report state & home screen rendering | Orchestrator | AI | none | done | 100 | Inspected emergency screens & home_screen.dart | `home_screen.dart`, `emergency_request_screen.dart` | file inspection | none | — | Source map |
| ivts-TASK-042 | Add hasActiveEmergencyNotifier in AppDataRepository & wire screens | Mobile | AI | ivts-TASK-041 | done | 100 | Updated AppDataRepository, EmergencyRequestScreen & EmergencyStatusScreen | `app_data_repository.dart`, `emergency_request_screen.dart` | code inspection | none | — | Updated screens & repo |
| ivts-TASK-043 | Render Emergency Banner conditionally on HomeScreen | Mobile | AI | ivts-TASK-042 | done | 100 | Updated HomeScreen UI | `home_screen.dart` | code inspection | none | — | Updated home screen |
| ivts-TASK-044 | Verification: run flutter analyze lib/ | QA/Mobile | AI | ivts-TASK-043 | done | 100 | Validated mobile code | `pubspec.yaml` | `flutter analyze lib/` PASS | none | — | Verification log |
| ivts-TASK-045 | Docs & Handoff: update tasklist progress & T1-T20 change record | Ops | AI | ivts-TASK-044 | done | 100 | Final docs update | `tasklist-progress.md` | HTML regenerated | none | — | Final handoff |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| `flutter analyze lib/` | PASS | No issues found! (Exit code 0) |
| `node scripts/render-tasklist-progress-html.js .` | PASS | HTML generated successfully |


## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| none | none | open | none | none | none |

## T6. Decision

Add `hasActiveEmergencyNotifier` to `AppDataRepository` (default `false`). Set to `true` on emergency report submission in `EmergencyRequestScreen`, and set to `false` when marked resolved in `EmergencyStatusScreen`. Render emergency banner on `HomeScreen` ONLY when `hasActiveEmergency == true`.
