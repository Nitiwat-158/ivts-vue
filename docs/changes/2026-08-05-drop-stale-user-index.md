# T1-T20 Change Document: Drop Stale iam_user_id_1 MongoDB Index for User Registration

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-FIX-001 |
| Module | Backend / Database / User Authentication |
| Date | 2026-08-05 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-05-drop-stale-user-index.md` |

## T2 Requirement

- User request: "ช่วยแก้ให้หน่อย" (Fix the E11000 duplicate key error on iam_user_id: null)
- Business goal: Allow new mobile users to register successfully without encountering MongoDB duplicate key errors on the obsolete `iam_user_id_1` index.
- Success outcome: `iam_user_id_1` index is dropped from MongoDB `users` collection, registration succeeds for all local users, and backend automatically drops stale index on connection open.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| MongoDB User Model | `backend-node/server/Project/ivts/models/user.model.js` | Verified `iam_user_id` was removed in previous refactoring, leaving `user_id` as primary field |
| Mobile Auth Client | `backend-node/server/Project/security/service/iam-mobile-client.js` | Verified `registerLocalUser` creates user without `iam_user_id` |
| DB Initialization | `backend-node/helpers/initialize.js` | Added auto-drop of stale `iam_user_id_1` index on connection open |
| Cleanup Script | `backend-node/scripts/drop-stale-user-index.js` | Script created to safely drop `iam_user_id_1` index from `users` collection |
| Unit Tests | `backend-node/server/Project/security/service/iam-mobile-client-local.test.js` | 4/4 PASS |

## T4 Current Behavior

- Current API behavior: `POST /api/v1/mobile/auth/register` creates local users with hashed password.
- Current UI behavior: User registration screen submits user profile details.
- Current data behavior: MongoDB `users` collection holds local user profiles with primary field `user_id` and `_id`.
- Current permission behavior: Public registration endpoint.
- Current privacy/PDPA behavior: Passwords stored using secure `scrypt` hash with random salt.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | no | Single backend/DB change |
| Product Owner | no | Bug fix, no requirements change |
| Data Model | yes | Clean up obsolete MongoDB collection index |
| Backend | yes | Added index cleanup script and initialization logic |
| Frontend | no | No UI changes required |
| Security IAM | no | No IAM rule changes |
| QA/UAT | yes | Verified registration unit tests |
| Release/Ops | yes | Index cleanup applied |

## T6 Scope

In scope:
- Create `backend-node/scripts/drop-stale-user-index.js` to drop obsolete `iam_user_id_1` index.
- Update `backend-node/helpers/initialize.js` to automatically drop `iam_user_id_1` index when MongoDB connection opens.
- Execute index cleanup script and verify unit tests.
- Update active tasklist and progress tracking docs.

Out of scope:
- Schema changes (schema was already updated in `ivts-MODEL-001`).

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-FIX-001 | System must register multiple local users without encountering MongoDB index collision on `iam_user_id` | Mobile User | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-FIX-001 | FR-FIX-001 | Multiple new users register via mobile app | Users submit registration form | Registrations succeed without E11000 duplicate key error |

## T9 API Contract

| Method | Endpoint | Permission | Request | Response | Error behavior |
|---|---|---|---|---|---|
| POST | `/api/v1/mobile/auth/register` | Public | `{ email, password, name, surname, phone, department }` | `{ status: true, code: 20000, data: { xAccessToken, account } }` | 400 validation error / 400 email exists |

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | no | Already updated in previous refactor |
| Migration | yes | Dropped obsolete index `iam_user_id_1` |
| Seed/backfill | no | Not required |
| Index | yes | Dropped `iam_user_id_1` index from `users` collection |
| Rollback | N/A | Obsolete index is no longer used |

## T11 Backend Plan / Changes

- Routes: `mobile.routes.js`
- Services: `iam-mobile-client.js`
- Helpers: `backend-node/helpers/initialize.js` updated to auto-drop `iam_user_id_1` index
- Scripts: `backend-node/scripts/drop-stale-user-index.js` created
- Tests: `iam-mobile-client-local.test.js` (4/4 PASS)

## T12 Frontend Plan / Changes

- No frontend changes needed.

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Authentication | Local registration creates scrypt-hashed passwords |
| Authorization path/action | Public endpoint for registration |
| Data scope | Isolated per user |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-001 | functional | Mobile User | Execute `drop-stale-user-index.js` script | Output reports index dropped or already clean |
| TC-002 | regression | Mobile User | Run `iam-mobile-client-local.test.js` | All 4 tests PASS |

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/scripts/drop-stale-user-index.js` | NEW — Script to drop stale `iam_user_id_1` index |
| `backend-node/helpers/initialize.js` | MODIFIED — Auto-drop `iam_user_id_1` index on connection open |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| ivts-FIX-001 | done | 100% | Gate 1-5 complete: Script created & executed, initialize.js updated, unit tests 4/4 PASS, system progress updated | none |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `node scripts/drop-stale-user-index.js` | PASS | Successfully executed index cleanup script |
| `node --check helpers/initialize.js scripts/drop-stale-user-index.js` | PASS | Clean syntax check |
| `node --test server/Project/security/service/iam-mobile-client-local.test.js` | PASS | 4/4 tests PASS |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/tasks/2026-08-05-drop-stale-user-index.md` | yes | Active tasklist |
| `docs/tasks/tasklist-progress.md` | yes | Canonical progress tracker |
| `docs/tasks/tasklist-progress.html` | yes | Regenerated progress HTML |
| `docs/AI-DOCS-INDEX.md` | yes | Documentation index |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| D-001 | Decision | Automatically drop stale `iam_user_id_1` index on DB connection open so environment sync is zero-touch | AI | closed |

## T19 Release / Rollback

- Release steps: Deploy backend changes; stale index is automatically dropped on app start or script run.
- Smoke checks: Run `node scripts/drop-stale-user-index.js`.
- Rollback steps: N/A.

## T20 Final Handoff

```txt
Feature: Drop Stale iam_user_id_1 Index
Status: done
Active tasklist: docs/tasks/2026-08-05-drop-stale-user-index.md
Task IDs: ivts-FIX-001
Progress: 100%
Changed files: backend-node/scripts/drop-stale-user-index.js, backend-node/helpers/initialize.js
Routes: /api/v1/mobile/auth/register
Permission: Public
Data migration: Dropped stale index iam_user_id_1 from users collection
Tests run: node scripts/drop-stale-user-index.js PASS, node --test 4/4 PASS
PRD/docs: docs/tasks/2026-08-05-drop-stale-user-index.md, docs/changes/2026-08-05-drop-stale-user-index.md, docs/tasks/tasklist-progress.md
Security decision: No security impact
QA decision: PASS
Release decision: Ready
Open risks: None
Next owner: —
```
