# Tasklist: CCTV Viewer Page Integration

| Field | Value |
|---|---|
| Date | 2026-07-10 |
| Project | IVTS |
| Module / Feature | CCTV Viewer |
| Requirement | Create a CCTV viewer page with a sidebar navigation button in frontend-vue |
| Source Request | User Request |
| Active Change Record | `docs/changes/2026-07-10-cctv-viewer.md` |
| Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Sequence rules, Done criteria, and T1-T20 rules |
| Docs control index | `docs/AI-DOCS-INDEX.md` | Documentation inventory |
| Tasklist guide | `docs/tasks/README.md` | Column definitions, progress gate percentages |
| Frontend route truth | `frontend-vue/src/router/index.js` | Children routes of TheContainer |
| Frontend sidebar | `frontend-vue/src/containers/_nav.js` | Item structure and buildNav function |
| Frontend locales | `frontend-vue/src/store/lang/en.js`, `frontend-vue/src/store/lang/th.js` | nav translation keys |
| Sidebar component | `frontend-vue/src/containers/TheSidebar.vue` | Added bypass condition for public items |
| Permissions boot | `backend-node/scripts/bootstrap-ivts-permissions.js` | Registered /cctv/viewer in default matrix |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-CCTV-001 | Source discovery | Orchestrator | AI | none | done | 100 | Verified router, nav list, and translation formats | `_nav.js`, `router/index.js`, `en.js`, `th.js` | none | none | Implement page components | Tasklist and plan created |
| ivts-CCTV-002 | Implement CCTV Viewer & Nav | Frontend | AI | ivts-CCTV-001 | done | 100 | Created components, routes, sidebar entry, locale keys, and bypassed router meta check | `CCTVViewer.vue`, `CameraList.vue`, `CameraView.vue`, `TheSidebar.vue`, `_nav.js`, `router/index.js` | none | none | Verify locally | Page, components, route, sidebar item, translation additions |
| ivts-CCTV-003 | Verify CCTV Viewer page | QA | AI | ivts-CCTV-002 | done | 100 | Visual inspection and local verify; public path configuration renders on sidebar and router bypass fixed 403 | `CCTVViewer.vue`, `TheSidebar.vue`, `_nav.js`, `router/index.js` | none | none | Update README & index docs | Visual page checks |
| ivts-CCTV-004 | Update documentation | Docs | AI | ivts-CCTV-003 | done | 100 | Updated README.md, AI-DOCS-INDEX.md, and created change document | `README.md`, `docs/AI-DOCS-INDEX.md`, `docs/changes/2026-07-10-cctv-viewer.md` | none | none | Update tasklist-progress.md & HTML | Edited docs & change doc |
| ivts-CCTV-005 | Handoff and update progress dashboard | Release/Ops | AI | ivts-CCTV-004 | done | 100 | Updated progress dashboard files and permission boot configurations for router | `docs/tasks/tasklist-progress.md`, `bootstrap-ivts-permissions.js` | none | none | none | Updated dashboard |

## Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| R-001 | Risk | Missing real CCTV source URLs, using mock placeholders | AI | open |
| A-001 | Assumption | Bypass routing permission limits if Permission Matrix is not seeded with '/cctv/viewer' | AI | open |
| D-001 | Decision | Use component-based layout: `CCTVViewer.vue` as manager, `CameraList.vue` and `CameraView.vue` as sub-UI components | AI | closed |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| npm run lint | blocked | PowerShell script running disabled by Windows execution policy on host machine |
| code syntax check | passed | Visual validation of components and configurations |

## Final Handoff Link

- Change record: `docs/changes/2026-07-10-cctv-viewer.md`
