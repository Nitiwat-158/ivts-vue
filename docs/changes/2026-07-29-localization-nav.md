# T1-T20 Change Record: Localization — Navigation Bar & AppBar Title

| Field | Value |
|---|---|
| Change ID | ivts-LN-2026-07-29 |
| Date | 2026-07-29 |
| Project | IVTS |
| Module | User Mobile App — Navigation Bar |
| Type | Frontend — Localization fix |
| Status | done |
| Author | AI (Antigravity) |
| Approved By | User (verbal approval via chat) |

---

## T1 — Requirement

แก้ไข `BottomNavigationBar` labels และ AppBar title ใน `HomeScreen` ให้เปลี่ยนตามภาษาที่ผู้ใช้เลือก โดยใช้ `LocaleProvider` เดิมที่มีอยู่ในโปรเจกต์

## T2 — Source Evidence

| File | Lines | Purpose |
|---|---|---|
| `lib/widgets/bottom_nav_bar.dart` | 45-51 | เดิมใช้ `const` String → ไม่ rebuild เมื่อสลับภาษา |
| `lib/screens/home_screen.dart` | 35-50 | `_tabTitle()` return hardcoded English strings |
| `lib/providers/locale_provider.dart` | 22-26 | พบ 5 keys ที่ครบ (`home`, `vehicles`, `location`, `history`, `profile`) แต่ขาด `my_vehicles` |

## T3 — Open Questions / Assumptions

`my_vehicles` key ถูกเพิ่มใหม่ใน `locale_provider.dart` เพราะ AppBar title ของ Tab 1 แสดงว่า 'My Vehicles' ซึ่งต่างจาก BottomNavBar ที่แสดง 'Vehicles'

## T4 — Affected Files

| File | Action | Description |
|---|---|---|
| `lib/providers/locale_provider.dart` | MODIFIED | เพิ่ม key `'my_vehicles'` |
| `lib/widgets/bottom_nav_bar.dart` | MODIFIED | นำ `LocaleProvider` มาใช้แทน `const` String labels |
| `lib/screens/home_screen.dart` | MODIFIED | แก้ `_tabTitle()` ให้ใช้ `loc.t()` |

## T5–T14 — Implementation

### locale_provider.dart
- เพิ่ม key `'my_vehicles'`: `{english: 'My Vehicles', thai: 'ยานพาหนะของฉัน'}`

### bottom_nav_bar.dart
- เพิ่ม import `provider` และ `locale_provider.dart`
- อ่าน `context.watch<LocaleProvider>()` ใน `build()`
- แทนที่ `const` String labels ทั้ง 5 ด้วย `loc.t('home')`, `loc.t('vehicles')`, `loc.t('location')`, `loc.t('history')`, `loc.t('profile')`
- ลบ `const` ออกจาก `items` list (เพราะ label ไม่ใช่ const อีกต่อไป)

### home_screen.dart
- แก้ `_tabTitle()` ให้ใช้ `context.read<LocaleProvider>().t(...)` แทน hardcoded string

## T15 — Implementation Summary

เมื่อผู้ใช้สลับภาษาในหน้า Profile ทั้ง BottomNavigationBar labels และ AppBar title จะเปลี่ยนเป็นภาษาที่เลือกทันที

## T16 — Verification

| Check | Result | Notes |
|---|---|---|
| Code inspection | PASS | ทุก label อ่านจาก LocaleProvider แล้ว |

## T17 — PRD / Docs Decision

ไม่มีการเปลี่ยน backend/business rule

## T18 — Security / PDPA

ไม่มีการเปลี่ยนข้อมูล

## T19 — Risks / Blockers

None

## T20 — Final Handoff

- Tasklist: `docs/tasks/2026-07-29-localization-nav.md`
- Change record: `docs/changes/2026-07-29-localization-nav.md`
- Modified: `lib/widgets/bottom_nav_bar.dart`, `lib/screens/home_screen.dart`, `lib/providers/locale_provider.dart`
