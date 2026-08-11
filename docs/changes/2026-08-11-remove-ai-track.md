# T1-T20 Change Document: Remove AI Track UI

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-AIT-001 |
| Module | Frontend |
| Date | 2026-08-11 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/tasklist-progress.md` |

## T2 Requirement

- User request: remove nav.aiTrack page and navigate on side bar
- Business goal: Remove AI Track UI from the frontend
- Success outcome: The AI Track menu item is no longer visible on the sidebar and the route is removed.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Frontend route | `frontend-vue/src/router/index.js` | `AITrack` route and import removed |
| Frontend navigation | `frontend-vue/src/containers/_nav.js` | `nav.aiTrack` removed |
| Component | `frontend-vue/src/projects/views/operations/AITrack.vue` | File deleted |

## T4 Current Behavior

- Current UI behavior: `nav.aiTrack` is removed from sidebar. Route `/operations/ai-track` will hit 404.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Frontend | yes | Sidebar, router and vue component deleted |

## T6 Scope

In scope:
- Remove AI Track sidebar item
- Remove AI Track vue router entry
- Delete AITrack.vue component

Out of scope:
- Backend removal of tracking APIs

## T15 Implementation Summary

| File | Change |
|---|---|
| `frontend-vue/src/containers/_nav.js` | Removed `nav.aiTrack` object |
| `frontend-vue/src/router/index.js` | Removed `AITrack` import and route definition |
| `frontend-vue/src/projects/views/operations/AITrack.vue` | Deleted file |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| ivts-AIT-001 | done | 100 | Removed from sidebar and router | None |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-ivts.md` | yes | Documented that AI Track UI is removed. |

## T20 Final Handoff

```txt
Feature: Remove AI Track UI
Status: Done
Active tasklist: docs/tasks/tasklist-progress.md
Task IDs: ivts-AIT-001
Progress: 100%
Changed files: _nav.js, index.js
Routes: Removed /operations/ai-track
UI routes: Removed
Next owner: User
```
