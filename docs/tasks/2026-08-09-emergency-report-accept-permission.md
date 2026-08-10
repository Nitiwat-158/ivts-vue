# Active Tasklist: Emergency Report Accept Permission and Feedback

| Field | Value |
|---|---|
| Date | 2026-08-09 |
| Project | IVTS |
| Topic | Fix Emergency Report Management Accept action permission mismatch and frontend feedback |
| Target Files | `backend-node/server/Project/ivts/ivts.routes.js`, `backend-node/server/Project/security/service/authorization.js`, `backend-node/config/config.js`, `backend-node/config/project.config.js`, `backend-node/scripts/bootstrap-ivts-permissions.js`, `frontend-vue/src/projects/views/operations/EmergencyReportManagement.vue` |
| Active Change Record | `docs/changes/2026-08-09-emergency-report-accept-permission.md` |
| Status | done |
| Progress % | 100% |

## Source Evidence
- `backend-node/server/Project/ivts/ivts.routes.js` (`PUT /emergency-reports/:id/status` manage guard)
- `backend-node/server/Project/security/service/authorization.js` (permission evaluation / deny path)
- `backend-node/config/config.js`, `backend-node/config/project.config.js` (default permission paths)
- `backend-node/scripts/bootstrap-ivts-permissions.js` (permission bootstrap paths)
- `frontend-vue/src/projects/views/operations/EmergencyReportManagement.vue` (acceptCase UI flow)

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|---|
| ivts-ERM-001 | Verify permission mismatch root cause | Backend/Frontend | AI | none | done | 100 | Reviewed route guard, bootstrap paths, and auth session source | route, config, bootstrap, auth store | source inspection complete | none | — | Root cause evidence |
| ivts-ERM-002 | Update backend permission guard and logging | Backend | AI | ivts-ERM-001 | done | 100 | Manage guard aligned to report-specific paths; deny logging added | `ivts.routes.js`, `authorization.js` | error-free via workspace error check | none | — | Better backend denial diagnostics |
| ivts-ERM-003 | Make accept atomic and verifiable | Backend/Frontend | AI | ivts-ERM-001 | done | 100 | Accept now writes status and assignee in one update, returns updated state, and frontend verifies the backend result before settling the UI | `emergency_report.js`, `EmergencyReportManagement.vue` | node:test regression PASS; frontend lint PASS | none | — | No more status bounce from stale refresh |
| ivts-ERM-004 | Improve accept feedback and loading state | Frontend | AI | ivts-ERM-001 | done | 100 | Accept action now uses auth-backed admin id, loading state, toasts, and delayed verification | `EmergencyReportManagement.vue` | workspace error check PASS | none | — | User-visible error handling |
| ivts-ERM-005 | Update permissions bootstrap/config docs | Ops | AI | ivts-ERM-002 | done | 100 | Permission path lists include explicit emergency-report manage path | `config.js`, `project.config.js`, `bootstrap-ivts-permissions.js` | workspace error check PASS | none | — | Permission config alignment |
| ivts-ERM-006 | Document change and progress | Ops | AI | ivts-ERM-005 | done | 100 | Tasklist, change record, PRD note, index, progress updated | docs files | HTML progress regenerated | none | — | T1-T20 handoff |

## Verification Cases

| Case ID | Scenario | Expected |
|---|---|---|
| VC-001 | Authorized admin clicks Accept | Status and assignee change together and UI keeps the confirmed state |
| VC-002 | Unauthorized admin clicks Accept | User sees a 403 toast explaining no permission |
| VC-003 | Double click during loading | Second request is blocked while loading |
