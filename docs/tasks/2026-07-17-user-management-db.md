# Tasklist: IVTS User Management Database Integration

| Field | Value |
|---|---|
| Task ID prefix | ivts-UM |
| Date | 2026-07-17 |
| Project | IVTS |
| Module / Feature | User Management Database Integration |
| Requirement | Pull User accounts from MongoDB User collection in the dashboard |
| Active Change Record | `docs/changes/2026-07-17-user-management-db.md` |
| Overall Status | discovery |
| Overall Progress | 20% |
| Progress Type | Evidence-backed — discovery gate completed |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| User Model | `backend-node/server/Project/ivts/models/user.model.js` |
| API Endpoint | `backend-node/server/Project/accounts/accounts.routes.js` |
| Proxy Handler | `backend-node/server/Project/security/service/iam-admin-client.js` |
| Frontend Store | `frontend-vue/src/store/modules/Accounts/index.js` |

## T2. Progress Calculation

| Gate | Weight | Earned | Basis |
|---|---:|---:|---|
| Discovery evidence | 20 | 20 | T1 source evidence recorded |
| Implementation | 30 | 0 | Pending backend integration |
| Tests / smoke evidence | 30 | 0 | Pending verification tests |
| PRD / docs decision | 10 | 0 | Pending docs/PRD review |
| T1-T20 handoff | 10 | 0 | Pending change note compilation |
| **Total** | **100** | **20** | |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-UM-001 | Source Discovery | Backend | AI | none | done | 100 | Code files and database model identified | [iam-admin-client.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/security/service/iam-admin-client.js) | — | none | — | Tasklist created |
| ivts-UM-002 | Modify forwardAccountsList | Backend | AI | ivts-UM-001 | pending | 0 | Not started | [user.model.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/models/user.model.js) | — | none | Update `forwardAccountsList` logic to query local database | Modified code |
| ivts-UM-003 | Run test:all | Backend | AI | ivts-UM-002 | pending | 0 | Not started | `package.json` | — | none | Run npm test suite | Test output |
| ivts-UM-004 | Update tasklist progress | Ops | AI | ivts-UM-003 | pending | 0 | Not started | `docs/tasks/tasklist-progress.md` | — | none | Run node scripts/render-tasklist-progress-html.js . | HTML output |
| ivts-UM-005 | Create change record T1-T20 | Ops | AI | ivts-UM-004 | pending | 0 | Not started | `docs/changes/2026-07-17-user-management-db.md` | — | none | Save change note | T1-T20 Markdown file |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| Run backend test suite | not run | Pending implementation |
| Verify screen renders 2 accounts | not run | Pending launch and check |

## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| none | — | — | — | — | — |

## T6. Open Questions / Assumptions

| ID | Type | Description | Owner |
|---|---|---|---|
| none | — | — | — |
