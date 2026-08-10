# T1-T20 Change Document: Emergency Report Accept Permission and Feedback

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | `chg-2026-08-09-emergency-report-accept-permission` |
| Module | IVTS Emergency Report Management (`ivts.routes.js`, `authorization.js`, `EmergencyReportManagement.vue`) |
| Date | 2026-08-09 |
| Owner / Agent | AI Backend + Frontend Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-09-emergency-report-accept-permission.md` |

## T2 Requirement

- Make the Accept action in Emergency Report Management fail with a clear reason instead of silently doing nothing.
- Ensure the backend permission path is explicit and logs denied requests for faster diagnosis.
- Remove the hardcoded admin id from the frontend and surface 401/403/other errors to the user.
- Prevent duplicate Accept requests while one is in progress.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route guard | `backend-node/server/Project/ivts/ivts.routes.js` | `PUT /emergency-reports/:id/status` uses report-specific manage permission |
| Backend denial logging | `backend-node/server/Project/security/service/authorization.js` | Denied requests now log account id, requested paths, and permission summary |
| Permission bootstrap | `backend-node/config/config.js`, `backend-node/config/project.config.js`, `backend-node/scripts/bootstrap-ivts-permissions.js` | Explicit `/ivts/emergency-reports` path added to default permission lists |
| Frontend accept flow | `frontend-vue/src/projects/views/operations/EmergencyReportManagement.vue` | Accept uses auth-backed admin id, loading state, and toasts |
| Static validation | workspace error check | No errors found for modified files |

## T4 Current Behavior

- Previous: Accept could fail via authorization or request issues with only a console error, so the user saw no visible feedback.
- New: The Accept flow uses one atomic backend update for status + assignee, the UI first trusts the PUT response and then verifies the refreshed state with a short retry window, and the UI shows a toast for 401/403/409/other failures while preventing duplicate clicks.

## T6 Scope

In scope:
- `backend-node/server/Project/ivts/ivts.routes.js`
- `backend-node/server/Project/security/service/authorization.js`
- `backend-node/config/config.js`
- `backend-node/config/project.config.js`
- `backend-node/scripts/bootstrap-ivts-permissions.js`
- `frontend-vue/src/projects/views/operations/EmergencyReportManagement.vue`

Out of scope:
- Emergency report data model and list rendering logic

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/server/Project/ivts/ivts.routes.js` | Switched the manage guard for emergency reports to report-specific paths and attached a custom denial message |
| `backend-node/server/Project/ivts/service/emergency_report.js` | Changed status updates to atomic `findOneAndUpdate`, added pre/post logging, and return 409 on accept conflicts |
| `backend-node/server/Project/security/service/authorization.js` | Added permission-denied logging with account id, required paths, and permission summary; supports custom deny messages |
| `backend-node/config/config.js` | Added `/ivts/emergency-reports` to default permission paths |
| `backend-node/config/project.config.js` | Added `/ivts/emergency-reports` to default permission paths |
| `backend-node/scripts/bootstrap-ivts-permissions.js` | Added `/ivts/emergency-reports` to bootstrap menu/permission seeds |
| `frontend-vue/src/projects/views/operations/EmergencyReportManagement.vue` | Uses auth-backed admin id, disables Accept during loading, shows spinner, updates from PUT response, and verifies backend state before settling the UI |

## T16 Tests Run / Evidence

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Workspace error check for modified backend and frontend files | PASS | No errors found |
| `node:test` regression suite for emergency report updateStatus | PASS | Atomic update and concurrent conflict tests pass |
| `npm --prefix frontend-vue run lint -- src/projects/views/operations/EmergencyReportManagement.vue` | PASS | No lint errors found |

## T17 PRD / Docs Update

- Updated `docs/prd/PRD-IVTS.md` to note that emergency report management uses explicit report-management permission paths and should surface authorization failures clearly.
- Updated `docs/AI-DOCS-INDEX.md` to include this task/change record.
- Updated `docs/tasks/tasklist-progress.md` and regenerated `docs/tasks/tasklist-progress.html`.

## T20 Final Handoff

Emergency report Accept now has explicit permission handling, visible user feedback on denial, and loading protection against duplicate submissions.
