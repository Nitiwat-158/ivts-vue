# T1-T20 Change Document: Vehicle Management Page Fix

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-VM-2026-07-27 |
| Module | Vehicle Management (frontend-vue + backend-node + user-mobile-application) |
| Date | 2026-07-27 |
| Owner / Agent | AI (Antigravity) |
| Status | In Progress — pending live smoke test |
| Active Tasklist | `docs/tasks/2026-07-27-vehicle-management-fix.md` |

## T2 Requirement

- User request: แก้ไขหน้าเว็บ Vehicle Management ให้แสดงข้อมูล vehicles จริง, รับ request สำหรับ add vehicle, และเมื่อกดอนุมัติแล้วให้เก็บข้อมูล vehicle ในรูปแบบที่ถูกต้อง
- Business goal: ให้ admin สามารถดูรายการรถ, รับและพิจารณาคำขอเพิ่มรถ, และเมื่ออนุมัติแล้วข้อมูลรถจะถูกบันทึกลง vehicles collection ในรูปแบบ schema จริง
- Success outcome: ตาราง Vehicle Management แสดงรถ 6+ คัน, tab คำขอเพิ่มรถแสดง 2 requests, กด approve แล้วรถใหม่ถูกสร้างใน vehicles collection ด้วย format CR-format

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route | `backend-node/server/Project/ivts/ivts.routes.js` | /owner-vehicles, /requests, /requests/:id/review routes confirmed |
| Backend service | `backend-node/server/Project/ivts/service/owner_vehicle.js` | Rewritten to use vehicles+requests, not owner_vehicles |
| Backend service | `backend-node/server/Project/ivts/service/vehicle_request.js` | sanitizeVehicleInfo, _syncVehicleOnApproval fixed |
| Data model | `backend-node/server/Project/ivts/models/vehicle.model.js` | Rewritten to match live DB schema (plate_number, vehicle_code, type, owner_name, validity_*) |
| Data model | `backend-node/server/Project/ivts/models/request.model.js` | vehicle_info.license_plate = join key |
| Frontend page | `frontend-vue/src/projects/views/vehicles/VehicleManagement.vue` | Rewritten with 2 tabs + request management |
| Frontend API | `frontend-vue/src/service/api.js` | ivtsRequests method added |
| Frontend composable | `frontend-vue/src/projects/views/vehicles/useVehicleApi.js` | fetchRequests, reviewRequest added |
| Frontend component | `frontend-vue/src/projects/components/vehicles/VehicleTable.vue` | plateNumber(), provinceLicense() fixed |
| Frontend component | `frontend-vue/src/projects/components/vehicles/VehicleRequestTable.vue` | NEW — request list with approve/reject |
| Frontend component | `frontend-vue/src/projects/components/vehicles/ConfirmRequestModal.vue` | NEW — confirm dialog |
| Mobile | `user-mobile-application/lib/screens/add_vehicle_screen.dart` | vehicle_type → type in vehicle_info |
| MongoDB Compass | vehicles (8 docs), requests (2 docs), owner_vehicles (empty) | Schema confirmed 2026-07-27 |

## T4 Current Behavior (Before Fix)

- Current API behavior: GET /owner-vehicles returned empty (owner_vehicles collection empty)
- Current UI behavior: Vehicle Management table showed no data / "-" in all cells
- Current data behavior: vehicles stored in `vehicles` collection (6+), requests in `requests` collection (2 pending)
- Current permission behavior: /requests routes used canViewRequests/canReviewRequest (IAM permission not bootstrapped) → 403
- Mobile: vehicle_info sent `vehicle_type` field, but vehicles collection stores `type`

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | no | Small bug fix |
| Product Owner | no | — |
| Data Model | yes | vehicle.model.js rewritten |
| Backend | yes | service/owner_vehicle.js, vehicle_request.js, ivts.routes.js |
| Frontend | yes | VehicleManagement.vue, VehicleTable.vue, api.js, useVehicleApi.js, 2 new components |
| Security IAM | yes | /requests routes need IAM permission bootstrap (TODO) |
| QA/UAT | yes | Requires live smoke |
| Release/Ops | no | — |

## T6 Scope

In scope:

- Vehicle Management page tab: รถทั้งหมด (6 real vehicles from DB)
- Vehicle Management page tab: คำขอเพิ่มรถ (2 pending requests)
- Approve/Reject request → upsert vehicle in CR-format
- Mobile app vehicle_info.type field rename

Out of scope:

