import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/locale_provider.dart';
import '../theme/app_theme.dart';


class AppBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const AppBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final loc = context.watch<LocaleProvider>();
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.divider.withValues(alpha: 0.35),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 0,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        selectedLabelStyle: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
        showSelectedLabels: true,
        showUnselectedLabels: true,
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.home_rounded), label: loc.t('home')),
          BottomNavigationBarItem(icon: const Icon(Icons.directions_car_rounded), label: loc.t('vehicles')),
          BottomNavigationBarItem(icon: const Icon(Icons.location_on_rounded), label: loc.t('location')),
          BottomNavigationBarItem(icon: const Icon(Icons.access_time_rounded), label: loc.t('history')),
          BottomNavigationBarItem(icon: const Icon(Icons.person_rounded), label: loc.t('profile')),
        ],
      ),
    );
  }
}
