# Change Record: Mobile Google OAuth & JIT Creation

**Date**: 2026-07-29
**Topic**: mobile-google-oauth-jit
**Owner**: AI / Dev
**Status**: in_progress

## T7. Motivation
The mobile application needs to transition from email/password authentication to Google OAuth (via `google_sign_in`) to match the MFU Lamduan identity setup on the web frontend. Furthermore, new mobile users logging in for the first time via IAM need an automated way to have their `UserModel` document created in the database without manual admin intervention.

## T8. Details of Change
- **Backend (`iam-admin-client.js`)**: Updated `forwardScopedSignin` to include Just-In-Time (JIT) user creation. When a mobile client request passes IAM authentication but the user is not found in the `users` MongoDB collection, the system automatically provisions a new `UserModel` document with their `iam_user_id`, `email`, `firstName`, and `lastName` (mapped to `name` and `surname`), setting their default role to `'user'`.
- **Task Tracking**: Added task tracking records `docs/tasks/2026-07-29-mobile-google-oauth-jit.md` and updated `tasklist-progress.md` with new `ivts-MOBAPI-005` and `ivts-MOBAPI-006` entries.

## T9. Expected Impact
- MFU students using their Lamduan accounts will successfully authenticate via Google OAuth in the mobile app.
- Upon successful authentication, they will be seamlessly provisioned a local user document without seeing "Data not found" (404) or "Account not in IVTS scope" (403) errors.

## T10. Next Actions
- Proceed to update the Flutter codebase (`pubspec.yaml`, `sign_in_screen.dart`) to integrate the `google_sign_in` plugin, capture the `idToken`, and pass it to the backend `signin` endpoint.
