# T1-T20 Change Record: Emergency Request Confirmation Popup

| Field | Value |
|---|---|
| Change ID | ivts-EMP-2026-07-23 |
| Date | 2026-07-23 |
| Project | IVTS |
| Module | User Mobile App — Emergency Request |
| Type | Frontend UI — dialog restyling |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

ปรับปรุง Popup ยืนยันข้อมูลก่อนส่งในหน้า Emergency Request เมื่อผู้ใช้กดปุ่ม SUBMIT โดยใช้ออกแบบหน้าต่าง Dialog เดียวกับที่ใช้ในหน้า Renewal Request และ Add Vehicle

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/screens/emergency_request_screen.dart` | 21-45 | Found the `_confirmAndSubmit` method which was using a standard Material `AlertDialog` |

## T3 — Open Questions / Assumptions

None.

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/screens/emergency_request_screen.dart` | MODIFIED | Replaced `AlertDialog` with custom styled `Dialog` |

## T5–T14 — Implementation

### emergency_request_screen.dart (patched)
- Modified `_confirmAndSubmit` to invoke `showDialog()` with a custom `Dialog`.
- Set background color to light grey (`0xFFDFDFDF`) and border radius to 24.
- Added layout for the text and two buttons (CANCLE / SUBMIT) using `ElevatedButton`.
- **CANCLE Action**: `Navigator.pop(context)` to close the dialog.
- **SUBMIT Action**: `Navigator.pop(context)` to close the dialog, followed by `Navigator.pushReplacement(..., EmergencyStatusScreen())` to navigate to the status screen (preserving the existing routing behavior).

## T15 — Implementation Summary

เมื่อผู้ใช้กดปุ่ม SUBMIT ในหน้าขอความช่วยเหลือฉุกเฉิน (Emergency Request) ระบบจะแสดงหน้าต่าง Popup ยืนยันในรูปแบบเดียวกันกับหน้าอื่น ๆ (พื้นสีเทา, ปุ่ม CANCLE สีชมพูหม่น, ปุ่ม SUBMIT สีแดง) เมื่อกดยืนยันจะพาไปยังหน้า Emergency Status ตามเดิม

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection | PASS | Dialog styling matches the exact request parameters and routing logic is preserved. |

## T17 — PRD / Docs Decision

No backend schema or business rule changes made (UI dialog only). `docs/AI-DOCS-INDEX.md` must be updated to track the new task and change records.

## T18 — Security / PDPA

No changes to data handling.

## T19 — Risks / Blockers

None.

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-23-emergency-popup.md`
- Change record: `docs/changes/2026-07-23-emergency-popup.md`
- Modified: `lib/screens/emergency_request_screen.dart`
