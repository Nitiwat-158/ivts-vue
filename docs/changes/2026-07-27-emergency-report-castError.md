# Change Record: Emergency Report CastError Fix

## T1. Change Identification

| Field | Value |
|---|---|
| Change ID | 2026-07-27-emergency-report-castError |
| Date | 2026-07-27 |
| Project | IVTS |
| Module | Emergency Reports |
| Type | Bug Fix |
| Priority | High — 500 error on main Emergency Reports page |
| Author | AI (Backend Agent) |
| Tasklist | `docs/tasks/2026-07-27-emergency-report-castError.md` |

## T2. Problem Statement

GET /api/v1/ivts/emergency-reports returned HTTP 500 with:

```
CastError: Cast to ObjectId failed for value "CR0001" (type string) at path "_id" for model "Vehicle"
```

The Emergency Reports page showed "No data found" and no counts.

## T3. Root Cause

`emergency_report.vehicle_id` stores a `vehicle_code` string identifier (e.g. `"CR0001"`), not a MongoDB ObjectId. The `getAll` function in `emergency_report.js` attempted to cast `vehicle_id` values to ObjectId and, when all casts failed (since `"CR0001"` is not a hex ObjectId), fell through to a dangerous fallback:

```js
// OLD — BUG
vehicleQuery.$or.push({ _id: { $in: vehicleIds } }); // sent "CR0001" string to ObjectId _id → CastError
```

Similarly, `updateStatus` called `Vehicle.findById(report.vehicle_id)` where `vehicle_id = "CR0001"` → CastError.

Source evidence: `mobile.js` (live DB inspection comments, lines 10-27) confirms vehicles collection stores `vehicle_code` as the string identifier.

## T4. Files Changed

| File | Change |
|---|---|
| `backend-node/server/Project/ivts/service/emergency_report.js` | Replaced complex ObjectId/numeric cast logic in getAll with direct `vehicle_code` lookup; changed updateStatus from `findById` to `findOne({ vehicle_code })`. Removed now-unused `mongoose` import. |

## T5. Change Detail

### getAll (lines 34-45)

```diff
- const objectIdVehicleIds = vehicleIds.map(...).filter(Boolean);
- const numericVehicleIds = vehicleIds.map(id => Number(id)).filter(...);
- const vehicleQuery = { $or: [] };
- if (objectIdVehicleIds.length > 0) vehicleQuery.$or.push({ _id: { $in: objectIdVehicleIds } });
- if (numericVehicleIds.length > 0) vehicleQuery.$or.push({ vehicle_numeric_id: { $in: numericVehicleIds } });
- if (vehicleQuery.$or.length === 0) vehicleQuery.$or.push({ _id: { $in: vehicleIds } }); // ← BUG
- vehicles = await Vehicle.find(vehicleQuery).lean();
+ // vehicle_id stores vehicle_code string (e.g. "CR0001"), not ObjectId
+ vehicles = await Vehicle.find({ vehicle_code: { $in: vehicleIds } }).lean();
```

### vehicleMap key (line 45)

```diff
- const vehicleMap = Object.fromEntries(vehicles.map(v => [String(v._id), v]));
+ // Key by vehicle_code so it matches emergency_report.vehicle_id
+ const vehicleMap = Object.fromEntries(vehicles.map(v => [String(v.vehicle_code || v._id), v]));
```

### updateStatus (lines 97-100)

```diff
- enrichedVehicle = await Vehicle.findById(report.vehicle_id).lean();
+ // vehicle_id stores vehicle_code string (e.g. "CR0001"), not ObjectId
+ enrichedVehicle = await Vehicle.findOne({ vehicle_code: report.vehicle_id }).lean();
```

## T6. Data / Privacy Impact

No personal data fields added or changed. Read-only vehicle lookup. No PDPA impact.

## T7. Permission Impact

None. No route changes.

## T8. API Contract Impact

None. Same endpoint signature and response shape. Only internal query logic changed.

## T9. PRD Impact

None. Bug fix only — no behavior or requirement change.

## T15. Implementation Summary

Bug fixed in `emergency_report.js` by aligning vehicle lookup to use `vehicle_code` field (the actual string ID stored in `emergency_report.vehicle_id`) instead of trying to cast to ObjectId.

## T16. Tests / Verification Evidence

| Check | Result |
|---|---|
| `node --check backend-node/server/Project/ivts/service/emergency_report.js` | PASS — 2026-07-27 |
| Live GET /api/v1/ivts/emergency-reports | pending — requires running server restart |

## T17. PRD / Docs Decision

No PRD update needed. Bug fix only, no requirement change.
AI-DOCS-INDEX.md and tasklist-progress.md updated. tasklist-progress.html regenerated.

## T20. Final Handoff

| Item | Status |
|---|---|
| Code fix | done |
| Syntax check | PASS |
| Docs updated | done |
| Live smoke | pending — restart server and hit GET /api/v1/ivts/emergency-reports |
| Open risk | none |
