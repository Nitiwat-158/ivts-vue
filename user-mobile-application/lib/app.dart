import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'services/app_data_repository.dart';
import 'theme/app_theme.dart';
import 'providers/locale_provider.dart';
import 'screens/auth_gate.dart';
class UserMobileApp extends StatefulWidget {
  const UserMobileApp({super.key});

  @override
  State<UserMobileApp> createState() => _UserMobileAppState();
}

class _UserMobileAppState extends State<UserMobileApp> {
  @override
  void initState() {
    super.initState();
    // Replace MockData with live MongoDB-backed API data when reachable.
    // Any failure (backend unreachable, timeout, bad response) leaves
    // MockData untouched — see services/app_data_repository.dart.
    AppDataRepository.instance.refresh();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => LocaleProvider(),
      child: MaterialApp(
        title: 'IVTS User Mobile',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.theme,
      home: AuthGate(
        authenticatedChild: ValueListenableBuilder<int>(
          valueListenable: AppDataRepository.instance.refreshTick,
          builder: (context, _, __) => const HomeScreen(),
        ),
      ),
      ),
    );
  }
}
