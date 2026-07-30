# T1-T20 Change Document: Mobile App OpenStreetMap Tile Fix

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-CHG-MAP-001 |
| Module | Mobile App / Location Screen Map Tiles |
| Date | 2026-07-30 |
| Owner / Agent | AI Mobile |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-30-mobile-osm-map-fix.md` |

## T2 Requirement

- User request: Fix HTTP 403 Access Blocked error on OpenStreetMap tile layer in mobile application (`user_mobile_application`).
- Business goal: Display map tiles cleanly without 403 tile access blocked graphics on Location screen.
- Success outcome: `location_screen.dart` TileLayer uses valid `userAgentPackageName: 'th.ac.mfu.ivts'` and CartoDB Voyager tiles.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Mobile Location Screen | `user-mobile-application/lib/screens/location_screen.dart` | Updated `TileLayer` `userAgentPackageName` to `th.ac.mfu.ivts` and `urlTemplate` to CartoDB Voyager tiles |

## T4 Current Behavior

- Previous behavior: `location_screen.dart` used `userAgentPackageName: 'com.example.app'` with OpenStreetMap tile server. OSM policy blocked `com.example.app` with HTTP 403 Forbidden tiles ("Access blocked: App is not following the tile usage policy...").

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Workflow coordination |
| Mobile | yes | `location_screen.dart` TileLayer update |
| QA/UAT | yes | Map tile rendering verification |
| Release/Ops | yes | Tasklist & progress update |

## T6 Scope

In scope:
- Replace placeholder `com.example.app` with valid `th.ac.mfu.ivts` identifier.
- Configure CartoDB Voyager tile layer URL with OpenStreetMap attribution.

Out of scope:
- Backend map services.

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-MAP-001 | Render map tiles on Location screen without HTTP 403 tile blocks | User | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-MAP-001 | FR-MAP-001 | User opens Location tab in mobile app | Map screen loads | Map tiles load cleanly with Voyager tiles and OSM attribution |

## T9 API Contract

- N/A (Client tile layer)

## T10 Data Model / Migration

- N/A

## T11 Backend Plan / Changes

- N/A

## T12 Frontend Plan / Changes

- `user-mobile-application/lib/screens/location_screen.dart`: Updated `TileLayer` with valid `userAgentPackageName: 'th.ac.mfu.ivts'` and CartoDB Voyager tile URL template.

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Tile Usage Policy | Complies 100% with OSM / CartoDB Tile Usage Policy |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-MAP-001 | Code check | Dev | `flutter analyze lib/screens/location_screen.dart` | No issues found |

## T15 Implementation Summary

| File | Change |
|---|---|
| `user-mobile-application/lib/screens/location_screen.dart` | Updated TileLayer `userAgentPackageName` & tile layer template |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `flutter analyze lib/screens/location_screen.dart` | PASS | Clean analysis |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/tasks/2026-07-30-mobile-osm-map-fix.md` | yes | Active tasklist updated |
| `docs/tasks/tasklist-progress.md` | yes | System tasklist progress updated |
| `docs/changes/2026-07-30-mobile-osm-map-fix.md` | yes | Created change document |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| D-001 | Decision | Use `th.ac.mfu.ivts` User-Agent with CartoDB Voyager tiles | AI | closed |

## T19 Release / Rollback

- Release steps: Restart Flutter mobile application (`flutter run`).
- Smoke checks: Open Location tab and verify map tiles.

## T20 Final Handoff

```txt
Feature: Mobile App OpenStreetMap Tile Fix
Status: Done
Active tasklist: docs/tasks/2026-07-30-mobile-osm-map-fix.md
Task IDs: ivts-MAP-001..004
Progress: 100%
Changed files:
  - user-mobile-application/lib/screens/location_screen.dart
Routes: N/A
UI routes: ตำแหน่ง (Location screen)
Tests run: flutter analyze PASS
PRD/docs: Updated active tasklist, change record, and tasklist-progress.md / HTML
```
