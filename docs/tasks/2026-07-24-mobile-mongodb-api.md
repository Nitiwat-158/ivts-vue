# Tasklist: Mobile App MongoDB-Backed API (No Mock Data)

| Field | Value |
|---|---|
| Date | 2026-07-24 |
| Project | IVTS |
| Module / Feature | Backend mobile API (`/api/v1/mobile`) + Flutter `user-mobile-application` data layer |
| Requirement | Create a MongoDB-backed API for the Flutter mobile app; replace all hardcoded mock data with live data from MongoDB. Per follow-up user instruction, MongoDB is the sole data source — no mock-data fallback. |
| Source Request | "ทำการสร้าง API เชื่อมต่อกับ mongodb ให้หน่อย แล้วนำข้อมูลจาก mongodb มาแทน mock_data..." then "ทำการใช้ข้อมูลจาก mongodb ทั้งหมด ไม่ต้องใช้ mock_data" |
| Active Change Record | `docs/changes/2026-07-24-mobile-mongodb-api.md` |
| Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed source-first rules; documented assumptions instead of guessing. |
| Live DB shape | `docker exec ivts-vue-mongodb-1 mongosh IVTS --quiet --eval "printjson(db.vehicles.findOne())"` (and same for `owner_vehicles`, `users`, `tracking_histories`, `tracking_logs`, `requests`, `emergency_report`) | Real stored documents use a flat, mobile-ready shape that does **not** match the declared Mongoose schemas (e.g. `vehicles` uses `plate_number`/`vehicle_code`/`validity_expiry`/`last_location`, not `license_plate`/`vehicle_numeric_id`). `tracking_histories`, `requests`, `tracking_logs` are currently empty (0 documents, confirmed via MongoDB Compass storage stats). `emergency_report` has 1 real document matching its schema. |
| Backend service | `backend-node/server/Project/ivts/service/mobile.js` | Maps real Mongo documents (not the declared schema fields) into the mobile app's DTO shapes; documents all assumptions in the file header. |
| Backend routes | `backend-node/server/Project/ivts/mobile.routes.js` | Public, unauthenticated, read-only router — documented as a temporary decision since the mobile app has no login/IAM session. |
| Route mount | `backend-node/server/routes/app.routes.js` | `/api/v1/mobile` mounted alongside existing `/api/v1/ivts`, `/api/v1/setting`, `/api/v1/security`. |
| Flutter API layer | `user-mobile-application/lib/services/api_config.dart`, `mobile_api_service.dart`, `app_data_repository.dart` | HTTP client + JSON mapping + in-place `MockData` list replacement, triggered once from `lib/app.dart`. |
| Flutter dependency | `user-mobile-application/pubspec.yaml` | Added `http: ^1.2.2`; `flutter pub get` succeeded. |
| Mock data removal | `user-mobile-application/lib/data/mock_data.dart` | All hardcoded demo records removed; lists now start empty and are populated only by `AppDataRepository`. `mostRecentlyMoved` made null-safe. |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-MOBAPI-001 | Source discovery (backend + Flutter) | Orchestrator | AI | none | done | 100 | Read ivts routes/models/services and Flutter models/screens/mock_data | `ivts.routes.js`, model files, `mock_data.dart`, screen files | n/a | none | — | Source map |
| ivts-MOBAPI-002 | Discover live MongoDB schema (source of truth over declared schema) | Backend | AI | ivts-MOBAPI-001 | done | 100 | `mongosh` queries against running `ivts-vue-mongodb-1` container revealed real field names diverge from Mongoose schemas | mongosh output (see file header comments in `service/mobile.js`) | Manual query verification | none | — | Documented live schema evidence |
| ivts-MOBAPI-003 | Implement backend mobile service + routes | Backend | AI | ivts-MOBAPI-002 | done | 100 | Full rewrite of `service/mobile.js` to match real field names; new `mobile.routes.js`; mounted in `app.routes.js` | `service/mobile.js`, `mobile.routes.js`, `app.routes.js` | `node --check` PASS on all 3 files | none | — | Working backend module |
| ivts-MOBAPI-004 | Fix `getVehicleById` ObjectId CastError | Backend | AI | ivts-MOBAPI-003 | done | 100 | Switched to `Vehicle.collection.findOne({_id: id})` to bypass Mongoose ObjectId cast on string `_id` | `service/mobile.js` | `curl http://127.0.0.1:8203/api/v1/mobile/vehicles/CR0001` → 200 with correct data | none | — | Fixed endpoint |
| ivts-MOBAPI-005 | Add derived `/notifications` endpoint | Backend | AI | ivts-MOBAPI-003 | done | 100 | Derives renewal notifications from vehicle expiry status + emergency notifications from `emergency_report`; no dedicated notifications collection exists | `service/mobile.js` (`listNotifications`), `mobile.routes.js` | `curl http://127.0.0.1:8203/api/v1/mobile/notifications` → 200, real derived data (3 renewal + 1 emergency) | none | — | Working endpoint |
| ivts-MOBAPI-006 | Live smoke test all backend endpoints | Backend | AI | ivts-MOBAPI-004,ivts-MOBAPI-005 | done | 100 | Ran curl against local dev server (port 8203, `.env.local`) with real Docker MongoDB | `docker-compose.yml`, `.env.local` | `GET /vehicles`, `/vehicles/:id`, `/tracking/history`, `/requests`, `/emergency-reports`, `/emergency-reports/:id`, `/notifications` all return 200 with correct/expected data | none | — | Verified live API |
| ivts-MOBAPI-007 | Add Flutter HTTP client + API service layer | Frontend | AI | ivts-MOBAPI-006 | done | 100 | Added `http` dependency; created `api_config.dart`, `mobile_api_service.dart` mapping JSON → `Vehicle`/`TripHistory`/`RequestHistoryItem`/`NotificationItem` | `pubspec.yaml`, `lib/services/*.dart` | `flutter analyze lib/` → No issues found | none | — | Working API client |
| ivts-MOBAPI-008 | Remove all hardcoded mock content; MongoDB-only sourcing | Frontend | AI | ivts-MOBAPI-007 | done | 100 | Emptied all `MockData` lists (vehicles, tripHistory, requestHistory, notifications, tripWaypoints, emergencyTimeline); `AppDataRepository` populates them from the API only, with no mock fallback | `mock_data.dart`, `app_data_repository.dart` | `flutter analyze lib/` → No issues found | none | — | MongoDB is sole data source |
| ivts-MOBAPI-009 | Guard screens against empty vehicle list | Frontend | AI | ivts-MOBAPI-008 | done | 100 | `MockData.mostRecentlyMoved` made nullable; `location_screen.dart` shows an empty-state message instead of crashing on `List.first` when no vehicles are loaded | `mock_data.dart`, `location_screen.dart` | `flutter analyze lib/` → No issues found | none | — | Crash-safe empty states |
| ivts-MOBAPI-010 | End-to-end Flutter build verification | Frontend | AI | ivts-MOBAPI-009 | done | 100 | Added Windows desktop platform (`flutter create --platforms=windows .`) and ran `flutter run -d windows --dart-define=API_BASE_URL=http://localhost:8203/api/v1/mobile`. Confirmed via runtime log: `AppDataRepository: loaded 6 vehicles from API`, `loaded 4 notifications from API`, `loaded 0 trip history entries from API`, `loaded 0 request history entries from API` (0 counts are correct — those collections are empty in real MongoDB). Android emulator run still blocked by Windows Firewall (B-001). | `user-mobile-application/windows/` (new), terminal log | Live `flutter run -d windows` run — app started, loaded real data, no crash | none | Address B-001 if Android verification is required | Verified running app with real MongoDB data |
| ivts-MOBAPI-011 | Document tasklist, change record, docs index, README | Ops | AI | ivts-MOBAPI-010 | done | 100 | This file + change record + `tasklist-progress.md`/`.html` + `AI-DOCS-INDEX.md` + mobile `README.md` all updated | this file | n/a | none | none | Complete doc set |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| `node --check` (mobile.js, mobile.routes.js, app.routes.js) | PASS | Exit code 0 |
| `curl http://127.0.0.1:8203/api/v1/mobile/vehicles` | PASS | 200, 6 real vehicles mapped correctly |
| `curl http://127.0.0.1:8203/api/v1/mobile/vehicles/CR0001` | PASS | 200, after CastError fix |
| `curl http://127.0.0.1:8203/api/v1/mobile/tracking/history` | PASS | 200, `[]` (collection empty — real state) |
| `curl http://127.0.0.1:8203/api/v1/mobile/requests` | PASS | 200, `[]` (collection empty — real state) |
| `curl http://127.0.0.1:8203/api/v1/mobile/emergency-reports` | PASS | 200, 1 real report with derived timeline |
| `curl http://127.0.0.1:8203/api/v1/mobile/notifications` | PASS | 200, 3 renewal + 1 emergency notification derived from real data |
| `flutter pub get` | PASS | `http` dependency resolved |
| `flutter analyze lib/` | PASS | No issues found (run 3 times across edits) |
| `flutter run -d emulator-5554` | BLOCKED | Fetches timed out — emulator cannot reach `10.0.2.2:8203`; diagnosed as Windows Firewall scoping (see B-001) |
| `flutter run -d windows` | PASS | Real data confirmed end-to-end: `AppDataRepository: loaded 6 vehicles from API`, `loaded 4 notifications from API`, `loaded 0 trip history entries from API`, `loaded 0 request history entries from API` (0s are correct, matching real empty collections) |

