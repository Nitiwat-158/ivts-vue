# T1-T20 Change Record: Dashboard Emergency Alerts

## T1. Request / Context
Update the alerts box in Dashboard to support Emergency Report mock data and add two new dropdown filters (source and severity).

## T2. Source Discovery
- Investigated `Dashboard.vue` to understand how `alerts` array is structured and rendered.
- Investigated `src/store/lang/en.js` and `th.js` for translations.

## T3-T10. Decisions and Architecture
- Add translation keys to `ivts` section in `en.js` and `th.js`.
- Add `filterSource` and `filterSeverity` properties in `Dashboard.vue` data state.
- Create `filteredAlerts` computed property to handle filtering by Source and Severity using AND logic.
- Add mockup data points for `emergency_report` to `alerts` array.
- Render `emergency_report` alerts with proper styling, tags, and coloring according to their severity and source. Keep existing alerts (offline, unregistered) intact.

## T11-T14. Implementation
- Modified `frontend-vue/src/views/Dashboard.vue`.
- Modified `frontend-vue/src/store/lang/en.js`.
- Modified `frontend-vue/src/store/lang/th.js`.

## T15. Final Summary
The Dashboard Alerts section now displays dropdown filters for "Source" and "Severity". Mock data for "Emergency Reports" has been added and styled correctly, showing appropriate tags for human-sourced reports and applying severity-based colors. The filters work interchangeably with an AND condition.

## T16. Verification
`npm run build` executed and passed on 2026-07-18.

## T17-T19. PRD / Docs
No PRD updates are necessary for this mockup level implementation.

## T20. Sign-off
Signed off by Agent (Frontend) at 2026-07-18.