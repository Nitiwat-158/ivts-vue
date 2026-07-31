# Task: Mobile App Google OAuth Migration & Backend JIT Creation

**Date**: 2026-07-29
**Topic**: mobile-google-oauth-jit
**Owner**: AI / Dev

## 1. Goal
Migrate the mobile application's login flow to use Google OAuth (MFU Lamduan) via `google_sign_in` rather than raw email/password, matching the web frontend's approach. Additionally, implement Just-In-Time (JIT) user auto-creation in the backend Proxy (`iam-admin-client.js`) so that first-time MFU students using the mobile app have their `users` collection document created automatically.

## 2. Requirement Changes / API Updates
- The `/api/v1/mobile/auth/signin` route remains unchanged, but its payload expectations align with the web frontend (`token` and `authType` instead of `email` and `password`).
- Backend fallback logic (`forwardScopedSignin`) now creates a MongoDB `users` document using the IAM profile if it doesn't already exist.

## 3. Task Checklist

- [x] **BE-JIT**: Add JIT auto-creation logic to `iam-admin-client.js` in the `request.isMobileClient` block.
- [x] **Verify**: Syntax checked `node --check server/Project/security/service/iam-admin-client.js`.
- [ ] **FE-Config**: Add `google_sign_in` to `pubspec.yaml`.
- [ ] **FE-Auth**: Refactor `sign_in_screen.dart` to use Google SignIn and send `token`.
- [ ] **Docs**: Update `tasklist-progress.md` and render HTML.

## 4. Blockers & Assumptions
- **Assumption**: The frontend's `authType: "689c06d5255db4e56aea8902"` is correct for production as well (borrowed from `SignIn.vue`).
- **Blocker**: User must configure Google Cloud Console OAuth Client IDs (Web/Android/iOS) for the `google_sign_in` plugin to work correctly on the mobile device.

## 5. Next Actions
- Update the Flutter codebase to integrate `google_sign_in`.
- Run Flutter application to verify Google OAuth flow.
