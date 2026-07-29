# T1-T20 Change Record: Localization — Translate Date Group from Backend

| Field | Value |
|---|---|
| Change ID | ivts-LDG-2026-07-29 |
| Date | 2026-07-29 |
| Project | IVTS |
| Module | User Mobile App — Localization |
| Type | Frontend — Localization fix |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

แปลข้อความ Date Group ('15 days ago', 'Today', 'Yesterday') ที่ส่งมาจาก Backend ให้เป็นภาษาไทยก่อนแสดงผลบนหน้า History, Request History และ Notifications

## T4 — Affected Files

| File | Action |
|---|---|
| `lib/providers/locale_provider.dart` | เพิ่มฟังก์ชัน `translateDateGroup` |
| `lib/screens/history_screen.dart` | ใช้งาน `loc.translateDateGroup()` สำหรับ Dropdown options และ Group Headers |
| `lib/screens/request_history_screen.dart` | ใช้งาน `loc.translateDateGroup()` สำหรับ Dropdown options และ Group Headers |
| `lib/screens/notification_screen.dart` | ใช้งาน `loc.translateDateGroup()` สำหรับ Group Headers |

## T5–T14 — Implementation

- **`locale_provider.dart`**: สร้างเมธอด `translateDateGroup(String dateGroup)` ที่จะตรวจสอบคำว่า 'Today', 'Yesterday' และใช้ Regex ในการจับค่าตัวเลขสำหรับ 'X days ago', 'X months ago' แล้วคืนค่าภาษาไทย ('วันนี้', 'เมื่อวานนี้', 'X วันก่อน', 'X เดือนก่อน') ตามลำดับ หากตั้งค่าภาษาเป็นภาษาอังกฤษอยู่แล้วจะคืนค่าเดิม
- **`Screens`**: ครอบตัวแปร `dateGroup` เดิมที่เอาไปแสดงผลด้วย `loc.translateDateGroup(...)` ทั้งส่วนที่เป็นหัวข้อแยกหมวดหมู่วันที่ใน List และส่วนที่นำไปใช้เป็นตัวเลือก (Options) ใน Filter Dropdown

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-29-localization-date-group.md`
- Change record: `docs/changes/2026-07-29-localization-date-group.md`
