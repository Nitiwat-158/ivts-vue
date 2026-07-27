import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'sign_in_screen.dart';

/// เช็คว่ามี token ที่ล็อกอินค้างอยู่ไหมก่อนตัดสินใจว่าจะโชว์ SignInScreen 
/// หรือหน้าที่ authenticatedChild กำหนด (ปกติคือ HomeScreen)
class AuthGate extends StatelessWidget {
  final Widget authenticatedChild;

  const AuthGate({super.key, required this.authenticatedChild});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String?>(
      future: AuthService().getStoredToken(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        final hasToken = snapshot.data != null && snapshot.data!.isNotEmpty;
        return hasToken ? authenticatedChild : const SignInScreen();
      },
    );
  }
}
