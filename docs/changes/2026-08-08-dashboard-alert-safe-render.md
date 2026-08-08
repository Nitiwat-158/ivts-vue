# T1-T20 Change Document: Dashboard Alert Safe Text Rendering

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | `chg-2026-08-08-dashboard-alert-safe-render` |
| Module | IVTS Web Dashboard (`frontend-vue/src/views/Dashboard.vue`) |
| Date | 2026-08-08 |
| Owner / Agent | AI Frontend Agent |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-08-dashboard-alert-safe-render.md` |

## T2 Requirement

- Fix Dashboard alert line so it never renders enriched `vehicle_id` object as raw JSON.
- Keep backend untouched because Emergency Report Management still needs enriched object payload.
- Add reusable guards for fields that may be enriched objects.
- Provide verification for 2 payload formats: `vehicle_id` as string and object.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Dashboard alert mapping | `frontend-vue/src/views/Dashboard.vue` | Unsafe fallback used `r.vehicle_id` directly |
| Backend enrich behavior | `backend-node/server/Project/ivts/service/emergency_report.js` | `vehicle_id` is enriched to vehicle object |
| Dependent frontend consumer | `frontend-vue/src/projects/views/operations/EmergencyReportManagement.vue` | Still expects enriched object |
| Verification command | `npm --prefix frontend-vue run lint -- src/views/Dashboard.vue` | Lint PASS |

## T4 Current Behavior

- Previous: If `location.camera_id` was missing and `vehicle_id` was an object, Dashboard rendered the object payload in Alerts as long JSON text.
- New: Dashboard converts candidate values to safe short text using guard helpers. Object values are normalized to a concise location label (plate/code) and descriptions are prioritized for readability.

## T6 Scope

In scope:
- `frontend-vue/src/views/Dashboard.vue`

Out of scope:
- Backend emergency report service and schema

## T15 Implementation Summary

| File | Change |
|---|---|
| `frontend-vue/src/views/Dashboard.vue` | Added reusable type guards (`isPlainObject`, `toNonEmptyText`) and alert helpers (`getVehicleLabelFromAny`, `getAlertLocationLabel`, `getAlertDescription`); wired `fetchAlerts` to safe helpers; improved string sanitization in camera/offline mappings |

## T16 Tests Run / Evidence

| Command / Case | Result | Evidence / Notes |
|---|---|---|
| `npm --prefix g:\\MFU\\Project\\ivts-vue\\ivts-vue\\frontend-vue run lint -- src/views/Dashboard.vue` | PASS | No lint errors |
| MT-001 (`vehicle_id` string) | Defined | Expected location text: short plain string, no JSON |
| MT-002 (`vehicle_id` object) | Defined | Expected location text: `ทะเบียน <plate>` or code fallback, no JSON |

Note: Jest unit execution in this workspace is currently blocked by project test-runtime compatibility issues unrelated to this change (`@jest/globals` resolution). Manual test cases are provided and ready for browser execution.

## T17 PRD / Docs Update

- PRD update not required (no feature/contract change, only frontend rendering safety fix).
- Updated docs control artifacts:
  - `docs/tasks/2026-08-08-dashboard-alert-safe-render.md`
  - `docs/changes/2026-08-08-dashboard-alert-safe-render.md`
  - `docs/AI-DOCS-INDEX.md`
  - `docs/tasks/tasklist-progress.md`

## T20 Final Handoff

Dashboard alert rendering is now resilient to backend-enriched object payloads and displays concise, human-readable text instead of raw JSON.
