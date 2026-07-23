# Tasklist: Renewal Request Confirmation Popup

| Field | Value |
|---|---|
| Date | 2026-07-23 |
| Project | IVTS |
| Module / Feature | User Mobile App — Renewal Request |
| Requirement | สร้าง Popup ยืนยันการส่งข้อมูลเมื่อกดปุ่ม SUBMIT ในหน้า Renewal Request ตามดีไซน์ (สีเทาอ่อน, ปุ่ม CANCLE สีชมพู และปุ่ม SUBMIT สีแดง) |
| Source Request | User prompt: "ในหน้าของ Renewal Request ช่วยทำให้ popup เหมือนในรูปที่ส่งไปให้หน่อย" |
| Active Change Record | `docs/changes/2026-07-23-renewal-popup.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, asked permission before changes |
| Renewal screen | `lib/screens/renewal_request_screen.dart` | `_onSubmit` method was previously just a `maybePop` stub |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-RNP-001 | Add confirmation dialog | Frontend | AI | none | done | 100 | Replaced `_onSubmit` logic with `showDialog` matching UI | `lib/screens/renewal_request_screen.dart` | Code inspection | none | — | UI updated |
| ivts-RNP-002 | Document and handoff | Ops | AI | ivts-RNP-001 | done | 100 | Created T1-T20 change record | `docs/changes/2026-07-23-renewal-popup.md` | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code inspection | PASS | Dialog uses `showDialog`, matches colors and corner radius. |

## Final Handoff Link

- Change record: `docs/changes/2026-07-23-renewal-popup.md`
