# T1-T20 Change Document: User Mobile Login & Registration with Hashed Password and Data Isolation

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-MAuth-001 |
| Module | User Mobile Application / Mobile Auth |
| Date | 2026-08-04 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-04-user-mobile-auth-register.md` |

## T2 Requirement

- User request: Make login and register in user-mobile application functional. Register saves user profile data (email, name, surname, phone, department, role, created_at) with hashed password (`scrypt`). Login authenticates users and separates user data per logged-in user.
- Business goal: Provide secure user registration, credential authentication, and user data isolation for mobile users.
- Success outcome: Users can register via mobile app, log in using registered credentials, and view only their own vehicle/tracking/request/notification data.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route truth | `backend-node/server/routes/app.routes.js` | Mounted `/api/v1/mobile` |
| Backend routes | `backend-node/server/Project/ivts/mobile.routes.js` | Added `POST /api/v1/mobile/auth/register`, updated `POST /api/v1/mobile/auth/signin` |
| Backend service | `backend-node/server/Project/security/service/iam-mobile-client.js` | Added `registerLocalUser`, `hashPassword`, `verifyPassword`, and local signin check |
| Backend user model | `backend-node/server/Project/ivts/models/user.model.js` | Updated schema to include `password` (hash), `user_id`, `phone`, `department` |
| Mobile auth service | `user-mobile-application/lib/services/auth_service.dart` | Updated `AuthUser` fields, added `AuthService.register()` |
| Mobile register screen | `user-mobile-application/lib/screens/register_screen.dart` | Added Name, Surname, Email, Password, Phone, Department form inputs & submission |
| Mobile data repository | `user-mobile-application/lib/services/app_data_repository.dart` | Passed logged-in `userId` to API fetch functions for data isolation |
| Mobile profile screen | `user-mobile-application/lib/screens/profile_screen.dart` | Displayed name, surname, email, phone, department, role |
| Privacy / PDPA | `users` collection | Visible: Name, Surname, Email, Phone, Department, Role. Hidden: Password hash (never exposed via GET endpoints). |
| Tests | `backend-node/server/Project/security/service/iam-mobile-client-local.test.js` | 13/13 node unit tests PASS |

## T4 Current Behavior

- Current API behavior: `POST /api/v1/mobile/auth/register` creates local users in MongoDB `users` collection with `scrypt` hashed passwords. `POST /api/v1/mobile/auth/signin` checks local hashed password credentials before falling back to IAM proxy.
- Current UI behavior: `RegisterScreen` presents inputs for Name, Surname, Email, Password, Phone, Department and submits to registration endpoint. Successful registration logs in the user and opens `HomeScreen`.
- Current data behavior: `AppDataRepository` passes logged-in `userId` to backend GET `/vehicles`, `/tracking/history`, `/requests`, and `/notifications` endpoints, isolating data per user.
- Current permission behavior: Mobile users are assigned `role: 'user'`.
- Current privacy/PDPA behavior: Password hashes are stored using Node.js `crypto.scryptSync` with salt and are excluded from user payload returns.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Workflow coordination |
| Product Owner | yes | Requirement & PRD updates |
| Data Model | yes | Updated `user.model.js` schema |
| Backend | yes | Implemented registration & authentication endpoints |
| Frontend | yes | Updated Flutter screens & service layer |
| Security IAM | yes | Password hashing & secure auth handling |
| QA/UAT | yes | Verified unit tests |
| Release/Ops | yes | Updated progress tracker & docs control |

## T6 Scope

In scope:
- Mongoose `user.model.js` schema extension for `password`, `user_id`, `phone`, `department`.
- `registerLocalUser`, `hashPassword`, `verifyPassword`, and local signin in `iam-mobile-client.js`.
- `POST /api/v1/mobile/auth/register` route in `mobile.routes.js`.
- Flutter `AuthUser`, `AuthService.register()`, `RegisterScreen`, `AppDataRepository` user filtering, and `ProfileScreen` details.
- 13 backend unit tests.

Out of scope:
- Admin Web UI modifications.

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-MAuth-001 | Local user registration with hashed password | Mobile User | Must |
| FR-MAuth-002 | Local user login authentication against hashed password | Mobile User | Must |
| FR-MAuth-003 | Per-user mobile data isolation via userId query parameters | Mobile User | Must |
| FR-MAuth-004 | Display comprehensive profile details in mobile profile screen | Mobile User | Must |

Privacy / PDPA requirements:
- Personal data displayed: Name, Surname, Email, Phone, Department, Role
- Personal data hidden: Password hash
- Personal data stored or changed: `users` collection in MongoDB
- Data export/download behavior: None
- Production data-minimization decision: Password hash is never exposed to client side.

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-MAuth-001 | FR-MAuth-001 | Valid user info provided on Register screen | User taps Register button | Account created in MongoDB `users` with hashed password and user auto-logged in |
| AC-MAuth-002 | FR-MAuth-002 | Registered local user credentials entered on Sign-in screen | User taps Sign In button | Credentials verified against scrypt hash and session token returned |
| AC-MAuth-003 | FR-MAuth-003 | Logged-in user session active | User views vehicles, history, or requests | App fetches data matching logged-in user ID only |

## T9 API Contract

| Method | Endpoint | Permission | Request | Response | Error behavior |
|---|---|---|---|---|---|
| POST | `/api/v1/mobile/auth/register` | Public | `{ email, password, name, surname, phone, department }` | `{ status: true, code: 20000, data: { xAccessToken, account } }` | 400 validation error / 400 email exists / 500 error |
| POST | `/api/v1/mobile/auth/signin` | Public | `{ username, password }` | `{ status: true, data: { xAccessToken, role, account } }` | 401 invalid password / 403 hijack / IAM error |

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | yes | Added `password`, `user_id`, `phone`, `department` to `user.model.js` |
| Migration | no | MongoDB Schema handles optional default fields |
| Seed/backfill | no | Existing documents remain valid |
| Index | yes | `iam_user_id` sparse index updated |
| Rollback | Revert `user.model.js` change | Field addition is backwards compatible |

## T11 Backend Plan / Changes

- Routes: `mobile.routes.js` added `POST /api/v1/mobile/auth/register`
- Guards: Public endpoints (mobile auth)
- Services: `iam-mobile-client.js` added `registerLocalUser`, `hashPassword`, `verifyPassword`, local signin
- Controllers/models: `user.model.js` updated schema
- Tests: `iam-mobile-client-local.test.js` created (4 tests), `iam-mobile-client.test.js` updated (9 tests)

## T12 Frontend Plan / Changes

- Route: Flutter `RegisterScreen`, `SignInScreen`, `HomeScreen`
- API wrapper: `MobileApiService`, `AuthService`
- Page: `register_screen.dart`, `profile_screen.dart`
- Components: TextFields for Name, Surname, Email, Password, Phone, Department
- Visible profile/account fields: Name, Surname, Email, Phone, Department, Role
- Hidden sensitive fields: Password
- Tests: `flutter analyze lib/`

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Authentication | Local password scrypt hash verification + IAM fallback |
| Authorization path/action | Mobile users assigned `role: 'user'` |
| Data scope | Per-user filter using `userId` |
| Audit | Registration timestamp recorded (`created_at`) |
| Input validation | Input validation for email format, password length, required fields |
| Error/secret leakage | Password hashes excluded from API account payloads |
| Privacy / PDPA | Minimal user data collected, password scrypt hashed |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-001 | functional | Mobile User | Submit register form with valid inputs | 201 Created & token returned |
| TC-002 | functional | Mobile User | Sign in with registered credentials | 200 OK & user account details returned |
| TC-003 | negative | Mobile User | Register with duplicate email | 400 Bad Request ("อีเมลนี้ถูกใช้งานแล้วในระบบ") |
| TC-004 | negative | Mobile User | Sign in with wrong password | 401 Unauthorized ("รหัสผ่านไม่ถูกต้อง") |
| TC-005 | regression | Mobile User | Run unit tests | 13/13 PASS |

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/server/Project/ivts/models/user.model.js` | Added `password`, `user_id`, `phone`, `department` to schema |
| `backend-node/server/Project/security/service/iam-mobile-client.js` | Implemented `registerLocalUser`, password hashing, local password authentication |
| `backend-node/server/Project/ivts/mobile.routes.js` | Added `POST /api/v1/mobile/auth/register` route |
| `backend-node/server/Project/security/service/iam-mobile-client-local.test.js` | Created backend unit tests |
| `user-mobile-application/lib/services/auth_service.dart` | Updated `AuthUser` fields, added `register` method |
| `user-mobile-application/lib/screens/register_screen.dart` | Added Name, Surname, Email, Password, Phone, Department fields |
| `user-mobile-application/lib/services/app_data_repository.dart` | Passed logged-in `userId` to API calls |
| `user-mobile-application/lib/screens/profile_screen.dart` | Added Phone and Department fields to user information card |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| ivts-MAuth-001 | done | 100 | Implementation & unit test verification complete | None |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `node --check server/Project/ivts/models/user.model.js server/Project/security/service/iam-mobile-client.js server/Project/ivts/mobile.routes.js` | PASS | Exit code 0 |
| `node --test server/Project/security/service/iam-mobile-client-local.test.js server/Project/security/service/iam-mobile-client.test.js` | PASS 13/13 | All 13 unit tests passed |
| `flutter analyze lib/` | PASS | 0 issues found |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-ivts.md` | yes | Documented mobile registration and local password authentication |
| `docs/tasks/2026-08-04-user-mobile-auth-register.md` | yes | Active tasklist updated |
| `docs/tasks/tasklist-progress.md` | yes | Canonical system progress updated |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| D-001 | Decision | Use Node.js built-in `crypto.scryptSync` with random salt for password hashing | Security | Closed |
| D-002 | Decision | Filter mobile API resources by logged-in `userId` for data separation | Frontend/Backend | Closed |

## T19 Release / Rollback

- Release steps: Deploy backend changes, restart Node server, deploy mobile app build.
- Smoke checks: Register new account, log in, view profile & vehicles.
- Rollback trigger: Auth failure.
- Rollback steps: Revert backend route and service changes.

## T20 Final Handoff

```txt
Feature: User Mobile Application Login & Registration with Hashed Password and Data Isolation
Status: Done
Active tasklist: docs/tasks/2026-08-04-user-mobile-auth-register.md
Task IDs: ivts-MAuth-001
Progress: 100%
Changed files: user.model.js, iam-mobile-client.js, mobile.routes.js, iam-mobile-client-local.test.js, auth_service.dart, register_screen.dart, app_data_repository.dart, profile_screen.dart
Routes: POST /api/v1/mobile/auth/register, POST /api/v1/mobile/auth/signin
UI routes: RegisterScreen, SignInScreen, ProfileScreen
Permission: Mobile users assigned role: 'user'
Data migration: None required (default Schema handling)
Tests run: node --check (PASS), node --test (13/13 PASS), flutter analyze (PASS)
PRD/docs: PRD-ivts.md, tasklist-progress.md, tasklist-progress.html
Security decision: Scrypt password hashing with salt, password hash excluded from responses
Privacy/PDPA decision: Personal data minimization, sensitive password hash hidden
QA decision: PASS
Release decision: Ready for release
Open risks: None
Next owner: Product Owner / Team
```
