# Tasklist: Mobile App Profile Logout Confirmation Pop-up

| Field | Value |
|---|---|
| Date | 2026-07-28 |
| Project | IVTS Mobile App |
| Module / Feature | `user-mobile-application` — Profile Screen |
| Requirement | Show confirmation pop-up when tapping "Log out" in Profile screen. On confirmation, clear auth token and navigate back to `SignInScreen` |
| Active Change Record | `docs/changes/2026-07-28-mobile-profile-logout-popup.md` |
| Overall Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed — code modified, flutter analyze clean, T1-T20 change record created |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| Profile Screen | `user-mobile-application/lib/screens/profile_screen.dart` |
| Sign In Screen | `user-mobile-application/lib/screens/sign_in_screen.dart` |
| Auth Service | `user-mobile-application/lib/services/auth_service.dart` |
| Locale Provider | `user-mobile-application/lib/providers/locale_provider.dart` |

## T2. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-MLOG-001 | Source Discovery & Dialog Design | Mobile | AI | none | done | 100 | Target files and existing dialog patterns identified | profile_screen.dart, emergency_status_screen.dart | — | none | — | Source evidence documented |
| ivts-MLOG-002 | Add logout translation keys | Mobile | AI | ivts-MLOG-001 | done | 100 | Added confirm_logout_title/message keys | locale_provider.dart | — | none | — | Translation keys added |
| ivts-MLOG-003 | Implement Logout Pop-up and Navigation | Mobile | AI | ivts-MLOG-002 | done | 100 | Added _showLogoutDialog & signOut() navigation | profile_screen.dart | — | none | — | Popup & AuthService.signOut logic |
| ivts-MLOG-004 | Verification / Analysis check | Mobile | AI | ivts-MLOG-003 | done | 100 | flutter analyze lib/ PASS | profile_screen.dart, locale_provider.dart | flutter analyze PASS | none | — | Syntax & static analysis clean |
| ivts-MLOG-005 | Create T1-T20 Change Record & Update Progress | Docs | AI | ivts-MLOG-004 | done | 100 | T1-T20 document created, progress updated | docs/changes/2026-07-28-mobile-profile-logout-popup.md | — | none | — | Final change record |

## T3. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| Code Inspection | PASS | profile_screen.dart logout button and dialog structure analyzed |
| flutter analyze lib/ | PASS | No issues found! |

## T4. Blockers And Risks

none
