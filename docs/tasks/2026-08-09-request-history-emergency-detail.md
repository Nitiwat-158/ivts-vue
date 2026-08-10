# Tasklist: Request History — Emergency Detail Navigation

| Field | Value |
|---|---|
| Date | 2026-08-09 |
| Project | IVTS |
| Module / Feature | User Mobile App — Request History & Emergency Status |
| Requirement | ทำให้รายการ Emergency Request ใน Request History กดเพื่อเปิดหน้า EmergencyStatusScreen(emergencyId) ได้ |
| Active Change Record | `docs/changes/2026-08-09-request-history-emergency-detail.md` |
| Overall Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed gate completion |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-LOC-RHD-001 | Source Discovery — Request History & Emergency Status | Frontend | AI | none | done | 100 | อ่าน request_history_screen.dart, emergency_status_screen.dart, history_entry.dart, mobile.js | `request_history_screen.dart`, `emergency_status_screen.dart`, `mobile.js` | — | none | — | สรุปโครงสร้าง emergencyId ครบถ้วน |
| ivts-LOC-RHD-002 | เชื่อมโยง onTap ใน RequestHistoryScreen | Frontend | AI | ivts-LOC-RHD-001 | done | 100 | ครอบ GestureDetector เปิด EmergencyStatusScreen(emergencyId: request.vehicleId) | `request_history_screen.dart` | flutter analyze PASS | none | — | โค้ดที่เชื่อมโยงเรียบร้อย |
| ivts-LOC-RHD-003 | สร้าง T1-T20 Change Record & อัปเดต Tasklist Progress | Ops | AI | ivts-LOC-RHD-002 | done | 100 | เอกสารเรียบร้อย | `docs/changes/2026-08-09-request-history-emergency-detail.md` | — | none | — | เอกสารครบตาม AI-WORKFLOW |
