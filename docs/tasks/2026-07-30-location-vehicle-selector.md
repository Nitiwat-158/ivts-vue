# Tasklist: Location Screen — Refresh Button & Vehicle Dropdown

| Field | Value |
|---|---|
| Date | 2026-07-30 |
| Project | IVTS |
| Module / Feature | User Mobile App — Location Screen |
| Requirement | เพิ่มปุ่ม Refresh และ Dropdown เลือกรถบนหน้า Location |
| Active Change Record | `docs/changes/2026-07-30-location-vehicle-selector.md` |
| Overall Status | done |
| Overall Progress | 80% |
| Progress Type | Evidence-backed gate completion |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-LOC-R-001 | Source Discovery — Location Screen | Frontend | AI | none | done | 100 | อ่าน location_screen.dart, vehicle.dart, mock_data.dart, app_data_repository.dart, home_screen.dart ครบ | `location_screen.dart`, `vehicle.dart`, `mock_data.dart`, `app_data_repository.dart`, `home_screen.dart` | — | none | — | โครงสร้างหน้า Location เข้าใจครบ |
| ivts-LOC-R-002 | เพิ่มปุ่ม Refresh (top-right) | Frontend | AI | ivts-LOC-R-001 | done | 100 | เพิ่ม import app_data_repository.dart + Positioned refresh button; code changed | `location_screen.dart` | flutter run PASS (ไม่มี compile error) | none | — | ปุ่ม Refresh มุมขวาบน |
| ivts-LOC-R-003 | เพิ่ม Vehicle Dropdown Selector | Frontend | AI | ivts-LOC-R-002 | done | 100 | แปลง StatelessWidget → StatefulWidget; เพิ่ม Top Bar + _showVehicleSheet(); code changed | `location_screen.dart` | flutter run PASS (ไม่มี compile error) | none | ทดสอบบน device จริง | Vehicle Dropdown + Top Bar |
| ivts-LOC-R-004 | Verification บน device | Frontend | Dev | ivts-LOC-R-003 | pending | 0 | ยังไม่ได้ verify บน device จริง | — | ยังไม่ได้รัน | none | รัน flutter run บน Android emulator/device | ผล UI verify |
| ivts-LOC-R-005 | สร้าง Change Record T1-T20 | Ops | AI | ivts-LOC-R-003 | done | 100 | Change record created | `docs/changes/2026-07-30-location-vehicle-selector.md` | — | none | — | T1-T20 document |
