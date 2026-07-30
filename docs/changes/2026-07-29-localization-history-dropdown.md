# T1-T20 Change Record: Localization — History Screen Dropdowns

| Field | Value |
|---|---|
| Change ID | ivts-LHD-2026-07-29 |
| Date | 2026-07-29 |
| Project | IVTS |
| Module | User Mobile App — History |
| Type | Frontend — Localization fix |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

แปลภาษา (Localization) ส่วนที่เป็น Dropdown Filter ('Date', 'Vehicle') ในหน้า History รวมถึงข้อความใน Filter Sheet ที่ป๊อปอัพขึ้นมา เพื่อให้สอดคล้องกับภาษาที่เลือก

## T4 — Affected Files

| File | Action |
|---|---|
| `lib/providers/locale_provider.dart` | เพิ่ม keys ใหม่ 5 คำ |
| `lib/screens/history_screen.dart` | เปลี่ยน string 'All Time', 'All Vehicles' เป็น key และแปลภาษา |

## T5–T14 — Implementation

- **`locale_provider.dart`**: เพิ่ม 5 keys ได้แก่ `all_time`, `all_vehicles`, `select_date`, `select_vehicle`, และ `date`
- **`history_screen.dart`**:
  - เปลี่ยนตัวแปรเริ่มต้นของ `_selectedDate` และ `_selectedVehicle` เป็น `'all_time'` และ `'all_vehicles'`
  - ใน `build()`: เรียกใช้ `loc = context.watch<LocaleProvider>()` เพื่อนำไปใช้กับ `_FilterChip`
  - ใน `_FilterChip`: แสดง `loc.t('date')` และ `loc.t('vehicle')` เมื่อไม่มีการเลือก
  - ใน `_showFilterSheet`: เพิ่มการ map ตัวเลือก `'all_time'` เป็น `loc.t('all_time')` (เช่น 'ทุกเวลา') เพื่อให้ผู้ใช้มองเห็นเป็นภาษาที่ถูกต้อง

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-29-localization-history-dropdown.md`
- Change record: `docs/changes/2026-07-29-localization-history-dropdown.md`
