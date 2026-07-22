# Tasklist: Renewal Request Screen UI

| Field | Value |
|---|---|
| Date | 2026-07-22 |
| Project | IVTS |
| Module / Feature | User Mobile App — Vehicle Details / Renewal Request |
| Requirement | สร้างหน้า Renewal Request ตามรูปภาพ: Vehicle info card + Owner section (Name, Surname, Citizen ID, License plate upload) + SUBMIT button และเชื่อมปุ่ม Renewal Request ในหน้า Details ให้ลิงก์มาหน้านี้ |
| Source Request | User prompt พร้อมรูปภาพ: "ในหน้า Details มันมีคำว่า Renewal Request พอกดเข้าไปจะเป็นเหมือนตามรูป" |
| Active Change Record | `docs/changes/2026-07-22-renewal-request-screen.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, asked permission before changes |
| Vehicle details screen | `lib/screens/vehicle_details_screen.dart` | Confirmed `_RenewalButton` exists with empty `onTap` |
| Add Vehicle pattern | `lib/screens/add_vehicle_screen.dart` | Reused similar `_InputField`, `_UploadRow` patterns |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-RENW-001 | Create renewal_request_screen.dart | Frontend | AI | none | done | 100 | New file created with UI from mockup | `lib/screens/renewal_request_screen.dart` | Code inspection | none | — | Screen implemented |
| ivts-RENW-002 | Wire button in vehicle_details_screen | Frontend | AI | ivts-RENW-001 | done | 100 | `Navigator.push` to new screen | `lib/screens/vehicle_details_screen.dart` | Code inspection | none | — | Navigation wired |
| ivts-RENW-003 | Document and handoff | Ops | AI | ivts-RENW-002 | done | 100 | Created T1-T20 change record | `docs/changes/2026-07-22-renewal-request-screen.md` | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code inspection | PASS | Screen has Vehicle card, Owner inputs, and Submit button as requested. Navigation passes `vehicle` data. |
| Flutter hot reload | NOT RUN | Requires running Flutter env. Nav logic is standard `Navigator.push`. |

## Final Handoff Link

- Change record: `docs/changes/2026-07-22-renewal-request-screen.md`
