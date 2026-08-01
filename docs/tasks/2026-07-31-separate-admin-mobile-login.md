# Task: Separate Web Admin Login and User Mobile Login

| Field | Value |
|---|---|
| Date | 2026-07-31 |
| Project | IVTS |
| Module / Feature | Authentication – IAM Admin Client / IAM Mobile Client |
| Change Record | `docs/changes/2026-07-31-separate-admin-mobile-login.md` |
| Owner | AI |
| Status | done |

## T1. Source Evidence

| File | Role |
|---|---|
| `backend-node/server/Project/security/service/iam-admin-client.js` | Web Admin IAM proxy — reverted to commit 9a255686 |
| `backend-node/server/Project/security/service/iam-mobile-client.js` | **[NEW]** Mobile IAM proxy with JIT provisioning |
| `backend-node/server/Project/security/service/iam-mobile-client.test.js` | **[NEW]** Unit tests for mobile client |
| `backend-node/server/Project/ivts/mobile.routes.js` | Updated to use `iamMobileClient` instead of `iamAdminClient` |
| `backend-node/server/Project/ivts/models/user.model.js` | MongoDB `users` collection — source for JIT provisioning |
| `backend-node/test/mock-iam-server.js` | Shared mock IAM server used in tests |

## T2. Task Checklist

- `[x]` T1 — Revert `forwardScopedSignin` in `iam-admin-client.js` to original admin-only flow
- `[x]` T2 — Create `iam-mobile-client.js` with `forwardMobileSignin`, JIT provisioning, and Google token fallback
- `[x]` T3 — Create `iam-mobile-client.test.js` with 9 unit tests
- `[x]` T4 — Update `mobile.routes.js` to use `iamMobileClient.forwardMobileSignin`
- `[x]` T5 — Run `iam-admin-client.test.js` — 15/15 PASS (no regression)
- `[x]` T6 — Run `iam-mobile-client.test.js` — 9/9 PASS
- `[x]` T7 — `node --check` syntax verification on all changed/new files — PASS
- `[x]` T8 — Create change record (`docs/changes/2026-07-31-separate-admin-mobile-login.md`)
- `[x]` T9 — Update `docs/tasks/tasklist-progress.md` and regenerate HTML

## T3. Active Task Rows

| Task ID | Task | Status | Progress % | Source Evidence | Tests Evidence | Blocker | Next Action |
|---|---|---|---:|---|---|---|---|
| ivts-AUTH-001 | Revert iam-admin-client.js to original admin-only login | done | 100 | `iam-admin-client.js` diff confirmed | 15/15 PASS | none | — |
| ivts-AUTH-002 | Create iam-mobile-client.js for mobile IAM auth + JIT provisioning | done | 100 | `iam-mobile-client.js` created | 9/9 PASS | none | — |
| ivts-AUTH-003 | Update mobile.routes.js to use new mobile client | done | 100 | `mobile.routes.js` updated | syntax check PASS | none | — |
| ivts-AUTH-004 | Create unit tests for mobile client | done | 100 | `iam-mobile-client.test.js` created (9 tests) | 9/9 PASS | none | — |
| ivts-AUTH-005 | Document and update progress tracker | done | 100 | this file + change record + progress.md | n/a | none | — |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| `node --check iam-admin-client.js` | PASS | Exit code 0 — 2026-07-31 |
| `node --check iam-mobile-client.js` | PASS | Exit code 0 — 2026-07-31 |
| `node --check mobile.routes.js` | PASS | Exit code 0 — 2026-07-31 |
| `--test iam-admin-client.test.js` | PASS 15/15 | node:test runner — 2026-07-31 |
| `--test iam-mobile-client.test.js` | PASS 9/9 | node:test runner — 2026-07-31 |

## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| R-001 | risk | open | Google ID Token bypass in `iam-mobile-client.js` uses hard-coded Google Client ID | Should be moved to config before production | Move `config.google.clientId` lookup; disable bypass in production env |
| R-002 | risk | open | Mobile auth uses `google-bypass-token-<email>` as a fake token (not a real IAM token) | The mobile app cannot call any IAM-protected endpoints with this token | Must integrate real MFU IAM mobile flow before production |

## T6. Decision

Admin login (`forwardScopedSignin` in `iam-admin-client.js`) is now strictly for Web Admin use only. It no longer contains `isMobileClient`, Google ID Token bypass, or JIT provisioning logic. All mobile-user authentication is handled by the new `iam-mobile-client.js` via `mobile.routes.js`. The two flows are independently testable and verified.
