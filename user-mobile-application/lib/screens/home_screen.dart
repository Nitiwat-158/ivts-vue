import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/top_bar_actions.dart';
import '../widgets/vehicle_card.dart';

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

  Vehicle? get _expiringVehicle {
    try {
      return MockData.vehicles.firstWhere((v) => v.status == VehicleStatus.expiringSoon);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final expiring = _expiringVehicle;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: const [TopBarActions(), SizedBox(width: 8)],
      ),
      body: SafeArea(
        child: ListView(
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
        ),
      ),
      bottomNavigationBar: AppBottomNavBar(currentIndex: _tabIndex, onTap: _onNavTap),
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
