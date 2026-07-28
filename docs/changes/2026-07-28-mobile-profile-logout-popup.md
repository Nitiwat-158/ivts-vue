# Change Record: Mobile App Profile Logout Confirmation Pop-up

| Field | Value |
|---|---|
| Date | 2026-07-28 |
| Project | IVTS Mobile Application |
| Change ID | `T1-T20-2026-07-28-mobile-profile-logout-popup` |
| Module | `user-mobile-application` |
| Feature | Logout Confirmation Pop-up & Auth Reset Redirect |
| Status | Done |

## T1. Source Evidence

- [profile_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/profile_screen.dart)
- [locale_provider.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/providers/locale_provider.dart)
- [auth_service.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/services/auth_service.dart)
- [sign_in_screen.dart](file:///g:/MFU/Project/ivts-vue/ivts-vue/user-mobile-application/lib/screens/sign_in_screen.dart)

## T2. Requirement & Background

When tapping the "Log out / ออกจากระบบ" button on the `ProfileScreen`, a confirmation pop-up dialog should be displayed. Upon confirmation, the stored authentication token should be deleted (`AuthService().signOut()`) and the app should redirect to `SignInScreen`.

## T3. Summary of Changes

1. **`user-mobile-application/lib/providers/locale_provider.dart`**:
   - Added translation keys `'confirm_logout_title'` (`'ยืนยันการออกจากระบบ'` / `'Confirm Logout'`) and `'confirm_logout_message'` (`'คุณแน่ใจหรือไม่ที่จะออกจากระบบ?'` / `'Are you sure you want to log out?'`).

2. **`user-mobile-application/lib/screens/profile_screen.dart`**:
   - Added `_showLogoutDialog()` displaying `AlertDialog` matching standard app modal styling.
   - On confirmation, calls `await AuthService().signOut()` and redirects to `SignInScreen` via `Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(...)`.
   - Updated logout button `onPressed` to invoke `_showLogoutDialog()`.

## T4. Verification Evidence

- `flutter analyze lib/` executed on `user-mobile-application`: `No issues found!`.

## T5. Impact Analysis & PRD Decisions

- **PRD Impact**: Prevents accidental logouts and guarantees clean authentication token removal on logout before redirecting to sign in.
- **Security & Data**: Calls `AuthService().signOut()` to delete secure storage `app_token`.

## T20. Handoff Notes

- Tested & static analysis verified.
- Pop-up matches theme and localization settings.
