# Tasklist: Add Vehicle Screen UI

| Field | Value |
|---|---|
| Date | 2026-07-22 |
| Project | IVTS |
| Module / Feature | User Mobile App — Add Vehicle Form |
| Requirement | สร้างหน้า AddVehicle ตามรูปภาพ: Vehicle section (Type dropdown, License Plate, Province, Brand, Model, Color) + Owner section (Name, Surname, Citizen ID, Upload rows) + SUBMIT button และเชื่อมปุ่ม FAB "Add Vehicle" ใน My Vehicles |
| Source Request | User prompt พร้อมรูปภาพ: "ในหน้า My Vehicles ตรงปุ่ม Add Vehicle ช่วยทำให้หน่อยตามรูป" |
| Active Change Record | `docs/changes/2026-07-22-add-vehicle-screen.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, obtained user approval before all actions |
| Vehicle Model | `lib/models/vehicle.dart` | Fields: type, plateNumber, brand, model, color, ownerName — used to define form fields |
| Theme | `lib/theme/app_theme.dart` | AppColors.primary, cardGrey, textSecondary, background |
| My Vehicles Screen | `lib/screens/vehicles_list_screen.dart` | FAB "Add Vehicle" was `onPressed: () {}` — updated to Navigator.push |
| Pattern reference | `lib/screens/vehicle_details_screen.dart` | _DocumentRow pattern reused as _UploadRow |
| Pattern reference | `lib/screens/emergency_request_screen.dart` | StatefulWidget form pattern reused |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-ADDV-001 | Source discovery | Orchestrator | AI | none | done | 100 | Read all relevant files, noted patterns | vehicle.dart, app_theme.dart, vehicles_list_screen.dart | Code inspection | none | — | Source mapped |
| ivts-ADDV-002 | Create add_vehicle_screen.dart | Frontend | AI | ivts-ADDV-001 | done | 100 | New file created with full UI | lib/screens/add_vehicle_screen.dart | Code inspection | none | — | Screen implemented |
| ivts-ADDV-003 | Wire FAB in vehicles_list_screen.dart | Frontend | AI | ivts-ADDV-002 | done | 100 | Navigator.push to AddVehicleScreen | lib/screens/vehicles_list_screen.dart | Code inspection | none | — | Navigation wired |
| ivts-ADDV-004 | Document and handoff | Ops | AI | ivts-ADDV-003 | done | 100 | Created T1-T20 change record | docs/changes/2026-07-22-add-vehicle-screen.md | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code inspection — add_vehicle_screen.dart | PASS | Layout matches screenshot: Vehicle section, Owner section, Upload rows, SUBMIT button |
| Code inspection — vehicles_list_screen.dart | PASS | FAB wired to AddVehicleScreen via Navigator.push |
| Flutter hot reload | NOT RUN | Requires running Flutter environment. Pattern mirrors existing Navigator.push usage. Risk: low |

## Final Handoff Link

- Change record: `docs/changes/2026-07-22-add-vehicle-screen.md`
