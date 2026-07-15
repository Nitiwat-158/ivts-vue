# T1-T20 Change Document: IVTS Backend Models, Routes & Controllers

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-BE-2026-07-14 |
| Module | backend-node / server/Project/ivts |
| Date | 2026-07-14 |
| Owner / Agent | AI Senior Backend Developer |
| Status | In Progress |
| Active Tasklist | `docs/tasks/2026-07-14-backend-models-routes.md` |

## T2 Requirement

- **User request**: Implement full Mongoose model, service, and route layer for the IVTS vehicle tracking system backend.
- **Business goal**: Enable vehicle registration requests, admin approval with automatic 1-year validity, MediaMTX CCTV stream URL generation, vehicle queries, and tracking log/history access.
- **Success outcome**: All 7 collections have Mongoose schemas; all 4 domain services implement business logic; 10 new API routes are registered under `/api/v1/ivts/*`; syntax checks pass.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route truth | `backend-node/server/routes/app.routes.js` | `/api/v1/ivts` mount confirmed |
| Backend module pattern | `server/Project/ivts/ivts.routes.js` | Route structure, ok()/fail() helpers, permission guard pattern |
| Model pattern | `server/Project/ivts/models/ivts_document.model.js` | Schema declaration, `mongoose.model(name, schema, collection)` |
| Service pattern | `server/Project/ivts/service/ivts_document.js` | Pagination, filter, error throwing, lean() |
| Auth middleware | `server/Project/accounts/service/account.js` | `account.onCheckAuthorization` |
| Permission service | `server/Project/security/service/authorization.js` | `requirePermission(path, action)` |
| IAM guardrail | `server/integrations/iam/b2b-auth-middleware.js` | No passwords in MongoDB confirmed |
| DB connection | `helpers/initialize.js` | `cfg.mongoURI` |
| Privacy / PDPA | citizen_id in owner_vehicles & requests | Permission-gated; no PII in error messages |
| Tests | `node --check` all 12 files | Syntax OK — exit code 0 |

## T4 Current Behavior (Before This Change)

- Backend had no Mongoose schemas for vehicles, requests, CCTVs, or tracking collections.
- `/api/v1/ivts/*` served only IVTS Document (partnership agreement) routes.
- No vehicle registration workflow existed in backend code.
- No MediaMTX stream URL generation existed.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | no | Single-domain backend change |
| Product Owner | yes | PRD update required for new API surface |
| Data Model | yes | 7 new collection schemas implemented |
| Backend | yes | Primary agent |
| Frontend | yes | New routes become available for frontend integration |
| Security IAM | yes | 4 new permission paths must be seeded in IAM |
| QA/UAT | yes | Live smoke tests needed |
| Release/Ops | yes | `MEDIAMTX_BASE_URL` env var must be set |

## T6 Scope

In scope:
- Mongoose schemas for all 7 specified collections
- Business service for request submission (priority_order resolution) and admin review (auto-approval + vehicle/owner sync)
- CCTV service with dynamic MediaMTX stream URL generation
- Vehicle and tracking query services
- Route registration under `/api/v1/ivts/*`

Out of scope:
- File/binary upload handling (document URLs stored only)
- PDPA retention/export automation
- Frontend integration
- IAM permission seeding (needs Ops)
- Payment tracking

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-BE-001 | User submits vehicle registration/renewal request with documents | Authenticated user | Must |
| FR-BE-002 | System determines first_car vs subsequent_car automatically | System | Must |
| FR-BE-003 | Admin approves/rejects request | Admin | Must |
| FR-BE-004 | On approval: set start_date=now, expiry_date=now+1yr | System | Must |
| FR-BE-005 | On approval: upsert Vehicle and OwnerVehicle records | System | Must |
| FR-BE-006 | CCTV list and detail return dynamic WebRTC/HLS/RTSP stream URLs | System | Must |
| FR-BE-007 | Vehicle list and detail queries with pagination | User/Admin | Must |
| FR-BE-008 | Tracking log and history queries with date-range filters | Admin | Must |

Privacy / PDPA requirements:
- Personal data displayed: name, surname, citizen_id (in owner_vehicles, requests)
- Personal data hidden: none visible in error messages or logs
- Personal data stored or changed: citizen_id, name, surname in owner_vehicles and requests.owner_info
- Data export/download behavior: not implemented at this stage
- Production data-minimization decision: open — PDPA retention policy TBD (see OQ-002)

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-BE-001 | FR-BE-001 | Authenticated user with /ivts/requests edit permission | POST /api/v1/ivts/requests/submit with valid body | 201 response, request document created in DB with status=pending_review |
| AC-BE-002 | FR-BE-002 | User has no prior approved requests | POST /requests/submit | priority_order = 'first_car' |
| AC-BE-003 | FR-BE-002 | User has at least 1 approved request | POST /requests/submit | priority_order = 'subsequent_car' |
| AC-BE-004 | FR-BE-003 | Admin with /ivts/requests action permission | PUT /requests/:id/review { request_status: 'approved' } | 200 response, status changed |
| AC-BE-005 | FR-BE-004 | Request approved | | validity.start_date = now, validity.expiry_date = now + 1 year |
| AC-BE-006 | FR-BE-005 | Request approved with license_plate | | Vehicle document upserted, OwnerVehicle document upserted |
| AC-BE-007 | FR-BE-006 | CCTV has mediamtx_path = "main-gate-in" | GET /cctvs/:id | stream_urls.webrtc, hls, rtsp_out all populated from MEDIAMTX_BASE_URL |
| AC-BE-008 | FR-BE-007 | Vehicles exist in DB | GET /vehicles?page=1&limit=20 | Paginated response with rows, total, hasMore |

