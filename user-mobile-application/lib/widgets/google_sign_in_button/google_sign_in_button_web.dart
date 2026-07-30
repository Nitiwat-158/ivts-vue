import 'package:flutter/material.dart';
import 'package:google_sign_in_platform_interface/google_sign_in_platform_interface.dart';
import 'package:google_sign_in_web/google_sign_in_web.dart' as web;

Widget buildPlatformGoogleSignInButton({required VoidCallback onPressed}) {
  return SizedBox(
    width: double.infinity,
    height: 48,
    child: (GoogleSignInPlatform.instance as web.GoogleSignInPlugin).renderButton(
      configuration: web.GSIButtonConfiguration(
        type: web.GSIButtonType.standard,
        theme: web.GSIButtonTheme.outline,
        size: web.GSIButtonSize.large,
        shape: web.GSIButtonShape.rectangular,
        logoAlignment: web.GSIButtonLogoAlignment.center,
      ),
    ),
  );
}
