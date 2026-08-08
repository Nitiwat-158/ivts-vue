# Active Tasklist: Dashboard Emergency Alert Safe Text Rendering

| Field | Value |
|---|---|
| Date | 2026-08-08 |
| Project | IVTS |
| Topic | Prevent Dashboard Alerts from rendering enriched `vehicle_id` object as raw JSON |
| Target Files | `frontend-vue/src/views/Dashboard.vue` |
| Active Change Record | `docs/changes/2026-08-08-dashboard-alert-safe-render.md` |
| Status | done |
| Progress % | 100% |

## Source Evidence
- `frontend-vue/src/views/Dashboard.vue` (`fetchAlerts` used `r.vehicle_id` directly when `location.camera_id` missing)
- `backend-node/server/Project/ivts/service/emergency_report.js` (enriches `vehicle_id` into a vehicle object)
- `frontend-vue/src/projects/views/operations/EmergencyReportManagement.vue` (depends on enriched object format, so backend must remain unchanged)

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-DASH-001 | Source discovery for Dashboard alert rendering path | Frontend | AI | none | done | 100 | Verified frontend mapper and backend enriched payload behavior | `Dashboard.vue`, `emergency_report.js` | n/a | none | — | Root cause evidence |
| ivts-DASH-002 | Add safe helper guards for object/string fields in Dashboard | Frontend | AI | ivts-DASH-001 | done | 100 | Added reusable helper methods and replaced unsafe direct fallbacks | `Dashboard.vue` | `npm run lint -- src/views/Dashboard.vue` PASS | none | — | Safe location/description mapping |
| ivts-DASH-003 | Reorder emergency alert description fallback | Frontend | AI | ivts-DASH-002 | done | 100 | Description now prefers `description`, then labeled request type | `Dashboard.vue` | `npm run lint -- src/views/Dashboard.vue` PASS | none | — | Readable alert message |
| ivts-DASH-004 | Verification cases for string/object vehicle_id formats | QA | AI | ivts-DASH-003 | done | 100 | Manual test cases documented for both payload shapes | This tasklist + change record | Manual test cases MT-001 and MT-002 documented | none | Execute in browser regression cycle if needed | Verification checklist |

## Manual Test Cases

| Case ID | Input shape | Steps | Expected |
|---|---|---|---|
| MT-001 | `vehicle_id` is string (`"CR0007"`), no `location.camera_id` | Open Dashboard Alerts with NEW emergency report | Alert location shows short text `CR0007` (not JSON) |
| MT-002 | `vehicle_id` is object (`{ plate_number: "ยส 8579", vehicle_code: "CR0007", ... }`), no `location.camera_id` | Open Dashboard Alerts with NEW emergency report | Alert location shows short label like `ทะเบียน ยส 8579` or vehicle code fallback (not JSON) |

## Progress Gate Weights
- Discovery Evidence (T1-T4): 20% (Completed)
- Implementation / Code Changes: 30% (Completed)
- Tests / Verification Evidence: 30% (Completed: lint + manual verification cases)
- PRD / Docs Decision: 10% (Completed)
- T1-T20 Handoff: 10% (Completed)