## T9 API Contract

| Method | Endpoint | Permission | Request | Response | Error behavior |
|---|---|---|---|---|---|
| GET | /api/v1/ivts/requests | /ivts/requests view | ?status=&request_type=&user_id=&page=&limit= | `{ code:20000, data: { rows, total, page, limit, hasMore } }` | 403 no permission, 500 server error |
| GET | /api/v1/ivts/requests/:id | /ivts/requests view | — | `{ code:20000, data: { ...request } }` | 404 not found |
| POST | /api/v1/ivts/requests/submit | /ivts/requests edit | `{ request_type, user_type, vehicle_info, owner_info, uploaded_documents }` | `{ code:20000, data: { ...created } }` 201 | 400 validation, 401 no context |
| PUT | /api/v1/ivts/requests/:id/review | /ivts/requests action | `{ request_status }` | `{ code:20000, data: { ...updated } }` | 400 invalid status, 404 not found |
| GET | /api/v1/ivts/vehicles | /ivts/vehicles view | ?user_id=&q=&page=&limit= | `{ code:20000, data: { rows, total, page, limit, hasMore } }` | 403, 500 |
| GET | /api/v1/ivts/vehicles/:id | /ivts/vehicles view | — | `{ code:20000, data: { ...vehicle, owner: {...} } }` | 404 not found |
| GET | /api/v1/ivts/cctvs | /ivts/cctvs view | ?status=&q=&page=&limit= | `{ code:20000, data: { rows, total, page, limit, hasMore } }` | 403, 500 |
| GET | /api/v1/ivts/cctvs/:id | /ivts/cctvs view | — | `{ code:20000, data: { ...cctv, stream_urls: { webrtc, hls, rtsp_out } } }` | 404 not found |
| GET | /api/v1/ivts/tracking/logs | /ivts/tracking view | ?vehicle_id=&from=&to=&page=&limit= | `{ code:20000, data: { rows, total, page, limit, hasMore } }` | 403, 500 |
| GET | /api/v1/ivts/tracking/history | /ivts/tracking view | ?user_id=&vehicle_id=&from=&to=&page=&limit= | `{ code:20000, data: { rows, total, page, limit, hasMore } }` | 403, 500 |

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | yes — 7 new collections | Mongoose schemas created |
| Migration | no | New collections, no existing data to migrate |
| Seed/backfill | no | Collections populated by application workflow |
| Index | yes — composite indexes on license_plate+province, user_id+timestamp | Defined in schemas |
| Rollback | Drop new collections; revert ivts.routes.js to git HEAD | |

## T11 Backend Plan / Changes

- **Routes**: 10 new routes added to `server/Project/ivts/ivts.routes.js`
- **Guards**: 4 new permission paths (`/ivts/requests`, `/ivts/vehicles`, `/ivts/cctvs`, `/ivts/tracking`)
- **Services**: 4 new service files in `service/`
- **Models**: 7 new model files in `models/`
- **Tests**: `node --check` syntax verification passed; live smoke tests pending

## T12 Frontend Plan / Changes

Out of scope for this change. Frontend can now call new routes via existing `api.js` wrapper.

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Authentication | All routes behind `account.onCheckAuthorization` — existing middleware |
| Authorization path/action | Per-route `authorization.requirePermission()` guards |
| Data scope | user_id filtering for self-service queries; admin sees all |
| Audit | Not implemented in this change — existing audit pattern available |
| Input validation | Required fields validated in service layer; enums enforced by Mongoose |
| Error/secret leakage | Error messages contain no PII or internal details |
| Privacy / PDPA | citizen_id is gated by permission; no PII in errors or logs |
| Profile/account data minimization | citizen_id stored only in owner_vehicles and requests; not exposed in list endpoints |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-BE-001 | functional | user | POST /requests/submit with valid body | 201, pending_review |
| TC-BE-002 | functional | admin | PUT /requests/:id/review approved | validity dates set, vehicles/owner upserted |
| TC-BE-003 | functional | user | POST 2nd request | priority_order = subsequent_car |
| TC-BE-004 | functional | any | GET /cctvs/:id | stream_urls populated from MEDIAMTX_BASE_URL |
| TC-BE-005 | permission | unauthorized | GET /requests without permission | 403 |
| TC-BE-006 | negative | user | POST /requests/submit missing license_plate | 400 |
| TC-BE-007 | negative | admin | PUT review with invalid status | 400 |

## T15 Implementation Summary

