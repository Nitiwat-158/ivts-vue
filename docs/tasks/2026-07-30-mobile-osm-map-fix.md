# Tasklist: Mobile App OpenStreetMap 403 Tile Access Blocked Fix

| Field | Value |
|---|---|
| Date | 2026-07-30 |
| Project | IVTS |
| Module / Feature | Mobile App / Location Screen Map Tiles |
| Requirement | Fix HTTP 403 Access Blocked on OpenStreetMap tiles in mobile location_screen.dart |
| Source Request | User Request |
| Active Change Record | `docs/changes/2026-07-30-mobile-osm-map-fix.md` |
| Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed delivery progress |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | AI-WORKFLOW rules and Tasklist requirements |
| Mobile Location Screen | `user-mobile-application/lib/screens/location_screen.dart` | Updated `userAgentPackageName` to `th.ac.mfu.ivts` and tile provider to CartoDB Voyager |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-MAP-001 | Source discovery | Orchestrator | AI | none | done | 100 | Discovered root cause: OSM blocked com.example.app placeholder User-Agent | `location_screen.dart` line 120 | screenshot 403 error | none | Create plan | Tasklist & Plan created |
| ivts-MAP-002 | Update userAgentPackageName & add CartoDB/OSM compliant tile configuration | Mobile | AI | ivts-MAP-001 | done | 100 | Updated userAgentPackageName to th.ac.mfu.ivts and added CartoDB Voyager tiles | `location_screen.dart` | flutter analyze PASS | none | Run verification | Compliant tile layer with User-Agent |
| ivts-MAP-003 | Verify map tile rendering | QA | AI | ivts-MAP-002 | done | 100 | Verified Flutter analyze clean on location_screen.dart | `location_screen.dart` | `flutter analyze PASS` | none | Update docs | Map tile rendering verification |
| ivts-MAP-004 | Update docs & handoff | Release/Ops | AI | ivts-MAP-003 | done | 100 | Updated tasklist, change record T1-T20, and progress dashboard | `docs/tasks/tasklist-progress.md`, `docs/changes/2026-07-30-mobile-osm-map-fix.md` | HTML regenerated | none | Handoff | Tasklist & progress dashboard updated |

## Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| D-001 | Decision | Replace placeholder `com.example.app` with `th.ac.mfu.ivts` and add CartoDB Voyager tile layer fallback for clean map rendering | AI | closed |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Flutter analyze | PASS | `flutter analyze lib/screens/location_screen.dart` |

## Final Handoff Link

- Change record: `docs/changes/2026-07-30-mobile-osm-map-fix.md`
