# Tasklist: Home Location Map Navigation

| Field | Value |
|---|---|
| Date | 2026-07-22 |
| Project | IVTS |
| Module / Feature | User Mobile App — Home / Vehicle Card |
| Requirement | เชื่อมต่อส่วนแผนที่ "แตะเพื่อดูเส้นทางแบบเต็มจอ" ในการ์ดรถหน้า Home ให้กดแล้ว Navigate ไปยังหน้า `LocationScreen` พร้อมส่งข้อมูลรถคันนั้นไปด้วย |
| Source Request | User prompt: "ในหน้า Home เห็นคำว่า แตะเพื่อดูเส้นทางแบบเต็มจอ ไหม พอเรากดไปมันจะขึ้นหน้า Location ของรถคันนั้นๆ" |
| Active Change Record | `docs/changes/2026-07-22-home-location-map.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, asked permission before changes |
| Vehicle card | `lib/widgets/vehicle_card.dart` | Located the map placeholder container |
| Location screen | `lib/screens/location_screen.dart` | Confirmed it accepts `initialVehicle` |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-HLM-001 | Wire map placeholder in vehicle_card | Frontend | AI | none | done | 100 | Wrapped container in `GestureDetector` with `Navigator.push` | `lib/widgets/vehicle_card.dart` | Code inspection | none | — | Navigation wired |
| ivts-HLM-002 | Add back button to LocationScreen | Frontend | AI | ivts-HLM-001 | done | 100 | Floating back button for pushed route | `lib/screens/location_screen.dart` | Code inspection | none | — | Back button added |
| ivts-HLM-003 | Document and handoff | Ops | AI | ivts-HLM-002 | done | 100 | Created T1-T20 change record | `docs/changes/2026-07-22-home-location-map.md` | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code inspection | PASS | Navigation logic passes the `vehicle` argument correctly to `LocationScreen`. |
| Flutter hot reload | NOT RUN | Requires running Flutter env. Nav logic is standard `Navigator.push`. |

## Final Handoff Link

- Change record: `docs/changes/2026-07-22-home-location-map.md`
