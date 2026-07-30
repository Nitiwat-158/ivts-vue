# Tasklist: Mobile App Skip Sign In Button

| Field | Value |
|---|---|
| Date | 2026-07-28 |
| Project | IVTS Mobile App |
| Module / Feature | `user-mobile-application` — Sign In Screen |
| Requirement | Add a "Skip / ข้ามการเข้าสู่ระบบ" button on `SignInScreen` to bypass authentication and enter `HomeScreen` directly |
| Active Change Record | `docs/changes/2026-07-28-mobile-skip-signin.md` |
| Overall Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed — code changes completed, flutter analyze verified, change document recorded |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| Mobile App Sign In Screen | `user-mobile-application/lib/screens/sign_in_screen.dart` |
| Mobile App Auth Gate | `user-mobile-application/lib/screens/auth_gate.dart` |
| Mobile App Auth Service | `user-mobile-application/lib/services/auth_service.dart` |
| Mobile App Home Screen | `user-mobile-application/lib/screens/home_screen.dart` |
| Locale Provider | `user-mobile-application/lib/providers/locale_provider.dart` |

## T2. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-MSIP-001 | Source Discovery & Analysis | Mobile | AI | none | done | 100 | Code read and target files identified | sign_in_screen.dart, locale_provider.dart | — | none | — | Source evidence documented |
| ivts-MSIP-002 | Add skip_sign_in translations | Mobile | AI | ivts-MSIP-001 | done | 100 | Added key `skip_sign_in` for TH/EN | locale_provider.dart | — | none | — | Translation keys added |
| ivts-MSIP-003 | Add Skip button to SignInScreen | Mobile | AI | ivts-MSIP-002 | done | 100 | OutlinedButton and _skipSignIn() added | sign_in_screen.dart | — | none | — | Added Skip button UI & navigation |
| ivts-MSIP-004 | Verification / Analysis check | Mobile | AI | ivts-MSIP-003 | done | 100 | flutter analyze lib/ executed | sign_in_screen.dart, locale_provider.dart | flutter analyze PASS | none | — | Syntax & static analysis clean |
| ivts-MSIP-005 | Create T1-T20 Change Record & Update Progress | Docs | AI | ivts-MSIP-004 | done | 100 | T1-T20 document created, tasklist progress updated | docs/changes/2026-07-28-mobile-skip-signin.md | — | none | — | Final change record |

## T3. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| Code Inspection | PASS | sign_in_screen.dart structure verified |
| flutter analyze lib/ | PASS | No issues found in lib/ |

## T4. Blockers And Risks

none
