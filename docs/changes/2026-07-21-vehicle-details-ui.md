# T1-T20 Change Record: Vehicle Details Screen UI

| Field | Value |
|---|---|
| Change ID | ivts-VDET-2026-07-21 |
| Date | 2026-07-21 |
| Project | IVTS |
| Module | User Mobile App — My Vehicles / Vehicle Details |
| Type | Frontend UI enhancement |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

ปรับ UI หน้า `VehicleDetailsScreen` ให้ตรงตามรูปภาพที่ user แนบ และเชื่อมปุ่ม **More** ในหน้า My Vehicles (`VehiclesListScreen`) ให้ navigate ไปยัง `VehicleDetailsScreen` พร้อมส่งข้อมูล vehicle ของรถคันนั้นๆ

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/models/vehicle.dart` | 1–35 | Vehicle model fields |
| `lib/data/mock_data.dart` | 7–40 | Mock vehicle data (สน 1669 / Honda Accord) |
| `lib/theme/app_theme.dart` | 3–14 | AppColors: primary, warningAmber, cardGrey |
| `lib/screens/vehicles_list_screen.dart` | 144–149 | More button (was empty) |
| `lib/screens/vehicle_details_screen.dart` | 1–46 | Existing basic screen (overwritten) |
| `docs/AI-WORKFLOW.md` | All | Workflow rules followed |

## T3 — Open Questions / Assumptions

| Item | Type | Detail | Owner |
|---|---|---|---|
| Edit icon action | Assumption | Edit pencil currently calls `() {}` (no-op). Edit flow not in scope. | AI/User |
| View button action | Assumption | Both View buttons call `() {}` (no-op). Document viewing not in scope. | AI/User |
| Renewal Request action | Assumption | Navigates to `() {}` (no-op). Renewal flow not in scope. | AI/User |

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/screens/vehicle_details_screen.dart` | MODIFIED | Full UI redesign: info card, document rows, renewal button |
| `lib/screens/vehicles_list_screen.dart` | MODIFIED | Added import + wired More button to VehicleDetailsScreen |

## T5–T14 — Implementation

### vehicle_details_screen.dart (overwritten)
- **AppBar**: ← back arrow + "Details" title (AppColors.primary)
- **Info Card** (AppColors.cardGrey background):
  - Car icon (white box) + plateNumber (bold primary) + vehicleCode
  - Edit pencil icon (top right)
  - InfoRow list: Brand, Model, Color, Date of Issue, Date of Expiry
  - Expiry warning text in AppColors.primary: "เหลืออีก N วันก่อนหมดอายุ"
- **_DocumentRow** x2 (AppColors.primary dark red background):
  - "Vehicle Registration Certificate" + "View" button (white background, primary text)
  - "The vehicle license plate" + "View" button
- **_RenewalButton** (AppColors.warningAmber amber background):
  - "Renewal Request" + chevron right icon

### vehicles_list_screen.dart (patched)
- Added: `import 'vehicle_details_screen.dart';`
- Changed More button `onPressed: () {}` → `Navigator.of(context).push(MaterialPageRoute(builder: (_) => VehicleDetailsScreen(vehicle: v)))`

## T15 — Implementation Summary

ปุ่ม More ใน My Vehicles จะ push หน้า `VehicleDetailsScreen` ด้วย `vehicle` ของรถคันนั้น และ `VehicleDetailsScreen` แสดง UI ตามรูปภาพที่ user แนบ ครบถ้วนทุกส่วน

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection — vehicle_details_screen.dart | PASS | Layout matches screenshot |
| Code inspection — vehicles_list_screen.dart | PASS | Navigation wired correctly |
| Flutter hot reload | NOT RUN | Requires running Flutter env. Pattern mirrors existing push usage (EmergencyStatusScreen). Risk: low. |

## T17 — PRD / Docs Decision

ไม่มีการเปลี่ยนแปลง API หรือ data model ใหม่. PRD ไม่ต้องอัปเดต. `docs/AI-DOCS-INDEX.md` ต้องอัปเดต.

## T18 — Security / PDPA

หน้า Details แสดง: plateNumber, vehicleCode, brand, model, color, issueDate, expiryDate, daysUntilExpiry — ทั้งหมดเป็น vehicle registration data ที่ user เป็นเจ้าของ ไม่มี sensitive personal data ใหม่.

## T19 — Risks / Blockers

| Risk | Level | Mitigation |
|---|---|---|
| Flutter build not verified | Low | Follows existing Navigator.push pattern used in emergency screen |

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-21-vehicle-details-ui.md`
- Changed files: `vehicle_details_screen.dart`, `vehicles_list_screen.dart`
- Open items: Edit/View/Renewal actions are no-ops pending future scope definition
- Next action: User to hot reload / test on device
