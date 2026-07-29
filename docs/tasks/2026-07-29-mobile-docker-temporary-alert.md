# Tasklist: Temporary Mobile App Docker Connection Alert

| Field | Value |
|---|---|
| Date | 2026-07-29 |
| Project | IVTS |
| Module / Feature | user-mobile-application / Temporary Docker Alert |
| Requirement | Show Docker connection notification alert temporarily (3 seconds SnackBar) instead of keeping a persistent banner on screen |
| Active Change Record | `docs/changes/2026-07-29-mobile-docker-temporary-alert.md` |
| Overall Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed task progress |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| Mobile home screen | `user-mobile-application/lib/screens/home_screen.dart` |
| Mobile data repository | `user-mobile-application/lib/services/app_data_repository.dart` |

## T2. Progress Calculation

| Readiness Area | Weight | Earned | Basis |
|---|---:|---:|---|
| Source Discovery | 20 | 20 | T1-T4 source code inspected |
| Implementation | 30 | 30 | HomeScreen updated with temporary SnackBar alert |
| Verification | 30 | 30 | `flutter analyze lib/` PASS |
| PRD / Docs Decision | 10 | 10 | Docs index & task progress updated |
| T1-T20 Handoff | 10 | 10 | T1-T20 change record created |
| **Total** | **100** | **100** | Task completed and verified |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-TASK-037 | Source Discovery: inspect home_screen notification logic | Orchestrator | AI | none | done | 100 | Inspected home_screen.dart banner & listener | `home_screen.dart` | file inspection | none | — | Source map |
| ivts-TASK-038 | Replace persistent banner with temporary 3-second SnackBar alert | Mobile | AI | ivts-TASK-037 | done | 100 | Updated home_screen.dart | `home_screen.dart` | code inspection | none | — | Updated home_screen |
| ivts-TASK-039 | Verification: run flutter analyze lib/ | QA/Mobile | AI | ivts-TASK-038 | done | 100 | Validated mobile code | `pubspec.yaml` | `flutter analyze lib/` PASS | none | — | Verification log |
| ivts-TASK-040 | Docs & Handoff: update tasklist progress & T1-T20 change record | Ops | AI | ivts-TASK-039 | done | 100 | Final docs update | `tasklist-progress.md` | HTML regenerated | none | — | Final handoff |

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

Change Docker connection alert in `HomeScreen` to a 3-second temporary floating `SnackBar` pop-up upon connection and remove the static inline banner from the screen body.
