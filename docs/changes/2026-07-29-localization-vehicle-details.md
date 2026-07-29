# T1-T20 Change Record: Localization — Vehicle Details Screen

| Field | Value |
|---|---|
| Change ID | ivts-LVD-2026-07-29 |
| Date | 2026-07-29 |
| Project | IVTS |
| Module | User Mobile App — Vehicle Details |
| Type | Frontend — Localization fix |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

แทนที่ข้อความ Hardcode ทั้งหมดในหน้า Vehicle Details ด้วย `LocaleProvider.t()` เพื่อให้หน้านี้รองรับการสลับภาษา TH/EN ได้ครบถ้วน

## T4 — Affected Files

| File | Action |
|---|---|
| `lib/providers/locale_provider.dart` | เพิ่ม 2 keys: `expires_in_days`, `mock_document` |
| `lib/screens/vehicle_details_screen.dart` | แทนที่ hardcode ทั้งหมดด้วย `loc.t()` |

## T5–T14 — Implementation

- **`_InfoRow`**: แทนที่ label ของ 'Brand', 'Model', 'Color', 'Date of Issue', 'Date of Expiry' ด้วย `loc.t()`
- **Expiration text**: แทนที่ "เหลืออีก X วันก่อนหมดอายุ" เป็นการเรียกใช้ `loc.t('expires_in_days').replaceAll('{days}', vehicle.daysUntilExpiry.toString())`
- **`_DocumentRow`**: แก้ให้ `build()` รับ `loc = context.watch<LocaleProvider>()` และแทนที่ข้อความ 'View' เป็น `loc.t('view')`
- **`_RenewalButton`**: แก้ให้ `build()` รับ `loc = context.watch<LocaleProvider>()` และแปล label เป็น `loc.t('renewal_request')`
- **`_showMockImageDialog`**: เพิ่มการใช้ `context.read<LocaleProvider>()` และแทนที่ข้อความ 'Mock Document:' ด้วย `loc.t('mock_document')`

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-29-localization-vehicle-details.md`
- Change record: `docs/changes/2026-07-29-localization-vehicle-details.md`
