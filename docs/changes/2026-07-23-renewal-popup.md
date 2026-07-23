# T1-T20 Change Record: Renewal Request Confirmation Popup

| Field | Value |
|---|---|
| Change ID | ivts-RNP-2026-07-23 |
| Date | 2026-07-23 |
| Project | IVTS |
| Module | User Mobile App — Renewal Request |
| Type | Frontend UI — dialog addition |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

เพิ่ม Popup ยืนยันข้อมูลก่อนส่งในหน้า Renewal Request เมื่อผู้ใช้กดปุ่ม SUBMIT โดยให้ออกแบบหน้าต่าง Dialog ตรงตามภาพตัวอย่าง:
- พื้นหลังสีเทาอ่อน
- ข้อความ "Are you sure to submit your request ?"
- ปุ่ม "CANCLE" พื้นหลังสีชมพูหม่น ตัวหนังสือสีแดง
- ปุ่ม "SUBMIT" พื้นหลังสีแดง ตัวหนังสือสีขาว

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/screens/renewal_request_screen.dart` | 27-30 | Found the `_onSubmit` method which was previously just calling `Navigator.maybePop()` |

## T3 — Open Questions / Assumptions

None.

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/screens/renewal_request_screen.dart` | MODIFIED | Replaced `_onSubmit` stub with a `showDialog` logic |

## T5–T14 — Implementation

### renewal_request_screen.dart (patched)
- Modified `_onSubmit` to invoke `showDialog()`.
- Used a custom `Dialog` widget with `borderRadius: 24` and a light grey background (`0xFFDFDFDF`).
- Added layout for the text and two buttons (CANCLE / SUBMIT) using `ElevatedButton`.
- **CANCLE Action**: `Navigator.pop(context)` to close the dialog.
- **SUBMIT Action**: `Navigator.pop(context)` to close the dialog, followed by `Navigator.maybePop(context)` to close the screen (simulating successful submission).

## T15 — Implementation Summary

เมื่อผู้ใช้กดปุ่ม SUBMIT ในหน้าขอต่ออายุทะเบียน (Renewal Request) ระบบจะแสดงหน้าต่าง Popup ถามเพื่อยืนยันอีกครั้ง หากกดยกเลิก Popup จะปิดลง แต่หากกดยืนยัน (SUBMIT) Popup จะปิดและกลับไปที่หน้าก่อนหน้า

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection | PASS | Dialog styling matches the exact request parameters. |

## T17 — PRD / Docs Decision

No backend schema or business rule changes made (UI dialog only). `docs/AI-DOCS-INDEX.md` must be updated to track the new task and change records.

## T18 — Security / PDPA

No changes to data handling.

## T19 — Risks / Blockers

None.

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-23-renewal-popup.md`
- Change record: `docs/changes/2026-07-23-renewal-popup.md`
- Modified: `lib/screens/renewal_request_screen.dart`
