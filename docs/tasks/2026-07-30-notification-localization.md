# Tasklist: Notification Localization (Dynamic Parsing)

| Field | Value |
|---|---|
| Date | 2026-07-30 |
| Project | IVTS |
| Module / Feature | User Mobile App — Notification Localization |
| Requirement | แปลข้อความ Title และ Description ในหน้า Notification โดยจับ Pattern ฝั่ง Mobile (ไม่แก้ Backend) |
| Active Change Record | `docs/changes/2026-07-30-notification-localization.md` |
| Overall Status | in_progress |
| Overall Progress | 20% |
| Progress Type | Evidence-backed gate completion |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-LOC-N-001 | สร้างฟังก์ชันแปลใน LocaleProvider | Frontend | AI | none | pending | 0 | Not started | `locale_provider.dart` | — | none | เขียนโค้ดแปล Title และ Description | ฟังก์ชันใน LocaleProvider |
| ivts-LOC-N-002 | อัปเดต UI ใน NotificationScreen | Frontend | AI | ivts-LOC-N-001 | pending | 0 | Not started | `notification_screen.dart` | — | none | เรียกใช้ฟังก์ชันแปลใน UI | UI ที่แปลภาษาแล้ว |
| ivts-LOC-N-003 | สรุป T1-T20 Change Record | Ops | AI | ivts-LOC-N-002 | pending | 0 | Not started | `docs/changes/...` | — | none | สรุปการทำงาน | เอกสาร T1-T20 |
