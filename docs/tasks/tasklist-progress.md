# Tasklist: IVTS System Progress And Readiness

| Field | Value |
|---|---|
| Date | 2026-08-08 |
| Project | IVTS |
| Module / Feature | system progress and readiness |
| Requirement | Track actual project system progress from source and verification evidence |
| Active Change Record | `docs/changes/2026-08-09-emergency-report-accept-permission.md` |
| Overall Status | in_progress |
| Overall Progress | 60% |
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
| Integration/auth verified | 15 | 8 | iam-admin-client reverted; iam-mobile-client created + 9/9 unit tests PASS; 15/15 admin regression tests PASS. |
| Frontend route/API mapped | 20 | 20 | CCTV route mapped and page implemented. |
| Environment/static config checked | 10 | 0 | Not verified yet. |
| Release verification | 15 | 0 | Not verified yet. |
| Tasklist and handoff | 5 | 4 | CCTV + backend models/routes + mobile API + auth separation handoff completed. |
| **Total** | **100** | **52** | Auth separation gate completed; admin login verified clean; mobile client independently tested. |

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
| ivts-MOBAPI-001 | Mobile API: source discovery + live DB schema check | Orchestrator | AI | none | done | 100 | mongosh queries against live IVTS DB revealed real field shapes diverge from Mongoose schemas | `service/mobile.js` header comments | manual mongosh verification | none | — | Source map + schema evidence |
| ivts-MOBAPI-002 | Mobile API: backend service + routes (vehicles, tracking, requests, emergency, notifications) | Backend | AI | ivts-MOBAPI-001 | done | 100 | New `mobile.js` service + `mobile.routes.js`, mounted at `/api/v1/mobile` | `service/mobile.js`, `mobile.routes.js`, `app.routes.js` | `node --check` PASS; live curl smoke on all 7 endpoints PASS | none | — | Working mobile API |
| ivts-MOBAPI-003 | Mobile API: Flutter HTTP client + data repository, remove all mock data | Frontend | AI | ivts-MOBAPI-002 | done | 100 | `http` dep added; service/repository layer wired; all `MockData` demo content removed per user instruction (MongoDB-only, no mock fallback); verified end-to-end on Windows desktop build | `pubspec.yaml`, `lib/services/*.dart`, `lib/data/mock_data.dart`, `lib/windows/` (new platform) | `flutter analyze lib/` PASS; `flutter run -d windows` PASS — log shows `loaded 6 vehicles`, `loaded 4 notifications from API` | none | none | Working Flutter data layer, verified live |
| ivts-MOBAPI-004 | Mobile API: doc compliance (tasklist, change record, progress, index, README) | Ops | AI | ivts-MOBAPI-003 | done | 100 | Tasklist + change record created; this file + AI-DOCS-INDEX.md + mobile README updated; HTML regenerated | `docs/tasks/2026-07-24-mobile-mongodb-api.md`, `docs/changes/2026-07-24-mobile-mongodb-api.md` | n/a | none | none | Complete doc set |
| ivts-AUTH-001 | Revert iam-admin-client.js forwardScopedSignin to original admin-only login | done | 100 | `iam-admin-client.js` — removed isMobileClient, Google bypass, JIT logic, DEBUG logs | 15/15 admin tests PASS | none | — | Reverted source file |
| ivts-AUTH-002 | Create iam-mobile-client.js for mobile IAM auth + JIT provisioning | done | 100 | `iam-mobile-client.js` created — MFU IAM proxy + JIT + Google fallback + hijack detection | 9/9 mobile tests PASS | none | — | New service file |
| ivts-AUTH-003 | Update mobile.routes.js to use iam-mobile-client | done | 100 | `mobile.routes.js` — replaced iamAdminClient.forwardScopedSignin with iamMobileClient.forwardMobileSignin | node --check PASS | none | — | Updated routes file |
| ivts-AUTH-004 | Create unit tests for iam-mobile-client.js | done | 100 | `iam-mobile-client.test.js` — 9 tests: JIT create/update, hijack x3, role enforcement, fallback | 9/9 PASS | none | — | Test file |
| ivts-AUTH-005 | Document auth separation (task + change record + progress) | done | 100 | `docs/tasks/2026-07-31-separate-admin-mobile-login.md`, `docs/changes/2026-07-31-separate-admin-mobile-login.md` | n/a | none | — | Docs complete |
| ivts-TASK-025 | Automatic owner_vehicles sync on request approval | Backend | AI | none | done | 100 | Implementation and live DB verification passed | `service/vehicle_request.js`, `service/owner_vehicle.js`, `models/owner_vehicle.model.js` | Live DB test SUCCESS | none | — | Sync owner_vehicles on approval |
| ivts-MAuth-001 | User Mobile Login & Registration with Hashed Password and Data Isolation | Mobile/Backend | AI | none | done | 100 | Implementation, 13 unit tests, flutter analyze PASS | `user.model.js`, `iam-mobile-client.js`, `mobile.routes.js`, `auth_service.dart`, `register_screen.dart`, `app_data_repository.dart` | 13/13 PASS | none | — | Mobile Local Register & Login with Data Isolation |
| ivts-MAuth-002 | Mobile User IAM Decoupling & Registration E11000 Duplicate Key Error Fix | Backend | AI | none | done | 100 | `user.model.js` default null removed; `initialize.js` index cleanup added; 13 mobile + 15 admin tests PASS | `user.model.js`, `helpers/initialize.js`, `iam-mobile-client-local.test.js` | 13/13 Mobile PASS, 15/15 Admin PASS | none | — | Decouple Mobile IAM & Fix E11000 null duplicate error |
| ivts-VM-002 | Vehicle Management License Plate View Display Fix | Frontend/Backend | AI | none | done | 100 | `VehicleVerificationModal.vue` fallbacks added; `owner_vehicle.js` buildRow updated | `VehicleVerificationModal.vue`, `owner_vehicle.js` | 25/25 PASS | none | — | Fix missing license plate display on View modal |
| ivts-LOC-RHT-001 | Request History Title Translation | Mobile | AI | none | done | 100 | `translateRequestTitle()` added to `locale_provider.dart`, used in `request_history_screen.dart` | `locale_provider.dart`, `request_history_screen.dart` | flutter analyze PASS | none | — | Localized Request History item titles |
| ivts-LOC-RHD-001 | Request History Emergency Detail Navigation | Mobile | AI | none | done | 100 | `GestureDetector` added in `request_history_screen.dart` to navigate to `EmergencyStatusScreen(emergencyId)` | `request_history_screen.dart`, `emergency_status_screen.dart`, `mobile_api_service.dart` | flutter analyze PASS | none | — | Connected Request History items to specific EmergencyStatusScreen |
| ivts-LOC-RHVR-001 | Request History Vehicle Registration Read-Only Detail View | Mobile | AI | none | done | 100 | Adapted `AddVehicleScreen` for Read-only mode & wired to `request_history_screen.dart` | `add_vehicle_screen.dart`, `request_history_screen.dart` | flutter analyze PASS | none | — | Vehicle Registration items open AddVehicleScreen in Read-only mode |


