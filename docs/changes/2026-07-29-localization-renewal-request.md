# T1-T20 Change Record: Localization — Renewal Request Screen

| Field | Value |
|---|---|
| Change ID | ivts-LRR-2026-07-29 |
| Date | 2026-07-29 |
| Project | IVTS |
| Module | User Mobile App — Renewal Request |
| Type | Frontend — Localization fix |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

แทนที่ข้อความ Hardcode ทั้งหมดในหน้า Renewal Request ด้วย `LocaleProvider.t()` เพื่อให้หน้านี้รองรับการสลับภาษา TH/EN ได้ครบถ้วน

## T4 — Affected Files

| File | Action |
|---|---|
| `lib/screens/renewal_request_screen.dart` | แทนที่ hardcode ทั้งหมดด้วย `loc.t()` |

*หมายเหตุ: ไม่จำเป็นต้องเพิ่ม key ใหม่ใน `locale_provider.dart` เนื่องจากทุกคำใช้ key ที่มีอยู่แล้ว (ได้ถูกเพิ่มไว้ตอนทำหน้า Add Vehicle และ Vehicle Details)*

## T5–T14 — Implementation

- **`_InfoRow`**: แทนที่ label ของ 'Brand', 'Color', 'Model' ด้วย `loc.t()`
- **`owner` Section**: แทนที่คำว่า 'Owner' และ Field labels ('Name', 'Surname', 'Citizen ID') ด้วย `loc.t()`
- **`_UploadRow`**: แก้ให้ `build()` รับ `loc = context.watch<LocaleProvider>()` และแปล label 'The vehicle license plate' (ใช้ key `photo_license_plate`), รวมทั้งสถานะปุ่ม 'Add'/'Added' (ใช้ `loc.t('add')`, `loc.t('added')`)
- **Confirmation Dialog**: แปลง 'Are you sure to\nsubmit your request ?' เป็น `loc.t('confirm_submit_request')`, ปุ่ม 'CANCLE' เป็น `loc.t('cancel').toUpperCase()`, และปุ่ม 'SUBMIT' เป็น `loc.t('submit')`

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-29-localization-renewal-request.md`
- Change record: `docs/changes/2026-07-29-localization-renewal-request.md`
