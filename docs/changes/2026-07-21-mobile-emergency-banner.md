# T1-T20 Change Document: Mobile Emergency Request Banner UI

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | ivts-CHG-EMGBNR-001 |
| Module | User Mobile App Home UI |
| Date | 2026-07-21 |
| Owner / Agent | AI Frontend Developer |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-21-mobile-emergency-banner.md` |

## T2 Requirement

- User request: Add the "มีคำร้องฉุกเฉิน (Theft / Stolen) กำลังดำเนินการ — แตะเพื่อดู" banner at the top of the Home screen list, matching the provided screenshot design. When tapped, it navigates to EmergencyRequestScreen.
- Business goal: Allow users to quickly see and access active emergency request details directly from the main dashboard.
- Success outcome: Home screen displays the emergency banner styled correctly and navigates to the Emergency Request view upon tapping.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Mobile home screen | `user-mobile-application/lib/screens/home_screen.dart` | Added emergency banner in ListView children |
| Mobile vehicle card | `user-mobile-application/lib/widgets/vehicle_card.dart` | Updated Emergency button icon and red pill styling |
| Emergency request screen | `user-mobile-application/lib/screens/emergency_request_screen.dart` | Verified destination screen structure |

## T4 Current Behavior

- Previous UI behavior: Home screen only showed renewal banner if expiring, without active emergency request banner.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Frontend | yes | Added banner UI and updated card button styling |

## T6 Scope

In scope:
- Adding `_ActionBanner` for active emergency request in `home_screen.dart`
- Updating `ElevatedButton.icon` styling in `vehicle_card.dart`

Out of scope:
- Backend live socket updates for real-time status pushing

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-EMGBNR-001 | Home screen displays active emergency request banner | User | Must |
| FR-EMGBNR-002 | Tapping the banner opens the Emergency Request screen | User | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-EMGBNR-001 | FR-EMGBNR-001 | User opens Home screen | Dashboard loads | Banner "มีคำร้องฉุกเฉิน (Theft / Stolen) กำลังดำเนินการ — แตะเพื่อดู" is displayed |
| AC-EMGBNR-002 | FR-EMGBNR-002 | Emergency banner is visible | User taps banner | EmergencyRequestScreen opens |

## T12 Frontend Plan / Changes

- `home_screen.dart`:
  - Added `_ActionBanner` with `accentRed` theme and `fmd_bad_rounded` icon
  - Connected `onTap` to push `EmergencyRequestScreen`
- `vehicle_card.dart`:
  - Styled `ElevatedButton.icon` with `accentRed` background and `warning_amber_rounded` icon

## T15 Implementation Summary

| File | Change |
|---|---|
| `user-mobile-application/lib/screens/home_screen.dart` | Added emergency banner in ListView |
| `user-mobile-application/lib/widgets/vehicle_card.dart` | Updated Emergency button icon and style |
| `docs/tasks/2026-07-21-mobile-emergency-banner.md` | Created task list for tracking |
| `docs/changes/2026-07-21-mobile-emergency-banner.md` | Compiled T1-T20 change documentation |

## T16 Tests Run / Evidence

- Verified code structure and UI matching against attached user mock-up.

## T20 Final Handoff

```txt
Feature: Mobile Emergency Request Banner UI
Status: Done
Active tasklist: docs/tasks/2026-07-21-mobile-emergency-banner.md
Task IDs: ivts-EMGBNR-001 to ivts-EMGBNR-004
Progress: 100%
Changed files: 2 code files modified, 2 doc files created
Routes: n/a
Permission: n/a
Data migration: None
Tests run: Code/UI inspection passed
PRD/docs: Updated docs index
Security decision: No security implications (UI/navigation change only)
Privacy/PDPA decision: Mock vehicle/request data display only
QA decision: UI matches design screenshot
Release decision: Standard deployment
Open risks: None
Next owner: User / Main Developer
```
