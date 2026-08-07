# Tasklist: Localization — Request History Title Translation

| Field | Value |
|---|---|
| Date | 2026-08-07 |
| Project | IVTS |
| Module / Feature | User Mobile App — Request History |
| Requirement | แปลภาษาหัวข้อคำร้อง (Vehicle registration / Renewal) ในหน้า Request History |
| Active Change Record | `docs/changes/2026-08-07-localization-request-history-title.md` |
| Overall Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed gate completion |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-LOC-RHT-001 | Source Discovery — Request History Title | Frontend | AI | none | done | 100 | อ่าน request_history_screen.dart, mobile.js, locale_provider.dart | `request_history_screen.dart`, `mobile.js`, `locale_provider.dart` | — | none | — | พบบรรทัด Text(request.title) ยังไม่ผ่าน LocaleProvider |
| ivts-LOC-RHT-002 | เพิ่ม translateRequestTitle ใน LocaleProvider | Frontend | AI | ivts-LOC-RHT-001 | done | 100 | เพิ่ม method translateRequestTitle ใน locale_provider.dart | `locale_provider.dart` | flutter analyze PASS | none | — | ฟังก์ชันแปลงภาษาคำร้อง |
| ivts-LOC-RHT-003 | เรียกใช้ translateRequestTitle ใน RequestHistoryScreen | Frontend | AI | ivts-LOC-RHT-002 | done | 100 | เปลี่ยน Text(request.title) เป็น Text(loc.translateRequestTitle(request.title)) | `request_history_screen.dart` | flutter analyze PASS | none | — | UI แปลภาษาสำเร็จ |
| ivts-LOC-RHT-004 | สรุปเอกสาร T1-T20 และ Tasklist Progress | Ops | AI | ivts-LOC-RHT-003 | done | 100 | เอกสารเรียบร้อย | `docs/changes/2026-08-07-localization-request-history-title.md` | — | none | — | T1-T20 document |
