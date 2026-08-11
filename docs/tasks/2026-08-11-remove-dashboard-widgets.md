# Tasklist: Remove Vehicles Today and Hourly Traffic Cards from Dashboard

| Field | Value |
|---|---|
| Date | 2026-08-11 |
| Feature / Topic | Remove Vehicles Today and Hourly Traffic Cards from Dashboard |
| Module | `frontend-vue` |
| Active Change Record | `docs/changes/2026-08-11-remove-dashboard-widgets.md` |
| Status | done |
| Overall Progress % | 100% |

## T1. Source Evidence

| File / Component | Role | Evidence |
|---|---|---|
| `frontend-vue/src/views/Dashboard.vue` | Dashboard view | Removed Vehicles today & Hourly traffic stat cards; resized remaining cards to `lg="6"`. |
| `frontend-vue/src/router/index.js` | Router configuration | Mounts `/dashboard` view to `Dashboard.vue`. |

## T2. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-DASH-003 | Source Discovery & Tasklist Creation | Frontend | AI | none | done | 100 | Source inspected in `Dashboard.vue` | `frontend-vue/src/views/Dashboard.vue` | n/a | none | Proceed to implementation | Active tasklist file |
| ivts-DASH-004 | Remove 2 stat cards & adjust layout | Frontend | AI | ivts-DASH-003 | done | 100 | Code removed and layout updated | `Dashboard.vue` | `npm --prefix frontend-vue run lint` PASS | none | — | Updated `Dashboard.vue` |
| ivts-DASH-005 | Verification & Lint | QA | AI | ivts-DASH-004 | done | 100 | Lint check passed with no errors | `Dashboard.vue` | `vue-cli-service lint` PASS | none | — | Verification evidence |
| ivts-DASH-006 | Update system progress & T1-T20 handoff | Ops | AI | ivts-DASH-005 | done | 100 | System progress and docs controls updated | `tasklist-progress.md`, `AI-DOCS-INDEX.md` | n/a | none | — | T1-T20 handoff |
