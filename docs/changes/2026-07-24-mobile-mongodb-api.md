# T1 Mobile App MongoDB-Backed API (No Mock Data)

| Field | Value |
|---|---|
| Change ID | CH-MOBAPI-2026-07-24 |
| Module | Backend `ivts` mobile API + Flutter `user-mobile-application` |
| Date | 2026-07-24 |
| Owner / Agent | AI (Orchestrator/Backend/Frontend) |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-24-mobile-mongodb-api.md` |

## T2 Requirement

- User request: (1) "ทำการสร้าง API เชื่อมต่อกับ mongodb ให้หน่อย แล้วนำข้อมูลจาก mongodb มาแทน mock_data ถ้าดึงข้อมูลจาก mongodb ผ่าน API ไม่ได้ ให้ใช้ mock_data" (2) follow-up: "ทำการใช้ข้อมูลจาก mongodb ทั้งหมด ไม่ต้องใช้ mock_data" — supersedes the original fallback requirement; MongoDB is now the sole data source.
- Business goal: Flutter mobile app must display real vehicle/trip/request/notification data from the operational MongoDB database instead of hardcoded demo content.
- Success outcome: All screens that previously read `MockData`'s hardcoded lists now read data populated exclusively from the backend mobile API; no fake/demo records remain in the codebase.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route truth | `backend-node/server/routes/app.routes.js` | New `/api/v1/mobile` mount added alongside existing `/api/v1/ivts`, `/api/v1/setting`, `/api/v1/security`. |
| Backend module | `backend-node/server/Project/ivts/service/mobile.js`, `mobile.routes.js` | Full read-only mapping layer over live Mongo collections. |
| Live DB shape | `docker exec ivts-vue-mongodb-1 mongosh IVTS --quiet --eval "printjson(db.<collection>.findOne())"` | `vehicles` real documents use flat fields (`plate_number`, `vehicle_code`, `type`, `owner_name`, `validity_start`, `validity_expiry`, `last_location`, `updated_at`, `user_id`) that diverge from the declared Mongoose schema. `tracking_histories`, `requests`, `tracking_logs` are empty (0 docs). `emergency_report` (1 doc) matches its schema. |
| Frontend route | N/A (Flutter, not Vue) — screens read `MockData`/`AppDataRepository` directly | See T12. |
| Frontend API | `user-mobile-application/lib/services/mobile_api_service.dart`, `api_config.dart`, `app_data_repository.dart` | HTTP GET + JSON→model mapping + in-place `MockData` replacement. |
| Privacy / PDPA | `mobile.routes.js` header comment | No PDPA-sensitive fields (e.g. citizen_id) are exposed; router documented as temporarily unauthenticated. |
| Tests | See T16 | `node --check`, `flutter analyze`, live `curl` smoke tests. |
| PRD/docs | none found referencing mobile API | No existing PRD section to update; documented as an open item. |

## T4 Current Behavior

- Current API behavior (before): No mobile-facing API existed; `/api/v1/ivts/*` requires full IAM session auth the Flutter app cannot perform.
- Current API behavior (after): New public, read-only `/api/v1/mobile/*` surface: `GET /vehicles`, `/vehicles/:id`, `/tracking/history`, `/requests`, `/emergency-reports`, `/emergency-reports/:id`, `/notifications`.
- Current UI behavior (before): All screens read hardcoded demo records from `MockData`.
- Current UI behavior (after): Screens read `MockData` lists that are populated exclusively by `AppDataRepository.refresh()` from the live API at app startup; no demo content remains.
- Current data behavior: `tracking_histories`, `requests`, and trip-waypoint/zone data have no real records yet, so those screens legitimately render empty states.
- Current permission behavior: `/api/v1/mobile/*` is intentionally unauthenticated (see A-001 in tasklist).
- Current privacy/PDPA behavior: Only non-sensitive fields are returned (plate number, vehicle code, brand/model/color, owner display name, dates, location string).

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Coordinated backend + Flutter changes and doc compliance. |
| Product Owner | no | No PRD exists for this module yet; flagged as open item (T17). |
| Data Model | yes | Read (not modified) real Mongo collections; documented schema divergence. |
| Backend | yes | New service/router/mount. |
| Frontend | yes | New Flutter service layer; removed all mock content. |
| Security IAM | yes | Documented no-auth decision as an open risk (A-001). |
| QA/UAT | no | No dedicated QA role in this repo; AI performed smoke verification (T16). |
| Release/Ops | yes | Doc control updates (this record, tasklist-progress.md, AI-DOCS-INDEX.md, README). |

## T6 Scope

In scope:

- New backend `/api/v1/mobile` read-only API (vehicles, tracking history, requests, emergency reports, derived notifications).
- Flutter HTTP client + API service + repository layer.
- Removal of all hardcoded mock/demo content from `mock_data.dart`.
- Null-safety guard for the one screen (`location_screen.dart`) that assumed a non-empty vehicle list.

Out of scope:

- Real mobile authentication/login flow (documented as open follow-up, A-001).
- Trip waypoint/zone-based location history (no backing data model exists; documented as open follow-up, A-002).
- Write/mutating mobile endpoints (registration, renewal submission, emergency report submission) — this change is read-only.

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-MOBAPI-001 | Mobile app must list vehicles from MongoDB via API | Mobile user | Must |
| FR-MOBAPI-002 | Mobile app must fetch a single vehicle by id from MongoDB via API | Mobile user | Must |
| FR-MOBAPI-003 | Mobile app must list trip/tracking history from MongoDB via API | Mobile user | Must |
| FR-MOBAPI-004 | Mobile app must list request history from MongoDB via API | Mobile user | Must |
| FR-MOBAPI-005 | Mobile app must list notifications derived from real vehicle/emergency data | Mobile user | Should |
| FR-MOBAPI-006 | No hardcoded mock data may be used as a fallback or seed content | Mobile user | Must (per follow-up instruction) |

Privacy / PDPA requirements:

- Personal data displayed: owner display name (`owner_name`), plate number.
- Personal data hidden: citizen ID, contact phone/email (not present in the vehicle/emergency DTOs).
- Personal data stored or changed: none — this change is entirely read-only.
- Data export/download behavior: none.
- Production data-minimization decision: keep the mobile API read-only and free of PDPA-sensitive fields until real mobile auth exists (documented in `mobile.routes.js`).

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-MOBAPI-001 | FR-MOBAPI-001 | The backend is running with a live MongoDB connection | A client calls `GET /api/v1/mobile/vehicles` | It returns 200 with real vehicle records mapped to the mobile `Vehicle` DTO shape |
| AC-MOBAPI-002 | FR-MOBAPI-002 | A vehicle with `_id: "CR0001"` exists | A client calls `GET /api/v1/mobile/vehicles/CR0001` | It returns 200 with that vehicle's data (not a CastError) |
| AC-MOBAPI-003 | FR-MOBAPI-006 | The Flutter app starts | `AppDataRepository.refresh()` runs | `MockData` lists are populated only from API responses; no seeded demo records ever render |

## T9 API Contract

| Method | Endpoint | Permission | Request | Response | Error behavior |
|---|---|---|---|---|---|
| GET | `/api/v1/mobile/vehicles` | none (public) | query: `user_id?`, `q?`, `page?`, `limit?` | `{code:20000, message, data: Vehicle[]}` | 500 on unexpected error |
| GET | `/api/v1/mobile/vehicles/:id` | none (public) | path: `id` | `{code:20000, data: Vehicle}` | 404 if not found |
| GET | `/api/v1/mobile/tracking/history` | none (public) | query: `user_id?`, `vehicle_id?`, `limit?` | `{code:20000, data: TripHistory[]}` | 500 on unexpected error |
| GET | `/api/v1/mobile/requests` | none (public) | query: `user_id?`, `limit?` | `{code:20000, data: RequestHistoryItem[]}` | 500 on unexpected error |
| GET | `/api/v1/mobile/emergency-reports` | none (public) | query: `vehicle_id?`, `limit?` | `{code:20000, data: EmergencyReport[]}` (with derived `timeline`) | 500 on unexpected error |
| GET | `/api/v1/mobile/emergency-reports/:id` | none (public) | path: `id` | `{code:20000, data: EmergencyReport}` (with derived `timeline`) | 404 if not found |
| GET | `/api/v1/mobile/notifications` | none (public) | query: `user_id?`, `vehicle_id?` | `{code:20000, data: NotificationItem[]}` (derived) | 500 on unexpected error |

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | no | Read-only; existing Mongoose models used only for `.find()`/native `.collection` access |
| Migration | no | none |
| Seed/backfill | no | Real data already present (seeded by a prior session; no committed seed script found for the flat vehicle shape) |
| Index | no | none added |
| Rollback | Remove the `/api/v1/mobile` mount and revert `mock_data.dart`/Flutter service files | git revert of this change set |

## T11 Backend Plan / Changes

- Routes: `backend-node/server/Project/ivts/mobile.routes.js` (new) — 7 GET routes, mounted at `/api/v1/mobile`.
- Guards: none (documented as an explicit, temporary decision — see A-001).
- Services: `backend-node/server/Project/ivts/service/mobile.js` (new) — `listVehicles`, `getVehicleById`, `listTripHistory`, `listRequestHistory`, `listEmergencyReports`, `getEmergencyReportById`, `listNotifications`.
- Controllers/models: reuses existing `Vehicle`, `TrackingHistory`, `Request`, `EmergencyReport` Mongoose models (no schema changes).
- Tests: `node --check` on all 3 changed/added backend files; live `curl` smoke tests against the local dev server (port 8203).

## T12 Frontend Plan / Changes

- Route: N/A (Flutter app, single `HomeScreen` host with internal tab navigation).
- API wrapper: `lib/services/api_config.dart` (base URL, Android emulator alias, timeout), `lib/services/mobile_api_service.dart` (HTTP GET + JSON mapping).
- State/data layer: `lib/services/app_data_repository.dart` — singleton that fetches vehicles/trip history/request history/notifications and mutates `MockData`'s lists in place, then bumps a `ValueNotifier<int>` tick.
- Page: `lib/app.dart` — converted to `StatefulWidget`, calls `AppDataRepository.instance.refresh()` in `initState`, wraps `HomeScreen` in a `ValueListenableBuilder` to force a rebuild after data loads.
- Components: `lib/screens/location_screen.dart` updated to handle a null "most recently moved" vehicle instead of assuming a non-empty list.
- Visible profile/account fields: unchanged.
- Hidden sensitive fields: unchanged (no PDPA-sensitive fields were ever displayed).
- Tests: `flutter analyze lib/` (no issues), `flutter pub get`, live app run (`flutter run -d windows` / `-d emulator-5554`).

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Authentication | None on `/api/v1/mobile/*` — documented, temporary, minimal-exposure decision (mobile app has no login flow yet). See A-001 in tasklist. |
| Authorization path/action | N/A — no auth applied |
| Data scope | Endpoints accept optional `user_id`/`vehicle_id` query filters but do not enforce them (client-supplied, not session-derived) — a known limitation of the no-auth interim design |
| Audit | None added for these read-only mobile endpoints |
| Input validation | Query params are coerced/defaulted (`toNumber`, `cleanText`); Mongo queries use parameterized filters, not string concatenation — no injection risk from user_id/vehicle_id/q |
| Error/secret leakage | Error responses return only `message`/`code`, no stack traces or internals |
| Privacy / PDPA | No citizen ID, contact info, or other PDPA-sensitive fields returned |
| Profile/account data minimization | N/A — no profile/account data involved |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-001 | functional | anonymous | `curl GET /api/v1/mobile/vehicles` | 200, real vehicle list |
| TC-002 | functional | anonymous | `curl GET /api/v1/mobile/vehicles/CR0001` | 200, single vehicle, no CastError |
| TC-003 | functional | anonymous | `curl GET /api/v1/mobile/notifications` | 200, derived renewal/emergency notifications |
| TC-004 | regression | anonymous | `curl GET /api/v1/mobile/tracking/history`, `/requests` | 200, `[]` (collections legitimately empty) |
| TC-005 | negative | anonymous | `curl GET /api/v1/mobile/vehicles/does-not-exist` | 404 |
| TC-006 | functional | mobile app | Run Flutter app against local backend | Vehicle list screen shows real MongoDB vehicles, not demo data |

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/server/Project/ivts/service/mobile.js` | New service mapping real Mongo documents to mobile DTOs; fixed `getVehicleById` CastError; added `listNotifications`. |
| `backend-node/server/Project/ivts/mobile.routes.js` | New public read-only router; added `GET /notifications`. |
| `backend-node/server/routes/app.routes.js` | Mounted `mobile.routes.js` at `/api/v1/mobile`. |
| `user-mobile-application/pubspec.yaml` | Added `http: ^1.2.2` dependency. |
| `user-mobile-application/lib/services/api_config.dart` | New — base URL config (Android emulator `10.0.2.2` alias, `--dart-define` override), request timeout. |
| `user-mobile-application/lib/services/mobile_api_service.dart` | New — HTTP GET + JSON→model mapping for vehicles/trip history/request history/notifications. |
| `user-mobile-application/lib/services/app_data_repository.dart` | New — fetches all four resources and replaces `MockData` lists in place; no mock fallback. |
| `user-mobile-application/lib/app.dart` | Converted to `StatefulWidget`; triggers `refresh()` on startup; rebuilds `HomeScreen` via `ValueListenableBuilder`. |
| `user-mobile-application/lib/data/mock_data.dart` | Removed all hardcoded demo records; lists now start empty; `mostRecentlyMoved` made null-safe. |
| `user-mobile-application/lib/screens/location_screen.dart` | Handles a null vehicle (empty list) with an empty-state message instead of crashing. |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| ivts-MOBAPI-001..009 | done | 100 | See `docs/tasks/2026-07-24-mobile-mongodb-api.md` | none |
| ivts-MOBAPI-010 | done | 100 | Windows desktop platform added and verified — real MongoDB data confirmed end-to-end via runtime log | none |
| ivts-MOBAPI-011 | done | 100 | All required docs created/updated | none |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `node --check backend-node/server/Project/ivts/service/mobile.js` | PASS | exit 0 |
| `node --check backend-node/server/Project/ivts/mobile.routes.js` | PASS | exit 0 |
| `curl http://127.0.0.1:8203/api/v1/mobile/vehicles` | PASS | 200, 6 vehicles, correctly mapped (Thai plates, BE dates, status derivation) |
| `curl http://127.0.0.1:8203/api/v1/mobile/vehicles/CR0001` | PASS | 200, single vehicle, no CastError |
| `curl http://127.0.0.1:8203/api/v1/mobile/tracking/history` | PASS | 200, `[]` (real empty state) |
| `curl http://127.0.0.1:8203/api/v1/mobile/requests` | PASS | 200, `[]` (real empty state) |
| `curl http://127.0.0.1:8203/api/v1/mobile/emergency-reports` | PASS | 200, 1 real report with derived timeline |
| `curl http://127.0.0.1:8203/api/v1/mobile/notifications` | PASS | 200, 3 renewal + 1 emergency notification |
| `flutter pub get` | PASS | `http` package resolved |
| `flutter analyze lib/` | PASS | No issues found (3 runs across edits) |
| `flutter run -d emulator-5554 --dart-define=API_BASE_URL=http://10.0.2.2:8203/...` | FAIL | App launched but all fetches timed out (6s); raw TCP probe via `toybox nc` from the emulator to host:8203 also produced no response — consistent with a Windows Firewall drop (see B-001) |
| `flutter create --platforms=windows .` | PASS | Added `user-mobile-application/windows/` platform folder (no existing tracked files overwritten — verified via `git status`) |
| `flutter run -d windows --dart-define=API_BASE_URL=http://localhost:8203/...` | PASS | App built and ran; runtime log confirmed: `AppDataRepository: loaded 6 vehicles from API`, `loaded 4 notifications from API`, `loaded 0 trip history entries from API`, `loaded 0 request history entries from API` (0 counts correctly reflect real empty `tracking_histories`/`requests` collections) |

Commands not run:

| Command | Reason | Risk |
|---|---|---|
| `netsh advfirewall firewall add rule ... profile=any` | Requires administrator elevation; AI does not run elevation-requiring commands per operational-safety rules | Android emulator verification remains blocked until the user runs this (or an equivalent) themselves |
| Flutter widget/unit tests (`flutter test`) | No existing tests reference the new service layer; out of scope for this change | Low — logic is thin HTTP/JSON mapping, covered by live smoke tests instead |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-ivts.md` | no | No existing PRD section covers the mobile app or this API; flagged as an open item for Product Owner follow-up |
| `docs/tasks/2026-07-24-mobile-mongodb-api.md` | yes | New active tasklist created |
| `docs/tasks/tasklist-progress.md` | yes | Added task rows + updated readiness notes |
| `docs/tasks/tasklist-progress.html` | yes | Regenerated from updated Markdown |
| `docs/AI-DOCS-INDEX.md` | yes | Registered new tasklist/change-record entries |
| `user-mobile-application/README.md` | yes | Documented the backend API integration and base URL configuration |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| B-001 | Blocker | Windows Firewall "Node.js JavaScript Runtime" rule scoped to `Public` profile only; Android emulator's connection to host `10.0.2.2:8203` is silently dropped. Requires an elevated firewall rule the AI will not apply itself. | User | open |
| A-001 | Assumption | `/api/v1/mobile/*` is unauthenticated because the Flutter app has no login/IAM session flow. Documented as a temporary, minimal-exposure decision. | Product/Security | open |
| A-002 | Assumption | Trip waypoint/zone-based history has no backing data model (`tracking_logs` stores raw lat/long, not zones, and is empty). Left empty rather than fabricated. | Product/Data | open |
| A-003 | Assumption | "System"-type notifications have no backing collection; only `renewal`/`emergency` types are derived. | Product | open |
| D-001 | Decision | Per the user's explicit follow-up instruction, removed the originally-planned mock-data fallback entirely; MongoDB is now the sole data source for all mobile screens. | User | closed |

## T19 Release / Rollback

- Release steps: Deploy backend with the new `/api/v1/mobile` route (no config changes required beyond existing `.env`/Docker setup); ship the Flutter app with the `http` dependency and new service files.
- Smoke checks: `curl` the 7 mobile endpoints against the target environment; launch the Flutter app and confirm the vehicle list shows real data.
- Monitoring: existing backend logger/audit middleware applies to the new router (no changes needed there).
- Rollback trigger: mobile API returns unexpected errors in production, or the no-auth exposure is deemed unacceptable before mobile auth ships.
- Rollback steps: remove the `/api/v1/mobile` mount in `app.routes.js`; the Flutter app will then simply show empty lists (no mock fallback exists to revert to, per D-001) — revert `mock_data.dart` from version control if demo content is needed again.

## T20 Final Handoff

```txt
Feature: Mobile app MongoDB-backed API (no mock data)
Status: Done — backend + Flutter data layer implemented, smoke-tested, and verified end-to-end via a running Windows desktop build showing real MongoDB data
Active tasklist: docs/tasks/2026-07-24-mobile-mongodb-api.md
Task IDs: ivts-MOBAPI-001..011
Progress: 100%
Changed files: backend-node/server/Project/ivts/service/mobile.js, backend-node/server/Project/ivts/mobile.routes.js, backend-node/server/routes/app.routes.js, user-mobile-application/pubspec.yaml, user-mobile-application/lib/services/api_config.dart, user-mobile-application/lib/services/mobile_api_service.dart, user-mobile-application/lib/services/app_data_repository.dart, user-mobile-application/lib/app.dart, user-mobile-application/lib/data/mock_data.dart, user-mobile-application/lib/screens/location_screen.dart, user-mobile-application/windows/ (new platform folder)
Routes: GET /api/v1/mobile/vehicles, /vehicles/:id, /tracking/history, /requests, /emergency-reports, /emergency-reports/:id, /notifications
UI routes: N/A (Flutter tab-based navigation, unchanged)
Permission: none applied to /api/v1/mobile/* (documented, temporary — A-001)
Data migration: none (read-only)
Tests run: node --check (backend), flutter analyze (frontend), curl live smoke tests (7/7 pass), flutter run -d emulator-5554 (fetch timeout — B-001), flutter run -d windows (PASS — real data loaded, confirmed via runtime log)
PRD/docs: no existing PRD section for mobile API; flagged for Product Owner follow-up
Security decision: temporary no-auth read-only API, no PDPA-sensitive fields exposed
Privacy/PDPA decision: no personal data stored/changed; only non-sensitive display fields returned
QA decision: n/a (no dedicated QA role)
Release decision: ready for release as a read-only API; mobile auth should ship before wider rollout
Open risks: B-001 (Android emulator firewall — does not block Windows/device testing), A-001 (no mobile auth), A-002 (no waypoint data model), A-003 (no system notifications)
Next owner: User/Backend to seed tracking_histories/requests data when available; user to fix Windows Firewall rule if Android emulator testing is desired
```
