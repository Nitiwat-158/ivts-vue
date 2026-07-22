# Tasklist: Home Renewal Banner Navigation

| Field | Value |
|---|---|
| Date | 2026-07-22 |
| Project | IVTS |
| Module / Feature | User Mobile App — Home / Renewal Banner |
| Requirement | เชื่อมต่อ Banner "ใกล้หมดอายุทะเบียน" ในหน้า Home ให้กดแล้ว Navigate ไปยังหน้า `RenewalRequestScreen` พร้อมส่งข้อมูลรถคันนั้นไปด้วย |
| Source Request | User prompt พร้อมรูปภาพ: "ตรงหน้า Home คำว่า"ใกล้หมดอายุทะเบียนใน 21 วัน" ช่วยทำให้กดไปแล้วไปโผล่หน้าของ renewal ให้หน่อย" |
| Active Change Record | `docs/changes/2026-07-22-home-renewal-banner.md` |
| Status | done |
| Overall Progress | 90% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | Followed rules strictly, asked permission before changes |
| Home screen | `lib/screens/home_screen.dart` | Confirmed `_showRenewalBanner` section and empty `onTap` for `_ActionBanner` |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| ivts-HRB-001 | Wire renewal banner in home_screen | Frontend | AI | none | done | 100 | `Navigator.push` added to `_ActionBanner` | `lib/screens/home_screen.dart` | Code inspection | none | — | Navigation wired |
| ivts-HRB-002 | Document and handoff | Ops | AI | ivts-HRB-001 | done | 100 | Created T1-T20 change record | `docs/changes/2026-07-22-home-renewal-banner.md` | — | none | — | Handoff document |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| Code inspection | PASS | Navigation logic passes the `expiring` vehicle argument correctly to `RenewalRequestScreen`. |
| Flutter hot reload | NOT RUN | Requires running Flutter env. Nav logic is standard `Navigator.push`. |

## Final Handoff Link

- Change record: `docs/changes/2026-07-22-home-renewal-banner.md`
