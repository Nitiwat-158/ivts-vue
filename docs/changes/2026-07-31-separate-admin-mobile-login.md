# Change Record: Separate Web Admin Login and User Mobile Login

| Field | Value |
|---|---|
| ID | ivts-AUTH-001..005 |
| Date | 2026-07-31 |
| Author | AI (Antigravity) |
| Reviewer | — |
| Task | `docs/tasks/2026-07-31-separate-admin-mobile-login.md` |
| Status | done |
| Release Impact | Patch — backend only; no DB migration; no frontend change |
| PDPA Impact | No new personal data fields added. `users` collection already stores `email`, `name`, `surname`, `avatar_url` (visible in UI). JIT provisioning was previously present inside `iam-admin-client.js`; no change to which fields are stored. |

---

## T1. Problem Statement

After a previous refactoring session, the Web Admin login code (`iam-admin-client.js → forwardScopedSignin`) had been merged with mobile-user login logic. The combined function contained:

- `request.isMobileClient` flag set in `mobile.routes.js` to switch behavior
- A Google ID Token bypass (OAuth2Client) for development
- JIT provisioning of users into the MongoDB `users` collection
- `[DEBUG-TEMP]` `console.log` statements throughout
- Injected `payload.role = 'admin'` into the IAM response payload

This coupled code violated the separation of concerns and made both login flows untestable independently.

---

## T2. Requirement

> "อยากให้ทำระบบ web admin login กลับไปอย่างเดิม และสร้างไฟล์ใหม่สำหรับ user mobile login ผ่านระบบ MFU IAM ให้ทำงานได้ดังเดิม"

- **Admin login**: Revert `iam-admin-client.js → forwardScopedSignin` to the original clean implementation (commit `9a255686a436b2e45edb3cdad2ccee06021138d6`).
- **Mobile login**: Create a new dedicated `iam-mobile-client.js` module with `forwardMobileSignin`, JIT provisioning, and Google token fallback.

---

## T3. Changes

### T3.1 Reverted — `iam-admin-client.js`

**File**: `backend-node/server/Project/security/service/iam-admin-client.js`

`forwardScopedSignin` (lines 815–855) has been reverted to the original:
- Calls `requestUser → POST /signin`
- If no `xAccessToken` returned: relay the IAM response as-is
- If `xAccessToken` returned: resolve account via `/auth/me`, check IVTS scope
- If **not** in scope: revoke session, return `403 account_not_in_ivts_scope`
- If in scope: relay cookie + payload

**Removed**:
- `request.isMobileClient` check
- Google ID Token bypass (`OAuth2Client`)
- JIT provisioning (`UserModel.findOne / user.save()`)
- `payload.role = 'admin'` injection
- All `[DEBUG-TEMP]` `console.log` statements

### T3.2 Created — `iam-mobile-client.js`

**File**: `backend-node/server/Project/security/service/iam-mobile-client.js` *(new)*

Public API:
| Export | Description |
|---|---|
| `forwardMobileSignin(req, res)` | Route handler for `POST /api/v1/mobile/auth/signin` |
| `jitProvisionFromIAMAccount(iamAccount, req, token)` | JIT create/update user from MFU IAM account object |
| `jitProvisionFromGoogleToken(decoded)` | JIT create/update user from verified Google ID Token claims |
| `requestIAMUser(options)` | HTTP request helper (exposed for test stubs) |

Flow:
1. POST credentials to MFU IAM `/signin`
2a. If IAM returns `xAccessToken` → resolve account → JIT provision → respond with `role: user`
2b. If no token AND `body.token` present → verify Google ID Token → JIT provision → respond with bypass token
3. Otherwise relay IAM error response

Security:
- Hijack detection: if stored `iam_user_id` ≠ resolved IAM `_id` → revoke session, return 403
- Mobile users always assigned `role: 'user'` — admin scope never checked

### T3.3 Modified — `mobile.routes.js`

**File**: `backend-node/server/Project/ivts/mobile.routes.js`

```diff
-const iamAdminClient = require('../security/service/iam-admin-client');
+const iamMobileClient = require('../security/service/iam-mobile-client');

 router.post('/auth/signin', function (request, response) {
-  request.isMobileClient = true;
-  return iamAdminClient.forwardScopedSignin(request, response);
+  return iamMobileClient.forwardMobileSignin(request, response);
 });
```

### T3.4 Created — `iam-mobile-client.test.js`

**File**: `backend-node/server/Project/security/service/iam-mobile-client.test.js` *(new)*

9 unit tests covering:
- JIT create (user does not exist)
- JIT update (user exists with stale profile)
- Hijack detection (`iam_user_id` conflict) → 403
- IAM unavailable fallback
- `role: 'user'` enforcement
- `jitProvisionFromIAMAccount` direct unit test (create)
- `jitProvisionFromIAMAccount` direct unit test (hijack)
- `jitProvisionFromGoogleToken` direct unit test (create)
- `jitProvisionFromGoogleToken` direct unit test (hijack)

---

## T4. Verification

| Check | Result |
|---|---|
| `node --check iam-admin-client.js` | ✅ PASS |
| `node --check iam-mobile-client.js` | ✅ PASS |
| `node --check mobile.routes.js` | ✅ PASS |
| `iam-admin-client.test.js` (15 tests) | ✅ 15/15 PASS |
| `iam-mobile-client.test.js` (9 tests) | ✅ 9/9 PASS |

---

## T5. Open Questions / Risks

| ID | Status | Note |
|---|---|---|
| R-001 | open | Google Client ID hard-coded in `iam-mobile-client.js`. Move to `config.google.clientId` before production. |
| R-002 | open | `google-bypass-token-<email>` is not a real IAM session token. All MFU IAM protected endpoints will reject it. This is development-only. |
| R-003 | open | `POST /api/v1/mobile/auth/signin` is currently unauthenticated (no middleware). Rate-limit / abuse protection needed before production. |

---

## T6. Rollback

Restore the old `forwardScopedSignin` blob from commit `9a255686a436b2e45edb3cdad2ccee06021138d6` (git `git show 9a255686:backend-node/server/Project/security/service/iam-admin-client.js`) and revert `mobile.routes.js` to `iamAdminClient`.
