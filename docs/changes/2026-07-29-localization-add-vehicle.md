# T1-T20 Change Record: Localization — Add Vehicle Screen

| Field | Value |
|---|---|
| Change ID | ivts-LAV-2026-07-29 |
| Date | 2026-07-29 |
| Project | IVTS |
| Module | User Mobile App — Add Vehicle |
| Type | Frontend — Localization fix |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

แทนที่ข้อความ Hardcode ทั้งหมดในหน้า Add Vehicle ด้วย `LocaleProvider.t()` เพื่อให้หน้านี้รองรับการสลับภาษา TH/EN ได้ครบถ้วน

## T4 — Affected Files

| File | Action |
|---|---|
| `lib/providers/locale_provider.dart` | เพิ่ม 8 keys: `submitting`, `car`, `motorcycle`, `add`, `added`, `fill_required_fields`, `vehicle_saved_success`, `submit_failed_prefix` |
| `lib/screens/add_vehicle_screen.dart` | แทนที่ hardcode ทั้งหมดด้วย `t()` |

## T5–T14 — Implementation

- **Dropdown**: เปลี่ยนจาก `['Car', 'Motorcycle']` เป็น key-based `['car', 'motorcycle']` แล้วแปลเป็น label ผ่าน `loc.t()` ใน build()
- **`_onSubmit()`**: capture `loc` ก่อน `showDialog`, เปลี่ยน builder param เป็น `dialogCtx` เพื่อไม่ให้ shadow `context`
- **`_submitRequest()`**: ใช้ `context.read<LocaleProvider>()` แทน hardcoded Snackbar text
- **`_UploadRow`**: เพิ่ม `context.watch<LocaleProvider>()` โดยตรงใน `build()` เพื่อแปล `'add'`/`'added'`
- **Section titles และ Field labels**: ส่ง `loc.t(...)` เป็น parameter แทน `const` String

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-29-localization-add-vehicle.md`
- Change record: `docs/changes/2026-07-29-localization-add-vehicle.md`
