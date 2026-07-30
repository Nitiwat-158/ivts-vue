# T1-T20 Change Record: Location Screen — Refresh Button & Vehicle Dropdown

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-LOC-R-003 |
| Module | User Mobile App — Location Screen |
| Date | 2026-07-30 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-30-location-vehicle-selector.md` |

## T2 Requirement

- User request: เพิ่มปุ่ม Refresh มุมขวาบน และ Dropdown สำหรับเลือกรถในหน้า Location
- Business goal: ให้ผู้ใช้สามารถเลือกดูตำแหน่งรถที่ต้องการได้โดยตรงจากหน้า Location โดยไม่ต้องกลับไปที่หน้า Vehicles
- Success outcome: กด Dropdown เลือกรถได้ Bottom Card อัปเดตตามรถที่เลือก กด Refresh โหลดข้อมูลรถใหม่จาก API

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Mobile screen | `user-mobile-application/lib/screens/location_screen.dart` | โครงสร้าง Stack, FlutterMap, Bottom Card |
| Data model | `user-mobile-application/lib/models/vehicle.dart` | fields: plateNumber, vehicleCode, type, lastLocation |
| Data source | `user-mobile-application/lib/data/mock_data.dart` | MockData.vehicles[] — populated from API via AppDataRepository |
| Data repository | `user-mobile-application/lib/services/app_data_repository.dart` | refresh() method + refreshTick notifier |
| Parent screen | `user-mobile-application/lib/screens/home_screen.dart` | LocationScreen(initialVehicle) call pattern |
| Privacy / PDPA | ไม่มีข้อมูลส่วนบุคคลใหม่ — แสดงเฉพาะ plateNumber, vehicleCode, lastLocation ที่มีอยู่แล้ว | n/a |

## T4 Current Behavior (ก่อนแก้)

- Location screen เป็น StatelessWidget รับ `Vehicle? initialVehicle` จาก HomeScreen
- ไม่มีปุ่ม Refresh บนหน้า
- ไม่มี mechanism เลือกรถในหน้า Location
- ปุ่ม Back และ Location icon อยู่แยกกันใน Stack

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Frontend | yes | แก้ไข location_screen.dart |
| Backend | no | ไม่มีการเปลี่ยน API |
| Data Model | no | ไม่มีการเปลี่ยน schema |
| Security IAM | no | ไม่มี permission เปลี่ยน |

## T6 Scope

In scope:
- ปุ่ม Refresh เรียก AppDataRepository.instance.refresh()
- Top Bar: Back | Vehicle Dropdown Pill | Refresh
- Bottom Sheet แสดงรายชื่อรถจาก MockData.vehicles
- StatefulWidget เพื่อเก็บ _selectedVehicle state

Out of scope:
- ไม่แก้ Backend หรือ API
- ไม่ย้าย Marker บนแผนที่ตามพิกัดรถจริง (ยัง hardcode)
- ไม่แก้ไฟล์อื่นนอกจาก location_screen.dart

## T11 Backend Plan / Changes

ไม่มีการเปลี่ยนแปลง Backend

## T12 Frontend Plan / Changes

- Route: ไม่เปลี่ยน
- Page: `location_screen.dart`
  - เปลี่ยนจาก `StatelessWidget` → `StatefulWidget`
  - เพิ่ม state: `_selectedVehicle`
  - เพิ่ม method: `_showVehicleSheet()` — showModalBottomSheet รายชื่อรถ
  - จัดเรียง Top Bar ใหม่เป็น Row: Back | Dropdown Pill | Refresh
  - ลบ Positioned Back button เดิมออก รวมเข้า Top Bar แทน
  - Bottom Card อ่านจาก `_selectedVehicle` แทน `initialVehicle`

## T15 Implementation Summary

| File | Change |
|---|---|
| `user-mobile-application/lib/screens/location_screen.dart` | StatelessWidget → StatefulWidget; เพิ่ม Top Bar, _showVehicleSheet(), Vehicle Dropdown, Refresh button |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| ivts-LOC-R-001 | done | 100 | Source discovery complete | — |
| ivts-LOC-R-002 | done | 100 | Refresh button added, flutter run PASS | — |
| ivts-LOC-R-003 | done | 100 | Vehicle dropdown added, flutter run PASS | ทดสอบบน device จริง |
| ivts-LOC-R-004 | pending | 0 | ยังไม่ verify บน device | รัน flutter run บน Android emulator/device |
| ivts-LOC-R-005 | done | 100 | Change record created | — |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `flutter run` | PASS | App compiles and runs ไม่มี error — 2026-07-30 |

Commands not run:

| Command | Reason | Risk |
|---|---|---|
| UI verification บน Android device | ยังไม่ได้ verify UI จริง | Low — code structure ถูกต้องตาม Flutter pattern |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-ivts.md` | no | Feature เป็น UI enhancement เล็กน้อย ไม่กระทบ PRD |
| `docs/tasks/tasklist-progress.md` | yes | เพิ่มแถว ivts-LOC-R tasks |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| A-001 | Assumption | Marker บนแผนที่ยังคง hardcode LatLng เดิม — ไม่ขยับตามรถที่เลือก | AI | closed |
| A-002 | Assumption | MockData.vehicles[] มีข้อมูลรถจาก API อยู่แล้วก่อนเข้าหน้า Location | AI | closed |

## T19 Release / Rollback

- Release steps: รัน `flutter run` บน device
- Smoke checks: กด Dropdown → เห็นรายชื่อรถ → เลือกรถ → Bottom Card อัปเดต; กด Refresh → ข้อมูลโหลดใหม่
- Rollback: revert `location_screen.dart` กลับ StatelessWidget เดิม

## T20 Final Handoff

```txt
Feature: Location Screen — Refresh Button & Vehicle Dropdown
Status: Done (pending UI verification on device)
Active tasklist: docs/tasks/2026-07-30-location-vehicle-selector.md
Task IDs: ivts-LOC-R-001 ถึง ivts-LOC-R-005
Progress: 80% (T16 device verification pending)
Changed files: user-mobile-application/lib/screens/location_screen.dart
Routes: ไม่มีการเปลี่ยน route
UI routes: หน้า Location (tab index 2 ใน HomeScreen)
Permission: ไม่มีการเปลี่ยน
Data migration: ไม่มี
Tests run: flutter run PASS (2026-07-30)
PRD/docs: ไม่ต้องอัปเดต PRD
Security decision: ไม่มีข้อมูลส่วนบุคคลใหม่
Privacy/PDPA decision: n/a
QA decision: UI verify บน device ยังค้างอยู่
Release decision: พร้อม release หลัง UI verify
Open risks: Marker ยัง hardcode พิกัด; UI verify บน device ยังไม่ได้ทำ
Next owner: Dev — รัน flutter run verify UI บน Android device
```
