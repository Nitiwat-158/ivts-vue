# Tasklist: Profile Change Password Buttons

| Field | Value |
|---|---|
| Date | 2026-07-24 |
| Project | IVTS |
| Module / Feature | User Mobile App — Profile |
| Requirement | เปลี่ยนปุ่มในหน้าต่าง Change Password (Cancel / Confirm) ให้มีลักษณะเดียวกับปุ่ม CANCLE (สีชมพูหม่น) และ SUBMIT (สีแดง) ที่ใช้ในหน้าอื่น ๆ |
| Source Request | User prompt: "ในหน้า Profile ตรง Change Password ช่วยเปลี่ยนปุ่ม Confirm กับ cancle ให้มันเหมือน กับ sunmit กับ cancel ตามรูปที่แนบไปให้หน่อย" |
| Active Change Record | `docs/changes/2026-07-24-profile-password-buttons.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, asked permission before changes |
| Profile screen | `lib/screens/profile_screen.dart` | `_showChangePasswordDialog` had standard `actions` array with `TextButton` and `ElevatedButton` |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-PPB-001 | Restyle dialog buttons | Frontend | AI | none | done | 100 | Removed `actions` and appended a full-width `Row` with styled `ElevatedButton`s | `lib/screens/profile_screen.dart` | Code inspection | none | — | UI updated |
| ivts-PPB-002 | Document and handoff | Ops | AI | ivts-PPB-001 | done | 100 | Created T1-T20 change record | `docs/changes/2026-07-24-profile-password-buttons.md` | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code inspection | PASS | Buttons `CANCLE` and `SUBMIT` are used in an Expanded Row, matching the requested styling from other dialogs. |

## Final Handoff Link

- Change record: `docs/changes/2026-07-24-profile-password-buttons.md`
