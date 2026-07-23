# T1-T20 Change Record: Home Location Map Navigation

| Field | Value |
|---|---|
| Change ID | ivts-HLM-2026-07-22 |
| Date | 2026-07-22 |
| Project | IVTS |
| Module | User Mobile App — Home / Vehicle Card |
| Type | Frontend UI — navigation update |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

ตรงหน้า Home ภายในการ์ดรถแต่ละคัน (VehicleCard) มีส่วนแสดงแผนที่ "แตะเพื่อดูเส้นทางแบบเต็มจอ" เมื่อกดแล้วให้ Navigate ไปยังหน้า `LocationScreen` โดยแนบข้อมูลรถคันนั้นไปด้วย

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/widgets/vehicle_card.dart` | 107-128 | Found the map placeholder `Container` which lacked interaction |
| `lib/screens/location_screen.dart` | All | Confirmed `LocationScreen` needed a back button when pushed |

## T3 — Open Questions / Assumptions

None.

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/widgets/vehicle_card.dart` | MODIFIED | Added import + wrapped map container in `GestureDetector` to push `LocationScreen` |
| `lib/screens/location_screen.dart` | MODIFIED | Added floating back button for when the screen is pushed |

## T5–T14 — Implementation

### vehicle_card.dart (patched)
- Added `import '../screens/location_screen.dart';`
- Wrapped the map `Container` with a `GestureDetector`.
- Configured `onTap` to push `LocationScreen(initialVehicle: vehicle)`.

### location_screen.dart (patched)
- Added a floating back button (positioned top-left) that only appears if `Navigator.of(context).canPop()` is true.
- Ensures users can return to the Home screen after viewing the map full-screen.

## T15 — Implementation Summary

เมื่อผู้ใช้แตะที่ส่วนจำลองแผนที่ ("แตะเพื่อดูเส้นทางแบบเต็มจอ") บนการ์ดรถในหน้า Home ระบบจะนำทางไปยังหน้าแสดงตำแหน่งรถ (`LocationScreen`) พร้อมโฟกัสที่รถคันที่ผู้ใช้เลือก

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection | PASS | Navigation logic passes the `vehicle` argument correctly. |

## T17 — PRD / Docs Decision

No backend schema or business rule changes made (UI navigation only). `docs/AI-DOCS-INDEX.md` must be updated to track the new task and change records.

## T18 — Security / PDPA

No changes to data handling.

## T19 — Risks / Blockers

None.

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-22-home-location-map.md`
- Change record: `docs/changes/2026-07-22-home-location-map.md`
- Modified: `lib/widgets/vehicle_card.dart`
- Modified: `lib/screens/location_screen.dart`
