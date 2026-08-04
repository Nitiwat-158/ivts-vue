# Task: User Mobile Application Login & Registration with Hashed Password and Data Isolation

| Field | Value |
|---|---|
| Date | 2026-08-04 |
| Project | IVTS |
| Module / Feature | User Mobile Application – Local Auth, Registration, Password Hash & User Data Isolation |
| Change Record | `docs/changes/2026-08-04-user-mobile-auth-register.md` |
| Owner | AI |
| Status | done |

## T1. Source Evidence

| File | Role |
|---|---|
| `backend-node/server/Project/ivts/models/user.model.js` | MongoDB `users` collection schema — added `password`, `phone`, `department`, `user_id` |
| `backend-node/server/Project/security/service/iam-mobile-client.js` | Mobile auth client — added local register, `scrypt` password hashing, and local signin |
| `backend-node/server/Project/ivts/mobile.routes.js` | Mobile routes — added `POST /api/v1/mobile/auth/register` |
| `user-mobile-application/lib/services/auth_service.dart` | Flutter auth service — added `register` and updated `AuthUser` |
| `user-mobile-application/lib/screens/register_screen.dart` | Flutter register screen — form fields & registration logic |
| `user-mobile-application/lib/services/app_data_repository.dart` | Flutter data repository — filter API data by logged-in `userId` |
| `user-mobile-application/lib/screens/profile_screen.dart` | Flutter profile screen — display active user attributes |

## T2. Task Checklist

- `[x]` T1 — Update `user.model.js` schema with `password` (hash), `phone`, `department`, `user_id` fields
- `[x]` T2 — Implement `registerLocalUser` & local signin in `iam-mobile-client.js` with `crypto.scryptSync` password hashing
- `[x]` T3 — Add `POST /api/v1/mobile/auth/register` route to `mobile.routes.js`
- `[x]` T4 — Create backend unit test `iam-mobile-client-local.test.js`
- `[x]` T5 — Update Flutter `AuthUser` and `AuthService.register()` in `auth_service.dart`
- `[x]` T6 — Update `register_screen.dart` UI fields and logic
- `[x]` T7 — Pass logged-in `userId` in `app_data_repository.dart` for user data separation
- `[x]` T8 — Update `profile_screen.dart` to display logged-in user profile
- `[x]` T9 — Run backend tests and verify Flutter code
- `[x]` T10 — Create change record `docs/changes/2026-08-04-user-mobile-auth-register.md`
- `[x]` T11 — Update `docs/tasks/tasklist-progress.md` and regenerate `docs/tasks/tasklist-progress.html`

## T3. Active Task Rows

| Task ID | Task | Status | Progress % | Source Evidence | Tests Evidence | Blocker | Next Action |
|---|---|---|---:|---|---|---|---|
| ivts-MAuth-001 | Update user.model.js schema | done | 100 | `user.model.js` updated | node --check PASS | none | — |
| ivts-MAuth-002 | Add local register & password verification to iam-mobile-client.js | done | 100 | `iam-mobile-client.js` updated | 13/13 PASS | none | — |
| ivts-MAuth-003 | Add /auth/register route to mobile.routes.js | done | 100 | `mobile.routes.js` updated | node --check PASS | none | — |
| ivts-MAuth-004 | Update Flutter auth_service.dart & register_screen.dart | done | 100 | `register_screen.dart` updated | flutter analyze PASS | none | — |
| ivts-MAuth-005 | Isolate user data per logged-in user in app_data_repository.dart | done | 100 | `app_data_repository.dart` updated | flutter analyze PASS | none | — |
| ivts-MAuth-006 | Verification and T1-T20 handoff | done | 100 | change record + progress.md | 13/13 PASS | none | — |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| `node --check server/Project/ivts/models/user.model.js server/Project/security/service/iam-mobile-client.js server/Project/ivts/mobile.routes.js` | PASS | Exit code 0 |
| `node --test server/Project/security/service/iam-mobile-client-local.test.js server/Project/security/service/iam-mobile-client.test.js` | PASS | 13/13 unit tests passed |
| `flutter analyze lib/` | PASS | 0 issues found |

## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| R-001 | risk | closed | Password hashing uses Node.js `crypto.scryptSync` with random salt | Passwords securely hashed | Implemented & verified |

## T6. Decision

Local registration for `user-mobile-application` saves user credentials into MongoDB `users` collection with `scrypt` hashed passwords. Logged-in user session drives per-user data isolation in `AppDataRepository`.
