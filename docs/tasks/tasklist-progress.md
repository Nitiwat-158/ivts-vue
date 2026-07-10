# Tasklist: IVTS System Progress And Readiness

| Field | Value |
|---|---|
| Date | 2026-07-10 |
| Project | IVTS |
| Module / Feature | system progress and readiness |
| Requirement | Track actual project system progress from source and verification evidence |
| Active Change Record | `docs/changes/2026-06-18-<project-code>-tasklist-progress.md` |
| Overall Status | in_progress |
| Overall Progress | 25% |
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
| Backend API/services verified | 35 | 0 | Not verified yet. |
| Integration/auth verified | 15 | 0 | Not verified yet. |
| Frontend route/API mapped | 20 | 20 | CCTV route mapped and page implemented. |
| Environment/static config checked | 10 | 0 | Not verified yet. |
| Release verification | 15 | 0 | Not verified yet. |
| Tasklist and handoff | 5 | 5 | CCTV tasks handoff completed. |
| **Total** | **100** | **25** | Overall progress updated with CCTV implementation. |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-SYS-001 | Map API surface | Orchestrator | AI | none | pending | 0 | not started | | | none | read route truth | source map |
| ivts-SYS-002 | Verify backend readiness | Backend | AI | ivts-SYS-001 | pending | 0 | not started | | | none | run backend tests | backend readiness evidence |
| ivts-SYS-003 | Verify frontend readiness | Frontend | AI | ivts-SYS-001 | pending | 0 | not started | | | none | run frontend verification | frontend readiness evidence |
| ivts-SYS-004 | Verify release readiness | Release/Ops | AI | ivts-SYS-002,ivts-SYS-003 | pending | 0 | not started | | | none | run smoke/e2e | release readiness evidence |
| ivts-CCTV-001 | Implement CCTV Viewer & Nav | Frontend | AI | none | done | 100 | Visual verification passed, sidebar bypass configured, handoff complete | `_nav.js`, `router/index.js`, `en.js`, `th.js`, `CCTVViewer.vue`, `TheSidebar.vue` | visual checks | none | none | CCTV page implementation |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| backend test | not run | |
| frontend lint/test/build | not run | |
| live smoke/e2e | not run | |

## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| B-001 | blocker | open | | | |
| R-001 | risk | open | | | |

## T6. Decision

Current project progress is not known until source discovery and verification are completed.

