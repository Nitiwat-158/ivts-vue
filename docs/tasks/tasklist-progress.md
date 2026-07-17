# Tasklist: IVTS System Progress And Readiness

| Field | Value |
|---|---|
| Date | 2026-07-14 |
| Project | IVTS |
| Module / Feature | system progress and readiness |
| Requirement | Track actual project system progress from source and verification evidence |
| Active Change Record | `docs/changes/2026-07-14-backend-models-routes.md` |
| Overall Status | in_progress |
| Overall Progress | 45% |
| Progress Type | Evidence-backed readiness score, not final product completion |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| API mount points | `backend-node/server/routes/app.routes.js` |
| Backend scripts | `backend-node/package.json` |
| Frontend routes | `frontend-vue/src/router/index.js` |
| Frontend API client | `frontend-vue/src/service/api.js` |
| Docs control | `docs/AI-WORKFLOW.md`, `docs/AI-DOCS-INDEX.md`, `docs/tasks/README.md`, `docs/templates/T1-T20-change-document.md` |
| Module docs | `docs/modules/*` when present |
| Environment config | static key check only; do not document secret values |

## T2. Progress Calculation

Adjust weights per project, but keep them evidence-backed.

| Readiness Area | Weight | Earned | Basis |
|---|---:|---:|---|
| Backend API/services verified | 35 | 20 | 7 Mongoose models + 4 services + 10 routes written; node --check passed; live DB smoke pending. |
| Integration/auth verified | 15 | 0 | Not verified yet. |
| Frontend route/API mapped | 20 | 20 | CCTV route mapped and page implemented. |
| Environment/static config checked | 10 | 0 | Not verified yet. |
| Release verification | 15 | 0 | Not verified yet. |
| Tasklist and handoff | 5 | 5 | CCTV tasks + backend models/routes handoff completed. |
| **Total** | **100** | **45** | Backend implementation gate completed; live smoke + IAM seed pending. |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-SYS-001 | Map API surface | Orchestrator | AI | none | done | 100 | routes and module structure mapped | `app.routes.js`, `ivts.routes.js` | n/a | none | — | source map |
| ivts-SYS-002 | Verify backend readiness | Backend | AI | ivts-SYS-001 | in_progress | 50 | models+routes written; live smoke pending | all model/service/route files | `node --check` PASS | B-001 IAM seed | run live smoke; seed IAM permissions | backend readiness evidence |
| ivts-SYS-003 | Verify frontend readiness | Frontend | AI | ivts-SYS-001 | pending | 0 | not started | | | none | run frontend verification | frontend readiness evidence |
| ivts-SYS-004 | Verify release readiness | Release/Ops | AI | ivts-SYS-002,ivts-SYS-003 | pending | 0 | not started | | | none | run smoke/e2e | release readiness evidence |
| ivts-CCTV-001 | Implement CCTV Viewer & Nav | Frontend | AI | none | done | 100 | Visual verification passed, sidebar bypass configured, handoff complete | `_nav.js`, `router/index.js`, `en.js`, `th.js`, `CCTVViewer.vue`, `TheSidebar.vue` | visual checks | none | none | CCTV page implementation |
| ivts-BE-001 | Create 7 Mongoose models | Backend | AI | none | done | 100 | node --check all 7 model files | model files in server/Project/ivts/models/ | node --check PASS | none | — | 7 model files |
| ivts-BE-002 | Create vehicle_request service | Backend | AI | ivts-BE-001 | done | 100 | node --check | `service/vehicle_request.js` | node --check PASS | none | — | service file |
| ivts-BE-003 | Create cctv service | Backend | AI | ivts-BE-001 | done | 100 | node --check | `service/cctv.js` | node --check PASS | none | — | service file |
| ivts-BE-004 | Create vehicle service | Backend | AI | ivts-BE-001 | done | 100 | node --check | `service/vehicle.js` | node --check PASS | none | — | service file |
| ivts-BE-005 | Create tracking service | Backend | AI | ivts-BE-001 | done | 100 | node --check | `service/tracking.js` | node --check PASS | none | — | service file |
| ivts-BE-006 | Update ivts.routes.js | Backend | AI | ivts-BE-002..005 | done | 100 | 10 routes added; node --check | `ivts.routes.js` | node --check PASS | none | — | updated routes file |
| ivts-BE-007 | Live smoke test | Backend | Dev | ivts-BE-006 | pending | 0 | not run | — | not run | B-001 IAM seed required | POST /requests/submit, GET /cctvs/:id | smoke evidence |
| ivts-BE-008 | Seed IAM permission paths | Ops | Dev | ivts-BE-006 | pending | 0 | not started | — | not run | requires IAM admin access | Seed /ivts/requests, /ivts/vehicles, /ivts/cctvs, /ivts/tracking | IAM permission records |
| ivts-BE-009 | Update PRD-ivts.md | Product | Dev | ivts-BE-006 | pending | 0 | not started | — | — | none | Update PRD with new collections and API surface | PRD update |
| ivts-UM-001 | Source Discovery | Backend | AI | none | done | 100 | Code files and database model identified | [iam-admin-client.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/security/service/iam-admin-client.js) | — | none | — | Tasklist created |
| ivts-UM-002 | Modify forwardAccountsList | Backend | AI | ivts-UM-001 | pending | 0 | Not started | [user.model.js](file:///g:/MFU/Project/ivts-vue/ivts-vue/backend-node/server/Project/ivts/models/user.model.js) | — | none | Update forwardAccountsList logic to query local database | Modified code |
| ivts-UM-003 | Run test:all | Backend | AI | ivts-UM-002 | pending | 0 | Not started | package.json | — | none | Run npm test suite | Test output |
| ivts-UM-004 | Update tasklist progress | Ops | AI | ivts-UM-003 | pending | 0 | Not started | docs/tasks/tasklist-progress.md | — | none | Run node scripts/render-tasklist-progress-html.js . | HTML output |
| ivts-UM-005 | Create change record T1-T20 | Ops | AI | ivts-UM-004 | pending | 0 | Not started | docs/changes/2026-07-17-user-management-db.md | — | none | Save change note | T1-T20 Markdown file |


## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| `node --check` all 12 new backend files | PASS | Exit code 0 — 2026-07-14 |
| backend npm test | not run | requires running server + DB |
| frontend lint/test/build | not run | |
| live smoke/e2e | not run | |

## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| B-001 | blocker | open | IAM permission paths /ivts/requests, /ivts/vehicles, /ivts/cctvs, /ivts/tracking not yet seeded | All new routes return 403 until seeded | Dev/Ops: seed permission paths in IAM |
| R-001 | risk | open | Vehicle _id type (ObjectId vs Number) — confirm with existing DB data | Id type mismatch on queries | Dev: inspect existing vehicles collection |
| R-002 | risk | open | MEDIAMTX_BASE_URL env var not confirmed set | Stream URLs fall back to localhost | Ops: set MEDIAMTX_BASE_URL in .env files |

## T6. Decision

Backend models, services, and routes are implemented and syntax-verified. System progress updated from 25% to 45% based on implementation gate completion. Live smoke tests blocked by IAM permission seeding requirement (B-001).
