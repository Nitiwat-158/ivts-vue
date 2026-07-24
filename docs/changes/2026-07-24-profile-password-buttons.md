# T1-T20 Change Record: Profile Change Password Buttons

| Field | Value |
|---|---|
| Change ID | ivts-PPB-2026-07-24 |
| Date | 2026-07-24 |
| Project | IVTS |
| Module | User Mobile App — Profile |
| Type | Frontend UI — dialog restyling |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

ปรับปรุงปุ่ม Cancel และ Confirm ในหน้าต่าง Change Password ของหน้า Profile ให้มีลักษณะเดียวกับปุ่ม CANCLE (สีชมพูหม่น) และ SUBMIT (สีแดง) ที่ใช้งานใน Popup หน้าอื่น ๆ

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/screens/profile_screen.dart` | 114-138 | Found the `actions` array in `AlertDialog` containing the default TextButton and ElevatedButton |

## T3 — Open Questions / Assumptions

None.

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/screens/profile_screen.dart` | MODIFIED | Replaced `actions` with a styled `Row` of buttons inside the dialog `content` |

## T5–T14 — Implementation

### profile_screen.dart (patched)
- Removed the default `actions` array from the `AlertDialog` in `_showChangePasswordDialog`.
- Appended a `Row` containing two `Expanded` buttons at the end of the `Column` inside the dialog's `content`.
- **CANCLE Button**: Styled with a pinkish red background (`0xFFCE8B8A`) and primary text color.
- **SUBMIT Button**: Styled with primary background color and white text, taking over the original `Confirm` validation and action logic.

## T15 — Implementation Summary

เมื่อผู้ใช้กดเปลี่ยนรหัสผ่านในหน้า Profile จะพบกับหน้าต่างที่มีปุ่ม CANCLE และ SUBMIT ที่มีลักษณะสีและขนาดสอดคล้องกับหน้าต่างยืนยันอื่น ๆ ในแอปพลิเคชัน (กว้างเท่ากัน สีกลมกลืนตามแบรนด์)

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection | PASS | Dialog styling matches the exact request parameters and form validation logic is preserved. |

## T17 — PRD / Docs Decision

No backend schema or business rule changes made (UI dialog only). `docs/AI-DOCS-INDEX.md` must be updated to track the new task and change records.

## T18 — Security / PDPA

No changes to data handling.

## T19 — Risks / Blockers

None.

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-24-profile-password-buttons.md`
- Change record: `docs/changes/2026-07-24-profile-password-buttons.md`
- Modified: `lib/screens/profile_screen.dart`
