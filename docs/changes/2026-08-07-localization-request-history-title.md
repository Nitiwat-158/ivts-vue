# T1-T20 Change Record: Localization — Request History Title Translation

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-LOC-RHT-001 |
| Module | User Mobile App — Request History |
| Date | 2026-08-07 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-07-localization-request-history-title.md` |

## T2 Requirement

- User request: หน้า Request History ตรงคำว่า "Vehicle registration" ทำไมถึงไม่ได้สลับภาษาให้
- Business goal: ให้แสดงภาษาไทย/อังกฤษของหัวข้อคำร้องในหน้าประวัติการแจ้งเรื่องตามภาษาที่เลือกในแอป
- Success outcome: เลือกภาษาไทยแสดง "คำร้องลงทะเบียนรถ" / "คำร้องต่ออายุ", เลือกภาษาอังกฤษแสดง "Vehicle registration" / "Renewal"

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Mobile screen | `user-mobile-application/lib/screens/request_history_screen.dart` | Line 148 `Text(request.title)` |
| Backend service | `backend-node/server/Project/ivts/service/mobile.js` | Line 290 `title: r.request_type === 'renew' ? 'Renewal' : 'Vehicle registration'` |
| Locale provider | `user-mobile-application/lib/providers/locale_provider.dart` | เพิ่ม `translateRequestTitle()` |

## T4 Current Behavior (ก่อนแก้)

- `request.title` ถูกนำมาแสดงผลตรงๆ ใน `Text(request.title)` โดยไม่ผ่านระบบ Localization

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Frontend | yes | แก้ไข locale_provider.dart และ request_history_screen.dart |
| Backend | no | ไม่ต้องแก้ Backend API |

## T12 Frontend Plan / Changes

- `locale_provider.dart`: เพิ่ม `translateRequestTitle(String rawTitle)`
- `request_history_screen.dart`: เปลี่ยนเป็น `Text(loc.translateRequestTitle(request.title))`

## T15 Implementation Summary

| File | Change |
|---|---|
| `user-mobile-application/lib/providers/locale_provider.dart` | เพิ่ม `translateRequestTitle()` |
| `user-mobile-application/lib/screens/request_history_screen.dart` | เรียกใช้ `loc.translateRequestTitle(request.title)` |

## T20 Final Handoff

```txt
Feature: Request History Title Localization
Status: Done
Active tasklist: docs/tasks/2026-08-07-localization-request-history-title.md
Task IDs: ivts-LOC-RHT-001 ถึง 004
Progress: 100%
Changed files: locale_provider.dart, request_history_screen.dart
```