| File | Change |
|---|---|
| `server/Project/ivts/models/user.model.js` | NEW — User collection schema |
| `server/Project/ivts/models/vehicle.model.js` | NEW — vehicles schema |
| `server/Project/ivts/models/owner_vehicle.model.js` | NEW — owner_vehicles schema |
| `server/Project/ivts/models/cctv.model.js` | NEW — cctvs schema with stream_urls + location |
| `server/Project/ivts/models/request.model.js` | NEW — requests schema with 4 sub-documents |
| `server/Project/ivts/models/tracking_log.model.js` | NEW — tracking_logs schema |
| `server/Project/ivts/models/tracking_history.model.js` | NEW — tracking_histories schema |
| `server/Project/ivts/service/vehicle_request.js` | NEW — submit, review, list, getById |
| `server/Project/ivts/service/cctv.js` | NEW — list, getById, generateStreamUrls |
| `server/Project/ivts/service/vehicle.js` | NEW — list, getById with owner |
| `server/Project/ivts/service/tracking.js` | NEW — listLogs, listHistory |
| `server/Project/ivts/ivts.routes.js` | MODIFIED — 10 new routes added |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `node --check` all 12 files | PASS | All exit code 0 |

Commands not run:

| Command | Reason | Risk |
|---|---|---|
| `npm test` | Requires running server + MongoDB | Medium — syntax verified |
| Live smoke tests (curl) | Requires IAM permissions seeded | Medium — logic reviewed |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-ivts.md` | no | Update pending — new API surface not yet reflected |
| `docs/tasks/2026-07-14-backend-models-routes.md` | yes | Active tasklist created |
| `docs/tasks/tasklist-progress.md` | yes | Updated with new tasks |
| `docs/AI-DOCS-INDEX.md` | no | No new doc types created |
| `README.md` | no | No new run commands or ports changed |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| B-001 | Blocker | IAM permission paths must be seeded before routes work | Ops/Dev | open |
| R-001 | Risk | Vehicle _id type (ObjectId vs Number) — model uses default ObjectId | Dev | open |
| R-002 | Risk | MEDIAMTX_BASE_URL not set → stream URLs fall back to localhost | Ops | open |
| A-001 | Assumption | `request.body.accounts` = logged-in user's ID (follows existing pattern) | Dev | open |
| A-002 | Assumption | No binary file upload in this change — URLs only | Product | open |
| D-001 | Decision | New routes mounted inside existing /api/v1/ivts router, not new mount | AI | closed |

## T19 Release / Rollback

- Release steps: Deploy backend-node; seed IAM permission paths; set `MEDIAMTX_BASE_URL` env var
- Smoke checks: POST /requests/submit, GET /cctvs/:id, GET /vehicles
- Monitoring: Check server logs for model registration errors on startup
- Rollback trigger: Model registration errors, 500 on new routes
- Rollback steps: `git revert` the route + model files; redeploy

## T20 Final Handoff

```txt
Feature: IVTS Backend Models, Routes & Controllers
Status: verifying
Active tasklist: docs/tasks/2026-07-14-backend-models-routes.md
Task IDs: ivts-BE-001 through ivts-BE-009
Progress: 80% (syntax verified; live smoke + IAM seed + PRD update pending)
Changed files:
  + server/Project/ivts/models/user.model.js
  + server/Project/ivts/models/vehicle.model.js
  + server/Project/ivts/models/owner_vehicle.model.js
  + server/Project/ivts/models/cctv.model.js
  + server/Project/ivts/models/request.model.js
  + server/Project/ivts/models/tracking_log.model.js
  + server/Project/ivts/models/tracking_history.model.js
  + server/Project/ivts/service/vehicle_request.js
  + server/Project/ivts/service/cctv.js
  + server/Project/ivts/service/vehicle.js
  + server/Project/ivts/service/tracking.js
  ~ server/Project/ivts/ivts.routes.js (10 routes added)
Routes:
  POST   /api/v1/ivts/requests/submit
  GET    /api/v1/ivts/requests
  GET    /api/v1/ivts/requests/:id
  PUT    /api/v1/ivts/requests/:id/review
  GET    /api/v1/ivts/vehicles
  GET    /api/v1/ivts/vehicles/:id
  GET    /api/v1/ivts/cctvs
  GET    /api/v1/ivts/cctvs/:id
  GET    /api/v1/ivts/tracking/logs
  GET    /api/v1/ivts/tracking/history
Permission:
  /ivts/requests view, edit, action
  /ivts/vehicles view
  /ivts/cctvs view
  /ivts/tracking view
Data migration: none (new collections)
Tests run: node --check syntax — PASS; live smoke — not run
PRD/docs: tasklist + change record created; PRD-ivts.md update pending
Security decision: All routes behind account.onCheckAuthorization + requirePermission
Privacy/PDPA decision: citizen_id permission-gated; retention policy TBD
QA decision: TC-BE-001..007 defined; not run
Release decision: Requires IAM permission seed + MEDIAMTX_BASE_URL env var
Open risks: B-001 IAM seed, R-001 vehicle _id type, R-002 MediaMTX env
Next owner: Dev/Ops for IAM seed + smoke; Product for PRD update
```
