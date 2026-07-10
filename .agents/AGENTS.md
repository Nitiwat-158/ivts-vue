# Workspace Rules for IVTS

We must follow `docs/AI-WORKFLOW.md` strictly for all tasks.


## 1. Operating Principle
- **No Guessing**: Every requirement, route, field, permission, UI behavior, test command, and release step must come from source code in the repository or be documented as an `Open Question`, `Assumption`, or `Blocker` with an owner.

## 2. Mandatory Rules
1. Read code/evidence from the repository first and cite the source in outputs.
2. Verify implementation by running tests/smoke checks before finalizing.
3. Use the `T1-T20` change document format for all changes/handoffs (saved under `docs/changes/2026-06-18-<topic>.md`).
4. Update the PRD when behavior, requirements, APIs, UI, permissions, data models, or release impacts change.
5. Record personal data fields (visible, hidden, stored/changed) and PDPA decisions for profile/account UI changes before release.
6. Match the existing codebase patterns (backend and frontend).
7. Use component-based structure for frontend (pages orchestration, UI in subcomponents).
8. Maintain an active tasklist under `docs/tasks/2026-06-18-<topic>.md` for every task, updating status, progress, evidence, blockers, and next actions at each gate.
9. Update the canonical progress in `docs/tasks/tasklist-progress.md` and regenerate the HTML via:
   ```sh
   node scripts/render-tasklist-progress-html.js .
   ```

## 3. Source Truth Order
1. Mounted / imported source code.
2. Tests and smoke scripts.
3. `docs/prd/PRD-ivts.md`.
4. Role instructions under `docs/agents/*`.
5. Environment/deployment configs (`README.md`, `ENVIRONMENTS.md`, `DEPLOY-UBUNTU.md`).
6. Older docs.
