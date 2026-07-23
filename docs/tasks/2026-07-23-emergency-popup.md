# Tasklist: Emergency Request Confirmation Popup

| Field | Value |
|---|---|
| Date | 2026-07-23 |
| Project | IVTS |
| Module / Feature | User Mobile App — Emergency Request |
| Requirement | ปรับปรุง Popup ยืนยันการส่งข้อมูลเมื่อกดปุ่ม SUBMIT ในหน้า Emergency Request ให้มีหน้าตาเดียวกับที่ใช้ในหน้าอื่น (พื้นหลังสีเทาอ่อน, ปุ่ม CANCLE สีชมพูหม่น, ปุ่ม SUBMIT สีแดงเข้ม) |
| Source Request | User prompt: "ในหน้าของ Emergency Request ช่วยทำให้ popup เหมือนในรูปที่ส่งไปให้หน่อย" |
| Active Change Record | `docs/changes/2026-07-23-emergency-popup.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, asked permission before changes |
| Emergency screen | `lib/screens/emergency_request_screen.dart` | `_confirmAndSubmit` method was using a standard Material `AlertDialog` |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-EMP-001 | Restyle confirmation dialog | Frontend | AI | none | done | 100 | Replaced `AlertDialog` with custom `Dialog` matching UI | `lib/screens/emergency_request_screen.dart` | Code inspection | none | — | UI updated |
| ivts-EMP-002 | Document and handoff | Ops | AI | ivts-EMP-001 | done | 100 | Created T1-T20 change record | `docs/changes/2026-07-23-emergency-popup.md` | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code inspection | PASS | Dialog uses `showDialog`, matches colors and corner radius. Route replacement (`EmergencyStatusScreen`) is preserved. |

## Final Handoff Link

- Change record: `docs/changes/2026-07-23-emergency-popup.md`
