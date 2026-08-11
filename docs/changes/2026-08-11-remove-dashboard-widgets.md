# T1-T20 Change Document: Remove Vehicles Today and Hourly Traffic Cards from Dashboard

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | `ivts-DASH-003` |
| Module | `frontend-vue` |
| Date | 2026-08-11 |
| Owner / Agent | Frontend AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-11-remove-dashboard-widgets.md` |

## T2 Requirement

- User request: Remove the 2 stat cards ("Vehicles today" and "Hourly traffic") from the web Dashboard view.
- Business goal: Clean up dashboard cards according to user requirements and balance remaining stats cards.
- Success outcome: "Vehicles today" and "Hourly traffic" cards removed from `Dashboard.vue`, and remaining 2 cards ("Total cameras" and "Active / Inactive") adjusted to span 6 grid columns each.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Frontend View | `frontend-vue/src/views/Dashboard.vue` | Stat cards section updated to remove 2 cards and change layout from `lg="3"` to `lg="6"`. |
| Frontend Router | `frontend-vue/src/router/index.js` | Mounts `/dashboard` path to `Dashboard.vue`. |

## T4 Current Behavior

- Previous UI behavior: Stats section displayed 4 cards ("Total cameras", "Active / Inactive", "Vehicles today", "Hourly traffic").
- New UI behavior: Stats section displays 2 cards ("Total cameras" and "Active / Inactive") full width in 2 equal columns.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Task tracking |
| Frontend | yes | `Dashboard.vue` UI modification |
| QA/UAT | yes | UI layout verification |
| Release/Ops | yes | Tasklist and system progress update |

## T6 Scope

In scope:
- Remove "Vehicles today" and "Hourly traffic" stat cards from `frontend-vue/src/views/Dashboard.vue`.
- Adjust grid columns of remaining "Total cameras" and "Active / Inactive" cards to `lg="6"`.

Out of scope:
- Backend API endpoints or cameras mapping logic.

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-DASH-001 | Web dashboard stats section shall only display Total cameras and Active/Inactive camera counts. | Web User | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-DASH-001 | FR-DASH-001 | User opens `/dashboard` | View renders stats section | "Vehicles today" and "Hourly traffic" cards are omitted, and remaining 2 cards fill the section. |

## T12 Frontend Plan / Changes

- Page: `frontend-vue/src/views/Dashboard.vue`
- Modification: Removed 2 `<CCol>` blocks containing `ivts.vehiclesToday` and `ivts.hourlyTraffic`. Changed grid classes of remaining 2 `<CCol>` elements from `sm="6" lg="3"` to `sm="6" lg="6"`.

## T15 Implementation Summary

| File | Change |
|---|---|
| `frontend-vue/src/views/Dashboard.vue` | Removed Vehicles today & Hourly traffic cards, resized remaining cards to `lg="6"`. |
| `docs/tasks/2026-08-11-remove-dashboard-widgets.md` | Active tasklist created and updated. |
| `docs/tasks/tasklist-progress.md` | Canonical system progress updated. |
| `docs/AI-DOCS-INDEX.md` | Active docs index updated. |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| ivts-DASH-003 | done | 100 | Source inspected & tasklist created | none |
| ivts-DASH-004 | done | 100 | `Dashboard.vue` edited | none |
| ivts-DASH-005 | done | 100 | Verification complete | none |
| ivts-DASH-006 | done | 100 | System progress & handoff complete | none |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `cmd /c npm --prefix frontend-vue run lint -- src/views/Dashboard.vue` | PASS | Vue component syntax and structure verified |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/tasks/tasklist-progress.md` | yes | System readiness tracking |
| `docs/AI-DOCS-INDEX.md` | yes | Control index update |

## T20 Final Handoff

```txt
Feature: Remove Vehicles Today and Hourly Traffic cards from Web Dashboard
Status: done
Active tasklist: docs/tasks/2026-08-11-remove-dashboard-widgets.md
Task IDs: ivts-DASH-003, ivts-DASH-004, ivts-DASH-005, ivts-DASH-006
Progress: 100%
Changed files: frontend-vue/src/views/Dashboard.vue
UI routes: /dashboard
PRD/docs: Updated docs/tasks/tasklist-progress.md and docs/AI-DOCS-INDEX.md
Open risks: none
Next owner: User / QA
```
