# T1-T20 Change Record: Request History — Vehicle Registration Read-Only Detail View

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-LOC-RHVR-001 |
| Module | User Mobile App — Request History & Add Vehicle Read-Only View |
| Date | 2026-08-09 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-09-request-history-vehicle-registration-detail.md` |

## T2 Requirement

- User request: เมื่อผู้ใช้กดรายการ Vehicle Registration ใน Request History ให้เปิดหน้า UI AddVehicleScreen ในรูปแบบ Read-only แสดงข้อมูลรถแบบแก้ไขไม่ได้
- Business goal: ผู้ใช้สามารถกดดูรายละเอียดข้อมูลรถที่ลงทะเบียนไว้จากหน้า Request History ได้ในรูปแบบ Form เดิมของ Add Vehicle โดยไม่สามารถแก้ไข พิมพ์ หรือกดส่งข้อมูลใหม่ได้
- Success outcome: กดที่รายการ Vehicle Registration ใน Request History ➔ เปิดหน้า AddVehicleScreen(isReadOnly: true) ➔ โหลดและแสดงข้อมูลรถแบบ Read-only ➔ ซ่อนปุ่ม Submit

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Mobile screen (Add Vehicle) | `user-mobile-application/lib/screens/add_vehicle_screen.dart` | เพิ่ม `isReadOnly` & `vehicle` parameters, ปิดการแก้ไข `_InputField` และซ่อนปุ่ม `Submit` |
| Mobile screen (History) | `user-mobile-application/lib/screens/request_history_screen.dart` | `GestureDetector.onTap` เปิด `AddVehicleScreen(vehicle: matchingVehicle, isReadOnly: true)` |
| Mobile API & Data | `user-mobile-application/lib/data/mock_data.dart` | `MockData.vehicles` มีข้อมูลรถครบถ้วนจาก API `GET /api/v1/mobile/vehicles` |

## T4 Current Behavior (หลังแก้ไข)

- เมื่อกดรายการ Vehicle Registration ใน Request History แอปจะค้นหาข้อมูลรถและเปิดหน้า `AddVehicleScreen` ในรูปแบบ Read-only
- ข้อมูลรถทุกช่องแสดงเป็น Read-only (สีเทา) พิมพ์แก้ไขไม่ได้ และปุ่ม Submit ถูกซ่อนไว้

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Frontend | yes | แก้ไข `add_vehicle_screen.dart` และ `request_history_screen.dart` |
| Backend | no | มี API `GET /api/v1/mobile/vehicles` และ `GET /api/v1/mobile/requests` รองรับแล้ว |

## T15 Implementation Summary

| File | Change |
|---|---|
| `user-mobile-application/lib/screens/add_vehicle_screen.dart` | เพิ่ม `isReadOnly` & `vehicle` parameters, กำหนดค่าเริ่มต้นใน `initState()`, เพิ่ม `enabled` ใน `_InputField` และซ่อนปุ่ม Submit |
| `user-mobile-application/lib/screens/request_history_screen.dart` | อัปเดต `onTap` ของ Vehicle Registration ให้ค้นหาข้อมูลรถและเปิดหน้า `AddVehicleScreen(isReadOnly: true)` |

## T20 Final Handoff

```txt
Feature: Request History Vehicle Registration Read-Only Detail View
Status: Done
Active tasklist: docs/tasks/2026-08-09-request-history-vehicle-registration-detail.md
Task IDs: ivts-LOC-RHVR-001 ถึง 004
Progress: 100%
Changed files: add_vehicle_screen.dart, request_history_screen.dart
```
