# Tasklist: Vehicle Details Screen UI

| Field | Value |
|---|---|
| Date | 2026-07-21 |
| Project | IVTS |
| Module / Feature | User Mobile App — Vehicle Details Screen |
| Requirement | ปรับ UI หน้า VehicleDetailsScreen ให้ตรงตามรูปภาพ และเชื่อมปุ่ม More ใน My Vehicles ให้ navigate ไปยัง VehicleDetailsScreen |
| Source Request | User prompt พร้อมรูปภาพ: "เห็นหน้า My Vehicles ไหม คำว่า More อ่ะ พอเรากดเข้าไปจะเป็นหน้าของ Details..." |
| Active Change Record | `docs/changes/2026-07-21-vehicle-details-ui.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, obtained user approval before editing. |
| Vehicle Model | `user-mobile-application/lib/models/vehicle.dart` | Fields: plateNumber, vehicleCode, brand, model, color, issueDate, expiryDate, daysUntilExpiry, status |
| Mock Data | `user-mobile-application/lib/data/mock_data.dart` | Vehicle: สน 1669 / Honda Accord / Black / CR0001 / Issue:11/08/2569 / Expiry:11/08/2570 |
| Theme | `user-mobile-application/lib/theme/app_theme.dart` | AppColors.primary (#7A1518), warningAmber (#E0A030), cardGrey, textSecondary |
| My Vehicles Screen | `user-mobile-application/lib/screens/vehicles_list_screen.dart` | More button at line 146 (was onPressed: () {}) |
| Details Screen | `user-mobile-application/lib/screens/vehicle_details_screen.dart` | Existing screen — basic layout, overwritten with new UI |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-VDET-001 | Source discovery | Orchestrator | AI | none | done | 100 | Read all relevant files, noted fields and patterns | vehicle.dart, mock_data.dart, app_theme.dart | Code inspection | none | — | Source mapped |
| ivts-VDET-002 | Redesign VehicleDetailsScreen UI | Frontend | AI | ivts-VDET-001 | done | 100 | Overwritten vehicle_details_screen.dart | vehicle_details_screen.dart | Code inspection | none | — | New UI implemented |
| ivts-VDET-003 | Wire More button in VehiclesListScreen | Frontend | AI | ivts-VDET-002 | done | 100 | Added Navigator.push to VehicleDetailsScreen | vehicles_list_screen.dart | Code inspection | none | — | Navigation wired |
| ivts-VDET-004 | Document and handoff | Ops | AI | ivts-VDET-003 | done | 100 | Created T1-T20 change record | docs/changes/2026-07-21-vehicle-details-ui.md | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code Inspection — vehicle_details_screen.dart | PASS | UI matches screenshot: info card, edit icon, Document rows with View button, Renewal Request amber button |
| Code Inspection — vehicles_list_screen.dart | PASS | More button now calls Navigator.push → VehicleDetailsScreen(vehicle: v) |
| Flutter hot reload / build | NOT RUN | Requires Flutter dev environment. Risk: low — follows existing Navigator.push pattern |

## Final Handoff Link

- Change record: `docs/changes/2026-07-21-vehicle-details-ui.md`
