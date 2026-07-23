# Tasklist: Vehicles List Buttons Styling

| Field | Value |
|---|---|
| Date | 2026-07-23 |
| Project | IVTS |
| Module / Feature | User Mobile App — My Vehicles / List |
| Requirement | ปรับแต่งสไตล์ของปุ่ม "Location" และ "More" ในหน้า My Vehicles ให้มีกรอบโค้งมน (Rounded Rectangle) ขนาดเท่ากันและมีสีที่ถูกต้องตามรูปภาพอ้างอิง |
| Source Request | User prompt: "ในหน้า My Vehicles คำว่า More อ่ะช่วยทำให้กรอบของมันคล้ายกับของ Location ได้ไหม" |
| Active Change Record | `docs/changes/2026-07-23-vehicles-list-buttons.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, asked permission before changes |
| Vehicles List screen | `lib/screens/vehicles_list_screen.dart` | Located `OutlinedButton` and `ElevatedButton` for Location/More |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-VLB-001 | Update buttons style | Frontend | AI | none | done | 100 | Applied `styleFrom` with `RoundedRectangleBorder(radius: 12)` | `lib/screens/vehicles_list_screen.dart` | Code inspection | none | — | UI updated |
| ivts-VLB-002 | Document and handoff | Ops | AI | ivts-VLB-001 | done | 100 | Created T1-T20 change record | `docs/changes/2026-07-23-vehicles-list-buttons.md` | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code inspection | PASS | Both buttons now share the same `minimumSize` and `borderRadius`. |

## Final Handoff Link

- Change record: `docs/changes/2026-07-23-vehicles-list-buttons.md`