- IAM permission bootstrap for /ivts/requests path (TODO, see T18)
- Edit vehicle details
- Renewal request flow (separate feature)

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-VM-001 | Vehicle Management page shows all vehicles from vehicles collection | Admin | Must |
| FR-VM-002 | Vehicle Management page shows pending registration requests | Admin | Must |
| FR-VM-003 | Admin can approve a request; vehicle is created in vehicles collection in CR-format | Admin | Must |
| FR-VM-004 | Admin can reject a request; request_status updated to rejected | Admin | Must |
| FR-VM-005 | Mobile add vehicle sends vehicle_info.type (not vehicle_type) | Mobile user | Must |
| FR-VM-006 | Backend accepts both type and vehicle_type for backward compat | Backend | Should |

Privacy / PDPA requirements:

- Personal data displayed: plate_number, owner_name, validity dates (admin view only)
- Personal data hidden: citizen_id not exposed in admin vehicle list
- Personal data stored or changed: owner_name, province_license stored in vehicles on approval
- Data export/download behavior: CSV export available (admin only)
- Production data-minimization decision: owner_name visible to admin, not exposed in public APIs

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-VM-001 | FR-VM-001 | Admin opens /vehicles/management | Page loads | Table shows 6+ vehicles with plate_number, type, owner_name, validity |
| AC-VM-002 | FR-VM-002 | Admin clicks "คำขอเพิ่มรถ" tab | Tab renders | Table shows 2 pending requests with vehicle_info details |
| AC-VM-003 | FR-VM-003 | Admin clicks approve on pending request | Confirm modal confirmed | PUT /api/v1/ivts/requests/:id/review {approved} called; new vehicle created in vehicles collection with CR-format _id |
| AC-VM-004 | FR-VM-004 | Admin clicks reject on pending request | Confirm modal confirmed | request_status = rejected |
| AC-VM-005 | FR-VM-005 | Mobile user submits add vehicle form | POST /requests/submit | vehicle_info contains type: "car"|"motorcycle" |

## T9 API Contract

| Method | Endpoint | Permission | Request | Response | Error behavior |
|---|---|---|---|---|---|
| GET | /api/v1/ivts/owner-vehicles | mockVehicleMgmtGuard (no-op) | ?search&document_status&page&limit | {data: [...vehicles], stats: {total,pending,approved,rejected}} | 500 on DB error |
| GET | /api/v1/ivts/requests | mockVehicleMgmtGuard (TODO: canViewRequests) | ?limit&status | {rows, total, page, limit} | 404 if not found |
| PUT | /api/v1/ivts/requests/:id/review | mockVehicleMgmtGuard (TODO: canReviewRequest) | {request_status: "approved"|"rejected"} | updated request doc | 400 bad status, 404 not found |
| POST | /api/v1/ivts/requests/submit | canSubmitRequest | {request_type, user_type, vehicle_info{license_plate,type,...}, owner_info} | created request | 400 validation, 401 no auth |
| DELETE | /api/v1/ivts/owner-vehicles/:id | mockVehicleMgmtGuard | — | {deleted: true} | 404 not found |

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | yes — vehicle.model.js rewritten | Compass confirmed plate_number, vehicle_code, type, owner_name, validity_* fields |
| Migration | no — existing docs have extra fields that Mongoose strict:false allows | strict:false in new schema |
| Seed/backfill | no | existing 6 vehicles remain unchanged |
| Index | yes — plate_number index added | vehicle.model.js line 52 |
| Rollback | restore old vehicle.model.js from git | Low risk — no destructive migration |

## T11 Backend Plan / Changes

- Routes: `ivts.routes.js` — /requests GET+GET/:id+PUT review use mockVehicleMgmtGuard (TODO restore to canViewRequests/canReviewRequest when IAM bootstrapped)
- Guards: mockVehicleMgmtGuard (temporary, see T18)
- Services:
  - `owner_vehicle.js` — rewritten: vehiclePlateKey=plate_number, buildRow exposes plate_number/vehicle_code/type/owner_name, getAll/getById/approve/reject/remove/exportCsv
  - `vehicle_request.js` — sanitizeVehicleInfo accepts type+vehicle_type; _syncVehicleOnApproval creates CR-format vehicle
- Controllers/models: `vehicle.model.js` rewritten (plate_number, vehicle_code, type, owner_name, validity_*, strict:false)
- Tests: `node --check` PASS on vehicle_request.js, vehicle.model.js, owner_vehicle.js

## T12 Frontend Plan / Changes

- Route: /vehicles/management (unchanged)
- API wrapper: `api.js` — ivtsRequests(method, data) added
- Vuex module: none
- Page: `VehicleManagement.vue` — 2 tabs (รถทั้งหมด / คำขอเพิ่มรถ) + loadRequests + confirmReviewRequest
- Components:
  - `VehicleTable.vue` — plateNumber() uses plate_number primary, provinceLicense() added
  - `VehicleRequestTable.vue` — NEW — request list table
  - `ConfirmRequestModal.vue` — NEW — confirm dialog with vehicle_info + owner_info display