| ivts-VA-001 | Fix Vehicle Request Approval MongoDB Sync | Backend | AI | none | done | 100 | Refactored vehicle approval sync in `vehicle_request.js` & ran data repair script | `vehicle_request.js`, `owner_vehicle.js`, `fix-approved-requests-vehicles.js` | 2/2 unit tests PASS; live MongoDB repair PASS | none | — | Repaired MongoDB collections & fixed sync logic |
| ivts-MERH-001 | User Mobile Emergency Request History Integration | Mobile/Backend | AI | none | done | 100 | Saved user ID on emergency report, merged in listRequestHistory & updated Flutter app | `emergency_report.model.js`, `service/mobile.js`, `emergency_request_screen.dart`, `locale_provider.dart` | node --check PASS; flutter analyze 0 errors | none | — | Included emergency requests in Request History |
| ivts-DASH-001 | Dashboard alert safe text rendering (avoid raw JSON in alert line) | Frontend | AI | none | done | 100 | Added reusable type guards + location/description helpers in Dashboard alert mapper to support string/object payloads | `frontend-vue/src/views/Dashboard.vue` | `npm --prefix frontend-vue run lint -- src/views/Dashboard.vue` PASS; manual cases documented for `vehicle_id` string/object | none | — | Human-readable dashboard alerts |
| ivts-ERM-001 | Emergency report accept permission and feedback fix | Backend/Frontend | AI | none | done | 100 | Route permission aligned to report management scope, backend denial logging added, and frontend now shows loading/error feedback | `backend-node/server/Project/ivts/ivts.routes.js`, `backend-node/server/Project/security/service/authorization.js`, `frontend-vue/src/projects/views/operations/EmergencyReportManagement.vue` | workspace error check PASS | none | — | Accept flow with visible failure feedback |
| ivts-TASK-054 | Mobile dynamic emergency request pop-up / banner by request type | Backend/Frontend | AI | none | done | 100 | Filtered listEmergencyReports by user_id, activeEmergencyReportNotifier state, dynamic localized banner & auto-dismiss on resolve | `mobile.js`, `home_screen.dart`, `emergency_request_screen.dart`, `app_data_repository.dart`, `locale_provider.dart` | node --check PASS; flutter analyze PASS (0 issues) | none | — | Dynamic localized emergency request banner & auto-dismiss on resolve |
| ivts-TASK-055 | Update Emergency Report Status in MongoDB on Mobile Resolve | Backend/Frontend | AI | none | done | 100 | PATCH /api/v1/mobile/emergency-reports/:id endpoint updates MongoDB status to RESOLVED & refreshes mobile repository | `mobile.routes.js`, `mobile.js`, `mobile_api_service.dart`, `emergency_status_screen.dart` | node --check PASS; flutter analyze PASS (0 issues) | none | — | MongoDB status updated on resolve |
| ivts-TASK-056 | Mobile Emergency Banner Auto-Dismiss on RESOLVED Status | Backend/Frontend | AI | none | done | 100 | Added 4th timeline step in mobile.js, updated AppDataRepository & EmergencyStatusScreen to auto-dismiss banner on RESOLVED/CLOSED | `mobile.js`, `app_data_repository.dart`, `emergency_status_screen.dart` | node --check PASS; flutter analyze PASS (0 issues) | none | — | Auto-dismiss emergency banner on RESOLVED status |






## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| `node --check` all 12 new backend files | PASS | Exit code 0 — 2026-07-14 |
| `node --check` vehicle_request.js + vehicle.model.js + owner_vehicle.js + ivts.routes.js | PASS | Exit code 0 — 2026-07-27 |
| `node --check` iam-admin-client.js + iam-mobile-client.js + mobile.routes.js | PASS | Exit code 0 — 2026-07-31 |
| `--test iam-admin-client.test.js` (15 tests) | PASS 15/15 | node:test runner — 2026-07-31 |
| `--test iam-mobile-client.test.js` (9 tests) | PASS 9/9 | node:test runner — 2026-07-31 |
| `npm --prefix frontend-vue run lint -- src/views/Dashboard.vue` | PASS | No lint errors — 2026-08-08 |
| backend npm test | not run | requires running server + DB |
| frontend lint/test/build | not run | |
| live smoke/e2e | not run | |

## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| B-001 | blocker | open | IAM permission paths /ivts/requests, /ivts/vehicles, /ivts/cctvs, /ivts/tracking not yet seeded | All new routes return 403 until seeded | Dev/Ops: seed permission paths in IAM |
| R-001 | risk | open | Vehicle _id type (ObjectId vs Number) — confirm with existing DB data | Id type mismatch on queries | Dev: inspect existing vehicles collection |
| R-002 | risk | open | MEDIAMTX_BASE_URL env var not confirmed set | Stream URLs fall back to localhost | Ops: set MEDIAMTX_BASE_URL in .env files |
| B-002 | blocker | open | Windows Firewall rule for Node.js is scoped to `Public` profile only; Android emulator cannot reach host `10.0.2.2:8203` (mobile API) | Mobile app cannot be verified on Android emulator until fixed | User: run elevated `netsh advfirewall firewall add rule name="IVTS Node Dev 8203 (All Profiles)" dir=in action=allow protocol=TCP localport=8203 profile=any` |
| R-003 | risk | **resolved** | `POST /api/v1/mobile/auth/signin` now implemented in `iam-mobile-client.js` (MFU IAM + JIT provisioning) | Mobile login now authenticated; all other `/mobile/*` routes remain read-only (no auth middleware — see R-004) | — |
| R-004 | risk | open | All mobile read-only routes (`/api/v1/mobile/vehicles`, `/tracking`, etc.) have no auth middleware | Data is publicly readable | Product/Security: add token validation middleware before production release |
| R-005 | risk | open | Google bypass token (`google-bypass-token-<email>`) is not a real IAM session token; mobile app cannot call IAM-protected endpoints with it | Development-only — do not deploy to production | Disable Google bypass in production env; integrate real MFU IAM mobile token flow |

