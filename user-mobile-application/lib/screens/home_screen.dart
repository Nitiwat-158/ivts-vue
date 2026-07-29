import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/locale_provider.dart';
import '../data/mock_data.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/top_bar_actions.dart';
import '../widgets/vehicle_card.dart';
import 'emergency_status_screen.dart';
import 'history_screen.dart';
import 'location_screen.dart';
import 'profile_screen.dart';
import 'renewal_request_screen.dart';
import 'vehicles_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tabIndex = 0;
  bool _showRenewalBanner = true;
  final bool _hasNoVehicles = false;
  Vehicle? _selectedLocationVehicle;

  void _onNavTap(int index) {
    if (index == _tabIndex) return;
    setState(() => _tabIndex = index);
  }

  String _tabTitle(int index) {
    final loc = context.read<LocaleProvider>();
    switch (index) {
      case 0:
        return loc.t('home');
      case 1:
        return loc.t('my_vehicles');
      case 2:
        return loc.t('location');
      case 3:
        return loc.t('history');
      case 4:
        return loc.t('profile');
      default:
        return loc.t('home');
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
          onLocationTap: (vehicle) {

            setState(() => _tabIndex = 2);

            setState(() {
              _selectedLocationVehicle = vehicle;
              _tabIndex = 2;
            });
          },
        );
      case 2:
        return LocationScreen(initialVehicle: _selectedLocationVehicle);
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
            Text(
              context.watch<LocaleProvider>().t('today'),
              style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            if (_hasNoVehicles)
              _ActionBanner(
                color: AppColors.primary,
                icon: Icons.directions_car_outlined,
                text: context.watch<LocaleProvider>().t('no_vehicle_banner'),
                onTap: () {},
              ),
            if (!_hasNoVehicles)
              _ActionBanner(
                color: AppColors.accentRed,
                icon: Icons.fmd_bad_rounded,
                text: context.watch<LocaleProvider>().t('emergency_banner'),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const EmergencyStatusScreen(),
                    ),
                  );
                },
              ),
            if (!_hasNoVehicles && expiring != null && _showRenewalBanner)
              _ActionBanner(
                color: expiring.daysUntilExpiry <= 7
                    ? AppColors.accentRed.withValues(alpha: 0.85)
                    : AppColors.warningAmber,
                icon: Icons.warning_amber_rounded,
                text: context.watch<LocaleProvider>().t('vehicle_expiring')
                    .replaceFirst('{code}', expiring.vehicleCode)
                    .replaceFirst('{days}', expiring.daysUntilExpiry.toString()),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => RenewalRequestScreen(vehicle: expiring),
                    ),
                  );
                },
                onDismiss: () => setState(() => _showRenewalBanner = false),
              ),
            const SizedBox(height: 8),
            if (!_hasNoVehicles)
              ...MockData.vehicles.map((v) => VehicleCard(
                    vehicle: v,
                    onLocationTap: (vehicle) {
                      setState(() {
                        _selectedLocationVehicle = vehicle;
                        _tabIndex = 2;
                      });
                    },
                  )),
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
          color: color.withValues(alpha: 0.15),
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
