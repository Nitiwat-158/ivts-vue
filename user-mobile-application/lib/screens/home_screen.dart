import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/top_bar_actions.dart';
import '../widgets/vehicle_card.dart';
import 'history_screen.dart';
import 'location_screen.dart';
import 'profile_screen.dart';
import 'vehicles_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tabIndex = 0;
  bool _showRenewalBanner = true;
  bool _hasNoVehicles = false;

  void _onNavTap(int index) {
    if (index == _tabIndex) return;
    setState(() => _tabIndex = index);
  }

  String _tabTitle(int index) {
    switch (index) {
      case 0:
        return 'Home';
      case 1:
        return 'My Vehicles';
      case 2:
        return 'Location';
      case 3:
        return 'History';
      case 4:
        return 'Profile';
      default:
        return 'Home';
    }
  }

  Vehicle? get _expiringVehicle {
    try {
      return MockData.vehicles.firstWhere((v) => v.status == VehicleStatus.expiringSoon);
    } catch (_) {
      return null;
    }
  }

  Widget _buildTabBody() {
    switch (_tabIndex) {
      case 1:
        return VehiclesListScreen(
          onBack: () => setState(() => _tabIndex = 0),
        );
      case 2:
        return const LocationScreen();
      case 3:
        return HistoryScreen(onBack: () => setState(() => _tabIndex = 0));
      case 4:
        return ProfileScreen(onBack: () => setState(() => _tabIndex = 0));
      case 0:
      default:
        final expiring = _expiringVehicle;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          children: [
            const Text(
              'Today (April 11, 2026)',
              style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            if (_hasNoVehicles)
              _ActionBanner(
                color: AppColors.primary,
                icon: Icons.directions_car_outlined,
                text: 'คุณยังไม่ได้ลงทะเบียนรถ — เริ่มต้นลงทะเบียนรถของคุณ',
                onTap: () {},
              ),
            if (!_hasNoVehicles && expiring != null && _showRenewalBanner)
              _ActionBanner(
                color: expiring.daysUntilExpiry <= 7
                    ? AppColors.accentRed.withOpacity(0.85)
                    : AppColors.warningAmber,
                icon: Icons.warning_amber_rounded,
                text: 'รถ ${expiring.vehicleCode} ใกล้หมดอายุทะเบียนใน ${expiring.daysUntilExpiry} วัน',
                onTap: () {},
                onDismiss: () => setState(() => _showRenewalBanner = false),
              ),
            const SizedBox(height: 8),
            if (!_hasNoVehicles)
              ...MockData.vehicles.map((v) => VehicleCard(vehicle: v)),
          ],
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: _tabIndex == 1 || _tabIndex == 2 || _tabIndex == 3 || _tabIndex == 4
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded),
                onPressed: () => setState(() => _tabIndex = 0),
              )
            : null,
        title: Text(_tabTitle(_tabIndex)),
        actions: const [TopBarActions(), SizedBox(width: 8)],
      ),
      body: SafeArea(child: _buildTabBody()),
      bottomNavigationBar: AppBottomNavBar(currentIndex: _tabIndex, onTap: _onNavTap),
    );
  }
}

class _PlaceholderSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color accent;

  const _PlaceholderSection({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: accent.withOpacity(0.3), width: 1),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 44, color: accent),
              const SizedBox(height: 12),
              Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionBanner extends StatelessWidget {
  final Color color;
  final IconData icon;
  final String text;
  final VoidCallback onTap;
  final VoidCallback? onDismiss;

  const _ActionBanner({
    required this.color,
    required this.icon,
    required this.text,
    required this.onTap,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color, width: 1),
        ),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 10),
            Expanded(
              child: Text(text, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
            ),
            if (onDismiss != null)
              GestureDetector(
                onTap: onDismiss,
                child: Icon(Icons.close, size: 18, color: color),
              ),
          ],
        ),
      ),
    );
  }
}