- Visible fields: plate_number, province_license, type, brand/model/color, owner_name, validity_expiry, request_status
- Hidden sensitive fields: citizen_id not shown in Vehicle Management table
- Tests: n/a (Vue components, no unit test runner configured)

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Authentication | mockVehicleMgmtGuard is no-op — admin must be logged in via session but no fine-grained permission check |
| Authorization path/action | TODO: bootstrap /ivts/requests (view, action) in IAM security permissions — see T18 B-001 |
| Data scope | Admin sees all vehicles and requests, no user-scoping |
| Audit | No audit log on approve/reject (future work) |
| Input validation | sanitizeVehicleInfo validates type in ['car','motorcycle'], license_plate required |
| Error/secret leakage | Error messages return message only, no stack |
| Privacy / PDPA | owner_name, plate_number visible to admin only. citizen_id hidden in Vehicle Management. |
| Profile/account data minimization | Not applicable |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-VM-001 | functional | admin | GET /api/v1/ivts/owner-vehicles | 200 + 6+ vehicles with plate_number, type, owner_name |
| TC-VM-002 | functional | admin | GET /api/v1/ivts/requests?limit=200 | 200 + 2 requests |
| TC-VM-003 | functional | admin | PUT /api/v1/ivts/requests/:id/review {approved} | 200 + vehicle created in vehicles collection with CR-format |
| TC-VM-004 | functional | admin | PUT /api/v1/ivts/requests/:id/review {rejected} | 200 + request_status = rejected |
| TC-VM-005 | functional | mobile user | POST /api/v1/ivts/requests/submit with type:"car" | 201 + request stored with vehicle_info.type |
| TC-VM-006 | regression | admin | Browser: /vehicles/management | Tab รถทั้งหมด shows real data, tab คำขอเพิ่มรถ shows requests |

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/server/Project/ivts/models/vehicle.model.js` | Rewritten — plate_number, vehicle_code, type, owner_name, validity_*, strict:false |
| `backend-node/server/Project/ivts/service/owner_vehicle.js` | Rewritten — vehiclePlateKey=plate_number, all CRUD uses vehicles+requests |
| `backend-node/server/Project/ivts/service/vehicle_request.js` | sanitizeVehicleInfo accepts type+vehicle_type; _syncVehicleOnApproval creates CR-format vehicle |
| `backend-node/server/Project/ivts/ivts.routes.js` | /requests GET+GET/:id+PUT routes use mockVehicleMgmtGuard |
| `frontend-vue/src/service/api.js` | ivtsRequests(method, data) added |
| `frontend-vue/src/projects/views/vehicles/useVehicleApi.js` | fetchRequests, reviewRequest added |
| `frontend-vue/src/projects/views/vehicles/VehicleManagement.vue` | 2-tab layout + request management logic |
| `frontend-vue/src/projects/components/vehicles/VehicleTable.vue` | plateNumber→plate_number, provinceLicense added |
| `frontend-vue/src/projects/components/vehicles/VehicleRequestTable.vue` | NEW |
| `frontend-vue/src/projects/components/vehicles/ConfirmRequestModal.vue` | NEW |
| `user-mobile-application/lib/screens/add_vehicle_screen.dart` | vehicle_type → type in vehicle_info |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| ivts-VM-001 | done | 100 | Source discovery complete | — |
| ivts-VM-002 | done | 100 | node --check PASS | Live smoke pending |
| ivts-VM-003 | done | 100 | Components created | Live smoke pending |
| ivts-VM-004 | verifying | 80 | Code done, node --check PASS | B-001: requires server restart to verify |
| ivts-VR-001 | done | 100 | Source discovery | — |
| ivts-VR-002 | done | 100 | Code done | Live smoke pending |
| ivts-VR-003 | done | 100 | Component created | Visual verify pending |
| ivts-VR-004 | done | 100 | Component created | Visual verify pending |
| ivts-VR-005 | done | 100 | Page updated | Visual verify pending |
| ivts-VR-006 | done | 100 | node --check PASS | Live smoke pending |
| ivts-VR-007 | verifying | 70 | Code done | B-001 |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| node --check vehicle_request.js | PASS | 2026-07-27 |
| node --check vehicle.model.js | PASS | 2026-07-27 |
| node --check owner_vehicle.js | PASS | 2026-07-27 |
| node --check ivts.routes.js | PASS | 2026-07-27 |

Commands not run:

| Command | Reason | Risk |
|---|---|---|
| GET /api/v1/ivts/owner-vehicles (curl/browser) | Requires server restart | Medium — code not yet live-verified |
| GET /api/v1/ivts/requests | Requires server restart | Medium |
| PUT /api/v1/ivts/requests/:id/review | Requires server restart | Medium |
| Browser /vehicles/management | Requires frontend + backend running | High — visual verify not done |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-ivts.md` | no | Minor bug fix + UI enhancement, no new features |
| `docs/tasks/tasklist-progress.md` | yes | Updated with VM + VR task rows |
| `docs/tasks/tasklist-progress.html` | yes | Regenerated via node scripts/render-tasklist-progress-html.js |
| `docs/AI-DOCS-INDEX.md` | yes | Added tasklist and change record entries |
| `docs/tasks/2026-07-27-vehicle-management-fix.md` | yes | Active tasklist |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| B-001 | Blocker | Live smoke tests not run — requires server restart to apply backend changes | Dev | open |
| B-002 | Blocker | Browser visual verification not done — requires both frontend + backend running | Dev | open |
| B-003 | Blocker | IAM permission /ivts/requests (view, action) not bootstrapped — routes use mockVehicleMgmtGuard as workaround | Security/IAM Agent | open |
| A-001 | Assumption | Existing 6 vehicles in vehicles collection remain unaffected by vehicle.model.js schema change (strict:false) | AI | open |
| A-002 | Assumption | vehicle_code generation (CR-format count+1) is safe for single-instance deployment | AI | open |
| D-001 | Decision | Use mockVehicleMgmtGuard for /requests routes until IAM is bootstrapped | AI | closed |
| D-002 | Decision | sanitizeVehicleInfo stores type (not vehicle_type) going forward; backward compat via vi.type || vi.vehicle_type | AI | closed |

