# T1-T20 Change Record: Home Renewal Banner Navigation

| Field | Value |
|---|---|
| Change ID | ivts-HRB-2026-07-22 |
| Date | 2026-07-22 |
| Project | IVTS |
| Module | User Mobile App — Home / Renewal Banner |
| Type | Frontend UI — navigation update |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

ตรงหน้า Home คำว่า "ใกล้หมดอายุทะเบียนใน 21 วัน" (Renewal banner) เมื่อกดแล้วให้ Navigate ไปยังหน้า `RenewalRequestScreen` โดยแนบข้อมูลรถคันนั้นไปด้วย

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/screens/home_screen.dart` | 115 | Found `onTap: () {}` inside the renewal `_ActionBanner` |

## T3 — Open Questions / Assumptions

None.

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/screens/home_screen.dart` | MODIFIED | Added import + wired `onTap` to push `RenewalRequestScreen` |

## T5–T14 — Implementation

### home_screen.dart (patched)
- Added `import 'renewal_request_screen.dart';`
- Changed `onTap: () {}` for the expiring vehicle `_ActionBanner` to:
  ```dart
  onTap: () {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => RenewalRequestScreen(vehicle: expiring),
      ),
    );
  }
  ```

## T15 — Implementation Summary

Banner แจ้งเตือนรถใกล้หมดอายุบนหน้า Home เมื่อผู้ใช้กดที่แบนเนอร์ ระบบจะเปิดหน้า `RenewalRequestScreen` ขึ้นมาและดึงข้อมูลของรถคันที่แจ้งเตือนไปแสดงผลอัตโนมัติ (เช่นเดียวกับการกดปุ่มจากหน้า Details)

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection | PASS | Navigation logic passes the `expiring` vehicle argument correctly. |

## T17 — PRD / Docs Decision

No backend schema or business rule changes made (UI navigation only). `docs/AI-DOCS-INDEX.md` must be updated to track the new task and change records.

## T18 — Security / PDPA

No changes to data handling.

## T19 — Risks / Blockers

None.

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-22-home-renewal-banner.md`
- Change record: `docs/changes/2026-07-22-home-renewal-banner.md`
- Modified: `lib/screens/home_screen.dart`