## T6. Decision

Backend models, services, and routes are implemented and syntax-verified. System progress updated from 25% to 45% based on implementation gate completion. Live smoke tests blocked by IAM permission seeding requirement (B-001).

Vehicle Management fix (2026-07-27): owner_vehicle.js + vehicle.model.js + vehicle_request.js rewritten to use vehicles+requests collections (not empty owner_vehicles). Frontend VehicleManagement.vue refactored with 2 tabs (รถทั้งหมด / คำขอเพิ่มรถ). VehicleRequestTable.vue + ConfirmRequestModal.vue added. Mobile add_vehicle_screen.dart vehicle_type → type renamed. All backend node --check PASS. Live smoke pending server restart (B-001).

Mobile API (`docs/tasks/2026-07-24-mobile-mongodb-api.md`): backend `/api/v1/mobile` read-only API implemented against real MongoDB collections (live schema verified via mongosh) and smoke-tested via curl (7/7 endpoints pass). Flutter app's `mock_data.dart` fully emptied per explicit user instruction — MongoDB is now the sole data source, no mock fallback. Windows desktop build (`flutter create --platforms=windows .` + `flutter run -d windows`) verified end-to-end: real data loaded (`6 vehicles`, `4 notifications`, `0 trip history`/`0 requests` matching real empty collections). Android emulator verification remains blocked by Windows Firewall scoping (B-002); this does not block the completed feature since Windows-target verification succeeded.

Auth separation (2026-07-31): `iam-admin-client.js → forwardScopedSignin` reverted to original commit `9a255686` — strictly Web Admin only; no mobile logic, no DEBUG logs. New `iam-mobile-client.js` handles all mobile user authentication: MFU IAM proxy, JIT user provisioning in MongoDB `users` collection, Google ID Token fallback (dev-only), and hijack detection. `mobile.routes.js` updated to call `iamMobileClient.forwardMobileSignin`. All 15 admin regression tests + 9 new mobile unit tests PASS. Progress updated from 45% → 52%.
Dashboard alert rendering fix (2026-08-08): `frontend-vue/src/views/Dashboard.vue` now guards enriched object fields and maps emergency alert location/description to safe concise strings. This prevents raw object JSON from being rendered in Alerts when `vehicle_id` arrives as an enriched object.
Mobile API (`docs/tasks/2026-07-24-mobile-mongodb-api.md`): backend `/api/v1/mobile` read-only API implemented against real MongoDB collections (live schema verified via mongosh) and smoke-tested via curl (7/7 endpoints pass). Flutter app's `mock_data.dart` fully emptied per explicit user instruction — MongoDB is now the sole data source, no mock fallback. Windows desktop build (`flutter create --platforms=windows .` + `flutter run -d windows`) verified end-to-end: real data loaded (`6 vehicles`, `4 notifications`, `0 trip history`/`0 requests` matching real empty collections). Android emulator verification remains blocked by Windows Firewall scoping (B-002); this does not block the completed feature since Windows-target verification succeeded.

Auth separation (2026-07-31): `iam-admin-client.js → forwardScopedSignin` reverted to original commit `9a255686` — strictly Web Admin only; no mobile logic, no DEBUG logs. New `iam-mobile-client.js` handles all mobile user authentication: MFU IAM proxy, JIT user provisioning in MongoDB `users` collection, Google ID Token fallback (dev-only), and hijack detection. `mobile.routes.js` updated to call `iamMobileClient.forwardMobileSignin`. All 15 admin regression tests + 9 new mobile unit tests PASS. Progress updated from 45% → 52%.
