# T1-T20 Change Document: User Model user_id Schema Refactor & Mobile App Compatibility

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-MODEL-001 |
| Module | backend-node & user-mobile-application |
| Date | 2026-08-04 |
| Owner / Agent | AI / Backend & Mobile |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-04-user-model-user-id-refactor.md` |

## T2 Requirement

- User request: แก้ไขข้อผิดพลาด `document must have an _id before saving` เมื่อลงทะเบียนในแอปมือถือ และปรับแก้โค้ดใน `user-mobile-application` ให้สอดคล้องกับ `user_id`
- Business goal: ทำให้การสมัครสมาชิก/เข้าสู่ระบบบนแอปมือถือบันทึกลง MongoDB ได้ถูกต้อง ไม่ติด Error Mongoose `_id` และรับส่งข้อมูลด้วย `user_id`
- Success outcome: สมัครสมาชิกได้สำเร็จ, `user.model.js` และ `iam-mobile-client.js` กำหนด `_id` และ `user_id` ถูกต้อง, Flutter app ผ่าน `flutter analyze` 100%

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| User Model | `backend-node/server/Project/ivts/models/user.model.js` | Defined `_id: { type: String }` and `user_id: { type: String, required: true }`, removed `_id: false` option |
| Mobile Auth Client | `backend-node/server/Project/security/service/iam-mobile-client.js` | Populated both `_id` and `user_id` when constructing UserModel instances |
| Mobile Flutter Service | `user-mobile-application/lib/services/mobile_api_service.dart` | Updated `queryParameters` to pass `user_id` alongside `users_id` |
| Mobile Registration Screen | `user-mobile-application/lib/screens/add_vehicle_screen.dart` | Updated payload to include `user_id` |
| Automated Tests | `node --test`, `flutter analyze lib/` | All node tests pass (10/10), Flutter analyze passes with 0 issues |

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Task tracking & gate verification |
| Data Model | yes | Schema modification in `user.model.js` |
| Backend | yes | Updated service code and query logic |
| Frontend / Mobile | yes | Updated Flutter API service and payload structures |
| QA/UAT | yes | Verified unit tests & flutter analyze |

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/server/Project/ivts/models/user.model.js` | Defined `_id: { type: String }`, `user_id: { type: String, required: true }`, removed `_id: false` option |
| `backend-node/server/Project/security/service/iam-mobile-client.js` | Set `_id` and `user_id` on UserModel instances and returned account objects |
| `user-mobile-application/lib/services/mobile_api_service.dart` | Updated `queryParameters` to include both `user_id` and `users_id` |
| `user-mobile-application/lib/screens/add_vehicle_screen.dart` | Included `user_id` in `createRequest` payload |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `node --check server/Project/ivts/models/user.model.js server/Project/security/service/iam-mobile-client.js` | PASS | Exit code 0, clean syntax check |
| `node --test server/Project/security/service/iam-mobile-client.test.js server/Project/security/service/iam-mobile-client-local.test.js` | PASS | 10/10 unit tests pass |
| `flutter analyze lib/` | PASS | "No issues found! (ran in 2.1s)" |

## T20 Final Handoff

```txt
Feature: User Model user_id Schema Refactor & Mobile App Compatibility
Status: Done
Active tasklist: docs/tasks/2026-08-04-user-model-user-id-refactor.md
Task IDs: ivts-MODEL-001
Progress: 100%
Changed files: user.model.js, iam-mobile-client.js, mobile_api_service.dart, add_vehicle_screen.dart
Tests run: node --test PASS (10/10), flutter analyze PASS (0 issues)
PRD/docs: Updated tasklist-progress.md, AI-DOCS-INDEX.md, change document updated
Open risks: none
Next owner: —
```
