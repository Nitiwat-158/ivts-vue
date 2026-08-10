# T1-T20 Change Record: Request History — Emergency Detail Navigation

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-LOC-RHD-001 |
| Module | User Mobile App — Request History & Emergency Status |
| Date | 2026-08-09 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-09-request-history-emergency-detail.md` |

## T2 Requirement

- User request: รายการ Emergency Request ใน Request History กดเพื่อเปิดไปดูรายละเอียดของคำร้องนั้นๆ ด้วย emergencyId
- Business goal: ให้ผู้ใช้สามารถกดจากหน้า Profile > Request History เพื่อดูรายละเอียดและสถานะความคืบหน้าของ Emergency Request แต่ละรายการได้
- Success outcome: กดที่รายการ Emergency Request ใน Request History -> ส่ง emergencyId -> เปิดหน้า EmergencyStatusScreen(emergencyId) แสดงสถานะและข้อมูลของรายการนั้น

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Mobile screen (History) | `user-mobile-application/lib/screens/request_history_screen.dart` | `GestureDetector` ครอบ Card และเช็ค `request.title` |
| Mobile screen (Status) | `user-mobile-application/lib/screens/emergency_status_screen.dart` | `EmergencyStatusScreen({required this.emergencyId})` |
| Mobile API Service | `user-mobile-application/lib/services/mobile_api_service.dart` | `fetchEmergencyReportById(String id)` ส่ง HTTP GET `/emergency-reports/$id` |
| Backend service | `backend-node/server/Project/ivts/service/mobile.js` | `listRequestHistory` ส่ง `vehicleId: r._id` ซึ่งเป็น `emergencyId` |

## T4 Current Behavior (หลังแก้ไข)

- เมื่อกดที่รายการ Emergency Request ใน Request History ระบบจะอ่าน `request.vehicleId` (ซึ่งคือ `emergencyId`) แล้วเปิดไปยังหน้า `EmergencyStatusScreen(emergencyId)` ของคำร้องรายการนั้นๆ ทันที

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Frontend | yes | แก้ไข `request_history_screen.dart` |
| Backend | no | มี API `GET /emergency-reports/:id` รองรับอยู่แล้ว |

## T12 Frontend Plan / Changes

- `request_history_screen.dart`: Import `emergency_status_screen.dart` และเพิ่ม `GestureDetector(onTap: ...)` เพื่อเปิด `EmergencyStatusScreen(emergencyId: request.vehicleId)`

## T15 Implementation Summary

| File | Change |
|---|---|
| `user-mobile-application/lib/screens/request_history_screen.dart` | เพิ่ม `import 'emergency_status_screen.dart'` และนำ `GestureDetector` ครอบรายการ Card เพื่อเปิดหน้า EmergencyStatusScreen ด้วย `emergencyId` |

## T20 Final Handoff

```txt
Feature: Request History Emergency Detail Navigation
Status: Done
Active tasklist: docs/tasks/2026-08-09-request-history-emergency-detail.md
Task IDs: ivts-LOC-RHD-001 ถึง 003
Progress: 100%
Changed files: request_history_screen.dart, mobile_api_service.dart
```