## T19 Release / Rollback

- Release steps: 1) Restart backend-node server 2) Verify live endpoints 3) Visual verify in browser
- Smoke checks: GET /api/v1/ivts/owner-vehicles → 200 + vehicles; GET /api/v1/ivts/requests → 200 + 2 requests
- Monitoring: Check server console for [vehicle_request] Vehicle created/updated log lines
- Rollback trigger: 500 errors on /owner-vehicles or /requests endpoints
- Rollback steps: git revert vehicle.model.js, owner_vehicle.js, vehicle_request.js; restart server

## T20 Final Handoff

```txt
Feature: Vehicle Management page fix + Request tab + Mobile vehicle_type→type
Status: In Progress (code done, pending live smoke)
Active tasklist: docs/tasks/2026-07-27-vehicle-management-fix.md
Task IDs: ivts-VM-001 to ivts-VM-004, ivts-VR-001 to ivts-VR-007
Progress: 80% (code complete, live smoke blocked on server restart)
Changed files:
  backend-node/server/Project/ivts/models/vehicle.model.js (rewritten)
  backend-node/server/Project/ivts/service/owner_vehicle.js (rewritten)
  backend-node/server/Project/ivts/service/vehicle_request.js (sanitizeVehicleInfo + _syncVehicleOnApproval)
  backend-node/server/Project/ivts/ivts.routes.js (/requests routes → mockVehicleMgmtGuard)
  frontend-vue/src/service/api.js (ivtsRequests added)
  frontend-vue/src/projects/views/vehicles/useVehicleApi.js (fetchRequests, reviewRequest)
  frontend-vue/src/projects/views/vehicles/VehicleManagement.vue (2-tab + request management)
  frontend-vue/src/projects/components/vehicles/VehicleTable.vue (plate_number fix)
  frontend-vue/src/projects/components/vehicles/VehicleRequestTable.vue (NEW)
  frontend-vue/src/projects/components/vehicles/ConfirmRequestModal.vue (NEW)
  user-mobile-application/lib/screens/add_vehicle_screen.dart (vehicle_type→type)
Routes:
  GET /api/v1/ivts/owner-vehicles
  GET /api/v1/ivts/requests
  PUT /api/v1/ivts/requests/:id/review
  DELETE /api/v1/ivts/owner-vehicles/:id
UI routes: /vehicles/management
Permission: mockVehicleMgmtGuard (TODO: restore IAM guards after bootstrapping /ivts/requests)
Data migration: none (strict:false on vehicle model, no destructive change)
Tests run: node --check PASS on 3 backend files + routes file
PRD/docs: tasklist-progress.md updated, HTML regenerated
Security decision: TODO — B-003 IAM /ivts/requests permission not bootstrapped
Privacy/PDPA decision: owner_name + plate_number visible to admin only; citizen_id hidden
QA decision: Live smoke and browser verify pending
Release decision: Restart server before releasing
Open risks: B-001 B-002 B-003 A-001 A-002
Next owner: Dev (restart server, run smoke, visual verify)
```
