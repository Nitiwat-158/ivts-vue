# User Mobile Application

This folder contains the Flutter-based mobile application for end users.
It is intentionally separated from the existing web frontend under `frontend-vue/`.

## Structure

- `lib/` contains the application source code.
- `test/` contains widget tests.
- `pubspec.yaml` defines the Flutter package metadata and dependencies.

## Notes

- Keep mobile-specific code here only.
- Do not mix mobile and web code in the same app structure.
- This app is independent from the Vue web project.

## Backend API Integration

All app data comes exclusively from the backend mobile API, which reads from MongoDB. There is no mock/demo data fallback — if the API is unreachable or a collection has no records, the corresponding screen renders an empty state instead of fake content.

- Base URL: `lib/services/api_config.dart` picks `http://10.0.2.2:8203/api/v1/mobile` on Android (host-loopback alias) or `http://localhost:8203/api/v1/mobile` otherwise.
- Override at run time: `flutter run --dart-define=API_BASE_URL=http://<host>:8203/api/v1/mobile`.
- Backend endpoints consumed: `GET /vehicles`, `/vehicles/:id`, `/tracking/history`, `/requests`, `/emergency-reports`, `/emergency-reports/:id`, `/notifications` (see `backend-node/server/Project/ivts/mobile.routes.js`).
- Data is fetched once on app start by `lib/services/app_data_repository.dart` (`AppDataRepository.instance.refresh()`), which populates the in-memory lists in `lib/data/mock_data.dart` in place.
- The backend dev server must be running (`cd backend-node && npm run start:local`, default port `8203`) with MongoDB reachable for the app to show data.
- Known limitation: on the Android emulator, a host Windows Firewall rule may block `10.0.2.2:8203`; see `docs/tasks/2026-07-24-mobile-mongodb-api.md` (B-001) for the fix.

See `docs/tasks/2026-07-24-mobile-mongodb-api.md` and `docs/changes/2026-07-24-mobile-mongodb-api.md` for full source evidence and decisions.
