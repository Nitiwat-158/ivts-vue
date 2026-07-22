# T1-T20 Change Record: Renewal Request Screen UI

| Field | Value |
|---|---|
| Change ID | ivts-RENW-2026-07-22 |
| Date | 2026-07-22 |
| Project | IVTS |
| Module | User Mobile App — Vehicle Details / Renewal Request |
| Type | Frontend UI — new screen + navigation |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

สร้างหน้า `RenewalRequestScreen` ตามรูปภาพที่ user แนบ และเชื่อมปุ่ม **Renewal Request** ในหน้า Details (`VehicleDetailsScreen`) ให้ navigate ไปยังหน้าใหม่ โดยดึงข้อมูลรถ (Vehicle) ไปแสดงผลด้านบน

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/screens/vehicle_details_screen.dart` | 119-120 | Found `_RenewalButton` which needed wiring. |
| `lib/screens/add_vehicle_screen.dart` | All | Used as a reference for text fields and upload rows styling. |

## T3 — Open Questions / Assumptions

| Item | Type | Detail | Owner |
|---|---|---|---|
| Submit action | Assumption | SUBMIT calls `Navigator.maybePop()` (no-op). Backend integration not in scope. | AI/User |
| Form validation | Assumption | No validation implemented. Not in scope per request. | AI/User |

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/screens/renewal_request_screen.dart` | NEW | Full Renewal Request form screen |
| `lib/screens/vehicle_details_screen.dart` | MODIFIED | Added import + wired `_RenewalButton` to new screen |

## T5–T14 — Implementation

### renewal_request_screen.dart (new file)
- **AppBar**: ← back arrow + "Renewal Request" title
- **Vehicle Card**:
  - Displays icon, `plateNumber`, `vehicleCode`, `brand`, `color`, and `model` passed from the `Vehicle` object.
- **Owner Section**:
  - Name: `_InputField`
  - Surname: `_InputField`
  - Citizen ID: `_InputField`
  - "The vehicle license plate": `_UploadRow`
- **SUBMIT**: `ElevatedButton` full width, primary dark red

### vehicle_details_screen.dart (patched)
- Added `import 'renewal_request_screen.dart';`
- Changed `_RenewalButton(onTap: () {})` to push `RenewalRequestScreen(vehicle: vehicle)`

## T15 — Implementation Summary

ปุ่ม "Renewal Request" ในหน้า Details จะ push หน้า `RenewalRequestScreen` ซึ่งแสดงข้อมูลรถคันที่เลือกอยู่ด้านบน และมีฟอร์มสำหรับกรอกข้อมูลเจ้าของรถเพื่อขอต่ออายุทะเบียน

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection | PASS | Layout matches screenshot and navigation logic passes `vehicle` argument correctly. |

## T17 — PRD / Docs Decision

No backend schema or business rule changes made yet (UI only). `docs/AI-DOCS-INDEX.md` must be updated to track the new task and change records.

## T18 — Security / PDPA

Form accepts `citizenID` which is sensitive personal data. Currently UI-only. Backend implementation must ensure this field is transmitted securely and not logged.

## T19 — Risks / Blockers

| Risk | Level | Mitigation |
|---|---|---|
| Validation missing | Low | To be added when hooking up backend |

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-22-renewal-request-screen.md`
- Change record: `docs/changes/2026-07-22-renewal-request-screen.md`
- New file: `lib/screens/renewal_request_screen.dart`
- Modified: `lib/screens/vehicle_details_screen.dart`
