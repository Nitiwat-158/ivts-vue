# Tasklist: Drop Stale iam_user_id_1 MongoDB Index for User Registration

| Field | Value |
|---|---|
| Task ID | ivts-FIX-001 |
| Task | Drop stale iam_user_id_1 unique index from MongoDB users collection to fix E11000 duplicate key error during local user registration |
| Agent | Backend |
| Owner | AI |
| Depends On | none |
| Status | done |
| Progress % | 100% |
| Progress Basis | Gate 1-5 complete: Source discovery done, script `drop-stale-user-index.js` created and executed, `initialize.js` updated to auto-drop index on DB connect, unit tests 4/4 PASS, system progress updated, T1-T20 change doc created |
| Source Evidence | `backend-node/server/Project/ivts/models/user.model.js`, `backend-node/server/Project/security/service/iam-mobile-client.js`, `backend-node/helpers/initialize.js`, `backend-node/scripts/drop-stale-user-index.js` |
| Tests Evidence | `node scripts/drop-stale-user-index.js` PASS, `node --check` PASS, `node --test` 4/4 PASS |
| Blocker | none |
| Next Action | — |
| Output | Script `scripts/drop-stale-user-index.js`, updated `initialize.js`, executed cleanup, updated docs |

## Subtasks

| Subtask ID | Description | Status | Evidence |
|---|---|---|---|
| ivts-FIX-001-A | Source Discovery & Root Cause Analysis | done | Identified index `iam_user_id_1` leftover from previous schema in MongoDB collection `users` |
| ivts-FIX-001-B | Create cleanup script `backend-node/scripts/drop-stale-user-index.js` | done | Script created and executed successfully |
| ivts-FIX-001-C | Update `backend-node/helpers/initialize.js` to safely drop stale `iam_user_id_1` index on MongoDB connect | done | `initialize.js` updated to auto-drop stale index when DB opens |
| ivts-FIX-001-D | Run cleanup script & verify unit tests | done | `node --test server/Project/security/service/iam-mobile-client-local.test.js` (4/4 PASS) |
| ivts-FIX-001-E | Update system progress tasklist & regenerate HTML | done | `tasklist-progress.md` updated, `render-tasklist-progress-html.js` executed |
| ivts-FIX-001-F | Create T1-T20 Change Document | done | `docs/changes/2026-08-05-drop-stale-user-index.md` created |
