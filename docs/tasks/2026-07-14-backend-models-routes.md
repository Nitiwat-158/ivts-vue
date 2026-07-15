# Tasklist: IVTS Backend Models, Routes & Controllers

| Field | Value |
|---|---|
| Task ID prefix | ivts-BE |
| Date | 2026-07-14 |
| Project | IVTS |
| Module / Feature | Backend models, services, and routes |
| Requirement | Mongoose schemas for 7 collections, business services, API routes under /api/v1/ivts/* |
| Active Change Record | `docs/changes/2026-07-14-backend-models-routes.md` |
| Overall Status | verifying |
| Overall Progress | 80% |
| Progress Type | Evidence-backed — discovery + implementation gates completed, T16 syntax verified |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| Route mount truth | `backend-node/server/routes/app.routes.js` — `/api/v1/ivts` confirmed |
| Module pattern | `server/Project/ivts/ivts.routes.js`, `models/ivts_document.model.js`, `service/ivts_document.js` |
| Auth pattern | `server/Project/accounts/service/account.js` → `account.onCheckAuthorization` |
| Permission pattern | `server/Project/security/service/authorization.js` → `authorization.requirePermission(path, action)` |
| IAM guardrail | `server/integrations/iam/b2b-auth-middleware.js` — no passwords in MongoDB |
| DB connect | `helpers/initialize.js` — `cfg.mongoURI` |
| Response envelope | `ivts.routes.js` — `{ code: 20000, message: 'Success', data: ... }` |

## T2. Progress Calculation

| Gate | Weight | Earned | Basis |
|---|---:|---:|---|
| Discovery evidence | 20 | 20 | T1-T4 source evidence recorded above |
| Implementation | 30 | 30 | 7 models + 4 services + routes file written |
| Tests / smoke evidence | 30 | 20 | `node --check` passed all 12 files; live DB test pending |
| PRD / docs decision | 10 | 5 | Tasklist written; PRD update pending |
| T1-T20 handoff | 10 | 5 | Change record drafted |
| **Total** | **100** | **80** | |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-BE-001 | Create 7 Mongoose models | Backend | AI | none | done | 100 | 7 files created, node --check passed | `ivts_document.model.js` pattern | `node --check` all OK | none | — | model files |
| ivts-BE-002 | Create vehicle_request service | Backend | AI | ivts-BE-001 | done | 100 | File created, syntax OK | `ivts_document.js` pattern | `node --check` OK | none | — | `service/vehicle_request.js` |
| ivts-BE-003 | Create cctv service | Backend | AI | ivts-BE-001 | done | 100 | File created, syntax OK | env MEDIAMTX_BASE_URL | `node --check` OK | none | — | `service/cctv.js` |
| ivts-BE-004 | Create vehicle service | Backend | AI | ivts-BE-001 | done | 100 | File created, syntax OK | `ivts_document.js` pattern | `node --check` OK | none | — | `service/vehicle.js` |
| ivts-BE-005 | Create tracking service | Backend | AI | ivts-BE-001 | done | 100 | File created, syntax OK | `ivts_document.js` pattern | `node --check` OK | none | — | `service/tracking.js` |
| ivts-BE-006 | Update ivts.routes.js | Backend | AI | ivts-BE-002..005 | done | 100 | 10 new routes added, syntax OK | `ivts.routes.js` existing pattern | `node --check` OK | none | — | updated routes file |
| ivts-BE-007 | Live smoke test | Backend | Dev | ivts-BE-006 | pending | 0 | Not run — DB required | — | not run | requires running server + DB | POST /requests/submit, GET /cctvs/:id | smoke evidence |
| ivts-BE-008 | Seed permission paths in IAM | Ops | Dev | ivts-BE-006 | pending | 0 | Not started | — | not run | IAM seed required | Seed /ivts/requests, /ivts/vehicles, /ivts/cctvs, /ivts/tracking | IAM permission records |
| ivts-BE-009 | Update PRD | Product Owner | Dev | ivts-BE-006 | pending | 0 | Not started | — | — | none | Update PRD-ivts.md with new collections and API surface | PRD update |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| `node --check` all 12 new files | PASS | All returned exit code 0 |
| `npm test` (live) | not run | requires running server + DB |
| POST /api/v1/ivts/requests/submit smoke | not run | requires running server |
| PUT /api/v1/ivts/requests/:id/review smoke | not run | requires running server |
| GET /api/v1/ivts/cctvs/:id stream URLs | not run | requires running server |

## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| B-001 | blocker | open | IAM permission paths /ivts/requests, /ivts/vehicles, /ivts/cctvs, /ivts/tracking must be seeded in IAM before routes are accessible | All new routes return 403 until seeded | Dev/Ops: seed permission paths |
| R-001 | risk | open | Vehicle _id in DB may be ObjectId or Number — model uses default ObjectId; confirm with existing data | Id type mismatch could break queries | Dev: inspect existing vehicles collection |
| R-002 | risk | open | MEDIAMTX_BASE_URL env var must be set for stream URL generation | Stream URLs fall back to localhost:8888 | Ops: set MEDIAMTX_BASE_URL in .env |

## T6. Open Questions / Assumptions

| ID | Type | Description | Owner |
|---|---|---|---|
| A-001 | Assumption | request.body.accounts holds the logged-in user's internal ID (following existing auth pattern) | Dev |
| A-002 | Assumption | Vehicle and TrackingLog numeric _id values are auto-assigned by MongoDB (not managed here) | Dev |
| OQ-001 | Open Question | Where are uploaded document binary files stored? (MinIO, S3, local?) | Product |
| OQ-002 | Open Question | PDPA retention policy for requests, owner_vehicles, tracking_logs? | Compliance |
