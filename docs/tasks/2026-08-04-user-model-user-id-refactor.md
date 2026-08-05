# Tasklist: User Model user_id Schema Refactor & Mobile Compatibility

| Field | Value |
|---|---|
| Task ID | ivts-MODEL-001 |
| Task | Refactor user.model.js schema: set _id + user_id, remove users_id & iam_user_id; update backend & Flutter mobile app |
| Agent | Backend / Mobile |
| Owner | AI |
| Depends On | none |
| Status | done |
| Progress % | 100% |
| Progress Basis | Gate 1-5 complete: Source discovery, schema refactor, backend services update, mobile app update (`mobile_api_service.dart`, `add_vehicle_screen.dart`), 10/10 node tests PASS, flutter analyze PASS |
| Source Evidence | `backend-node/server/Project/ivts/models/user.model.js`, `backend-node/server/Project/security/service/iam-mobile-client.js`, `user-mobile-application/lib/services/mobile_api_service.dart`, `user-mobile-application/lib/screens/add_vehicle_screen.dart` |
| Tests Evidence | `node --check` PASS, `node --test` PASS (10/10), `flutter analyze lib/` PASS (No issues found) |
| Blocker | none |
| Next Action | — |
| Output | Refactored user.model.js schema, fixed Mongoose _id save error, updated Flutter mobile app data parameters |

## Subtasks

| Subtask ID | Description | Status | Evidence |
|---|---|---|---|
| ivts-MODEL-001-A | Source Discovery & Codebase Grep | done | Mapped user.model.js, iam-mobile-client.js, users.js, emergency_report.js, seed-owner-vehicles.js, mobile_api_service.dart, add_vehicle_screen.dart |
| ivts-MODEL-001-B | Refactor `user.model.js` schema (define `_id: { type: String }` and `user_id: { type: String, required: true }`; remove `_id: false` option) | done | `user.model.js` updated; resolves `document must have an _id before saving` error |
| ivts-MODEL-001-C | Update `iam-mobile-client.js` to set `_id` and `user_id` when creating documents | done | `iam-mobile-client.js` updated |
| ivts-MODEL-001-D | Update `user-mobile-application` Flutter API client & request screens | done | `mobile_api_service.dart` & `add_vehicle_screen.dart` updated to pass `user_id` and `users_id` |
| ivts-MODEL-001-E | Run automated tests | done | `node --test` 10/10 PASS; `flutter analyze lib/` PASS |
| ivts-MODEL-001-F | Update system progress tasklist & regenerate HTML | done | `tasklist-progress.md` updated, `render-tasklist-progress-html.js` executed |
| ivts-MODEL-001-G | Update T1-T20 Change Document | done | `docs/changes/2026-08-04-user-model-user-id-refactor.md` updated |
