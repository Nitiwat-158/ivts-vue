import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'services/app_data_repository.dart';
import 'theme/app_theme.dart';

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
    return MaterialApp(
      title: 'IVTS User Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: ValueListenableBuilder<int>(
        valueListenable: AppDataRepository.instance.refreshTick,
        builder: (context, _, __) => const HomeScreen(),
      ),
    );
  }
}
