# T1-T20 Change Record: Add Vehicle Screen UI

| Field | Value |
|---|---|
| Change ID | ivts-ADDV-2026-07-22 |
| Date | 2026-07-22 |
| Project | IVTS |
| Module | User Mobile App — My Vehicles / Add Vehicle |
| Type | Frontend UI — new screen + navigation |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

สร้างหน้า `AddVehicleScreen` ตามรูปภาพที่ user แนบ และเชื่อมปุ่ม FAB **Add Vehicle** ในหน้า My Vehicles (`VehiclesListScreen`) ให้ navigate ไปยังหน้าใหม่

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/models/vehicle.dart` | 1–35 | Vehicle fields: type, plateNumber, brand, model, color, ownerName |
| `lib/theme/app_theme.dart` | 3–14 | AppColors.primary, cardGrey, textSecondary, background |
| `lib/screens/vehicles_list_screen.dart` | 165–175 | FAB "Add Vehicle" was `onPressed: () {}` |
| `lib/screens/vehicle_details_screen.dart` | All | _DocumentRow/Upload row pattern reference |
| `lib/screens/emergency_request_screen.dart` | All | StatefulWidget form pattern reference |
| `docs/AI-WORKFLOW.md` | All | Workflow rules followed |

## T3 — Open Questions / Assumptions

| Item | Type | Detail | Owner |
|---|---|---|---|
| Submit action | Assumption | SUBMIT calls `Navigator.maybePop()` (no-op for actual save). Backend integration not in scope. | AI/User |
| Upload Add action | Assumption | Upload "Add" buttons call `() {}` (no-op). File picker integration not in scope. | AI/User |
| Form validation | Assumption | No validation implemented. Not in scope per request. | AI/User |

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/screens/add_vehicle_screen.dart` | NEW | Full Add Vehicle form screen |
| `lib/screens/vehicles_list_screen.dart` | MODIFIED | Added import + wired FAB to AddVehicleScreen |

## T5–T14 — Implementation

### add_vehicle_screen.dart (new file)
- **AppBar**: ← back arrow + "Add Vehicle" title
- **Vehicle Section** (`_SectionCard` with cardGrey background):
  - Type: `DropdownButton<String>` (values: Car, Motorcycle)
  - License Plate: `_InputField` (TextField, white background)
  - Province: `_InputField`
  - Brand: `_InputField`
  - Model: `_InputField`
  - Color: `_InputField`
- **Owner Section** (`_SectionCard`):
  - Name: `_InputField`
  - Surname: `_InputField`
  - Citizen ID: `_InputField` (numeric keyboard)
  - "Vehicle Registration Certificate": `_UploadRow` (primary dark red + white "Add" pill button)
  - "Photo Of The Vehicle License Plate": `_UploadRow`
- **SUBMIT**: `ElevatedButton` full width, primary dark red

### vehicles_list_screen.dart (patched)
- Added: `import 'add_vehicle_screen.dart';`
- Changed FAB `onPressed: () {}` → `Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddVehicleScreen()))`

## T15 — Implementation Summary

ปุ่ม FAB "Add Vehicle" ใน My Vehicles จะ push หน้า `AddVehicleScreen` ซึ่งแสดงฟอร์มกรอกข้อมูลรถและเจ้าของตามรูปภาพ ครบทุก field และ section

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection — add_vehicle_screen.dart | PASS | Layout matches screenshot: Vehicle section, Owner section, Upload rows, SUBMIT |
| Code inspection — vehicles_list_screen.dart | PASS | FAB wired correctly |
| Flutter hot reload | NOT RUN | Requires running Flutter env. Pattern mirrors existing push usage. Risk: low |

## T17 — PRD / Docs Decision

ไม่มีการเปลี่ยนแปลง API หรือ data model ใหม่ (form is UI-only, no backend). PRD ไม่ต้องอัปเดต. `docs/AI-DOCS-INDEX.md` ต้องอัปเดต.

## T18 — Security / PDPA

หน้า Add Vehicle รับ: type, licensePlate, province, brand, model, color, ownerName, surname, citizenID — citizenID เป็น personal sensitive data ต้องไม่ log หรือ persist โดยไม่ผ่าน consent. ฟอร์มปัจจุบัน UI-only ยังไม่ส่งไปยัง backend.

## T19 — Risks / Blockers

| Risk | Level | Mitigation |
|---|---|---|
| Flutter build not verified | Low | Follows existing Navigator.push pattern |
| Citizen ID not masked in UI | Low | UI-only; backend integration needs to handle masking |

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-22-add-vehicle-screen.md`
- New file: `lib/screens/add_vehicle_screen.dart`
- Modified: `lib/screens/vehicles_list_screen.dart`
- Open items: Submit/Upload/Validation actions are no-ops pending backend integration
- Next action: User to hot reload / test on device
