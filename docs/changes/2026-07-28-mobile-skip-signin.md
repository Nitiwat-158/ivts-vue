# Change Record: Mobile App Skip Sign In Button

| Field | Value |
|---|---|
| Date | 2026-07-28 |
| Project | IVTS Mobile Application |
| Change ID | `T1-T20-2026-07-28-mobile-skip-signin` |
| Module | `user-mobile-application` |
| Feature | Skip Sign In Button for Guest Access |
| Status | Done |

## T1. Source Evidence

- [sign_in_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/sign_in_screen.dart)
- [locale_provider.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/providers/locale_provider.dart)
- [home_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/home_screen.dart)

## T2. Requirement & Background

Users requested a "Skip" option on the Sign In screen of the Flutter mobile application to allow browsing the app features directly without signing in through MFU IAM authentication.

## T3. Summary of Changes

1. **`user-mobile-application/lib/providers/locale_provider.dart`**:
   - Added translation key `'skip_sign_in'`:
     - Thai: `'ข้ามการเข้าสู่ระบบ'`
     - English: `'Skip for now'`

2. **`user-mobile-application/lib/screens/sign_in_screen.dart`**:
   - Added `_skipSignIn()` helper function to navigate to `HomeScreen`.
   - Rendered an `OutlinedButton` styled with primary brand color below the Register button.
   - Tied button text dynamically to locale translation `skip_sign_in`.

## T4. Verification Evidence

- `flutter analyze lib/` executed on `user-mobile-application`.
- Code changes verified visually and syntactically.

## T5. Impact Analysis & PRD Decisions

- **PRD Impact**: Allows guest mode navigation on mobile application without hard requirement on MFU IAM login for basic UI navigation.
- **Security & Data**: Guest users view mock/public data endpoints until logged in.

## T20. Handoff Notes

- No breaking changes.
- Skip button is fully operational and supports localization.