## Blockers / Open Questions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| B-001 | Blocker | Windows Firewall rule "Node.js JavaScript Runtime" is scoped to `Profiles: Public` only; the Android emulator's virtual network connection to the host on port 8203 is silently dropped (confirmed via `toybox nc` raw HTTP probe from the emulator — no response, no refusal, consistent with a firewall drop). Fixing requires an elevated `netsh advfirewall firewall add rule ... profile=any` command, which requires administrator privileges. Per operational-safety rules, the AI did not attempt to elevate/bypass this. | User (run as admin) | open |
| A-001 | Assumption | Mobile API routes are mounted without `account.onCheckAuthorization` because the Flutter app has no login/IAM session flow at all. This is a temporary, minimal-exposure decision (read-only, no PDPA-sensitive fields such as citizen_id returned). Real mobile authentication is a follow-up. | Product/Security | open |
| A-002 | Assumption | "Trip waypoints" (zone entry/exit/checkpoint events shown in `history_detail_screen.dart`) have no backing MongoDB data model — `tracking_logs` only stores raw lat/long CCTV detections, not named zones, and is currently empty. No backend endpoint was fabricated for this; the list stays empty until a real zone/geofence data source exists. | Product/Data | open |
| A-003 | Assumption | "System"-type notifications (e.g. traffic announcements) have no backing collection; `listNotifications` only derives `renewal` and `emergency` types from real data. | Product | open |

## Final Handoff Link

- Change record: `docs/changes/2026-07-24-mobile-mongodb-api.md`
