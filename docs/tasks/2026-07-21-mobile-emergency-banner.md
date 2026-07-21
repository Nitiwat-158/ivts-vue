# Tasklist: Mobile Emergency Request Banner UI

| Field | Value |
|---|---|
| Date | 2026-07-21 |
| Project | IVTS |
| Module / Feature | User Mobile App Home UI |
| Requirement | Implement active Emergency Request banner at top of Home screen, navigating to EmergencyStatusScreen and matching screenshot design. |
| Source Request | User prompt with screenshot: "แก้ไขนิดหน่อย ผมต้องการให้มันกดแล้วไปที่หน้านี้(ตามรูปที่แนบไป)..." |
| Active Change Record | `docs/changes/2026-07-21-mobile-emergency-banner.md` |
| Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, obtained user approval before editing. |
| Home Screen | `user-mobile-application/lib/screens/home_screen.dart` | Added active emergency request banner navigating to EmergencyStatusScreen. |
| Emergency Status Screen | `user-mobile-application/lib/screens/emergency_status_screen.dart` | Updated UI layout, warning card, timeline steps, and Mark resolved action to match screenshot. |
| Vehicle Card Widget | `user-mobile-application/lib/widgets/vehicle_card.dart` | Styled Emergency button with warning icon and accent red background. |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-EMGBNR-001 | Source discovery | Orchestrator | AI | none | done | 100 | Inspected home_screen.dart and vehicle_card.dart | `home_screen.dart`, `vehicle_card.dart` | Visual comparison | none | — | Source mapped |
| ivts-EMGBNR-002 | Implement emergency banner | Frontend | AI | ivts-EMGBNR-001 | done | 100 | Added _ActionBanner in home_screen.dart | `home_screen.dart` | Code checks | none | — | Banner implemented |
| ivts-EMGBNR-003 | Style vehicle card emergency button | Frontend | AI | ivts-EMGBNR-002 | done | 100 | Updated ElevatedButton.icon in vehicle_card.dart | `vehicle_card.dart` | Code checks | none | — | Button styled |
| ivts-EMGBNR-004 | Document and handoff | Ops | AI | ivts-EMGBNR-003 | done | 100 | Compiled T1-T20 change record | `docs/changes/2026-07-21-mobile-emergency-banner.md` | Code checks | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code Inspection | PASS | Visual & structural check against screenshot |

## Final Handoff Link

- Change record: `docs/changes/2026-07-21-mobile-emergency-banner.md`
