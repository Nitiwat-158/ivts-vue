# Tasklist: Localization — Navigation Bar & AppBar Title

| Field | Value |
|---|---|
| Date | 2026-07-29 |
| Project | IVTS |
| Module / Feature | User Mobile App — Navigation Bar / AppBar |
| Requirement | แก้ไข BottomNavigationBar labels และ AppBar title ให้รองรับการสลับภาษา (TH/EN) ผ่านระบบ LocaleProvider เดิม |
| Source Request | User prompt: "เริ่มแก้ไขระบบสลับภาษาจาก navigation bar ก่อน" |
| Active Change Record | `docs/changes/2026-07-29-localization-nav.md` |
| Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, asked permission before changes |
| Translation Map | `lib/providers/locale_provider.dart` | All 5 nav keys (`home`, `vehicles`, `location`, `history`, `profile`) existed; `my_vehicles` was missing and was added |
| Bottom Nav Bar | `lib/widgets/bottom_nav_bar.dart` | Was using `const` String labels → items could not rebuild |
| Home Screen | `lib/screens/home_screen.dart` | `_tabTitle()` returned hardcoded English strings |

## Tasks

| Task ID | Task | Status | Evidence |
|---|---|---|---|
| ivts-LN-001 | Add `my_vehicles` key to locale_provider.dart | done | Key added at line 113 |
| ivts-LN-002 | Update bottom_nav_bar.dart to use LocaleProvider | done | All 5 labels now use `loc.t()` |
| ivts-LN-003 | Update `_tabTitle()` in home_screen.dart | done | Uses `context.read<LocaleProvider>().t()` |
| ivts-LN-004 | Document and handoff | done | Change record created |

## Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection | PASS | Nav labels and AppBar title all read from LocaleProvider |
| No new packages | PASS | Only used `provider` which was already a dependency |
| Layout unchanged | PASS | No layout/style changes made |

## Final Handoff Link

- Change record: `docs/changes/2026-07-29-localization-nav.md`
