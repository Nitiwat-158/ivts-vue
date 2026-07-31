import 'package:flutter/material.dart';

import 'google_sign_in_button_mobile.dart'
    if (dart.library.js_interop) 'google_sign_in_button_web.dart';

Widget buildGoogleSignInButton({required VoidCallback onPressed}) {
  return buildPlatformGoogleSignInButton(onPressed: onPressed);
}
