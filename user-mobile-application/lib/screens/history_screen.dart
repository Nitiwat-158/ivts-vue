import '../providers/locale_provider.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/history_entry.dart';
import '../theme/app_theme.dart';
import 'history_detail_screen.dart';

class HistoryScreen extends StatefulWidget {
  final VoidCallback onBack;

  const HistoryScreen({super.key, required this.onBack});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _selectedDate = 'all_time';
  String _selectedVehicle = 'all_vehicles';

  List<String> get _dateOptions {
    final dates = MockData.tripHistory.map((e) => e.dateGroup).toSet().toList();
    return ['all_time', ...dates];
  }

  List<String> get _vehicleOptions {
    final vehicles = MockData.tripHistory.map((e) => e.vehicleCode).toSet().toList();
    return ['all_vehicles', ...vehicles];
  }

  void _showFilterSheet(String title, List<String> options, String currentValue, ValueChanged<String> onSelected) {
    final loc = context.read<LocaleProvider>();
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primary)),
              ),
              ...options.map((opt) {
                String displayOpt = opt;
                if (opt == 'all_time') {
                  displayOpt = loc.t('all_time');
                } else if (opt == 'all_vehicles') {
                  displayOpt = loc.t('all_vehicles');
                } else {
                  displayOpt = loc.translateDateGroup(opt);
                }

                return ListTile(
                  title: Text(displayOpt, style: TextStyle(
                    color: opt == currentValue ? AppColors.primary : AppColors.textSecondary,
                    fontWeight: opt == currentValue ? FontWeight.bold : FontWeight.normal,
                  )),
                  trailing: opt == currentValue ? const Icon(Icons.check, color: AppColors.primary) : null,
                  onTap: () {
                    onSelected(opt);
                    Navigator.pop(ctx);
                  },
                );
              }),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final loc = context.watch<LocaleProvider>();
    final filtered = MockData.tripHistory.where((trip) {
      final matchDate = _selectedDate == 'all_time' || trip.dateGroup == _selectedDate;
      final matchVehicle = _selectedVehicle == 'all_vehicles' || trip.vehicleCode == _selectedVehicle;
      return matchDate && matchVehicle;
    }).toList();

    final grouped = <String, List<TripHistory>>{};
    for (final trip in filtered) {
      grouped.putIfAbsent(trip.dateGroup, () => []).add(trip);
    }

    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      child: ListView(
        children: [
          Row(
            children: [
              Expanded(
                child: _FilterChip(
                  label: _selectedDate == 'all_time' ? loc.t('date') : loc.translateDateGroup(_selectedDate),
                  onTap: () => _showFilterSheet(loc.t('select_date'), _dateOptions, _selectedDate, (val) => setState(() => _selectedDate = val)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _FilterChip(
                  label: _selectedVehicle == 'all_vehicles' ? loc.t('vehicle') : _selectedVehicle,
                  onTap: () => _showFilterSheet(loc.t('select_vehicle'), _vehicleOptions, _selectedVehicle, (val) => setState(() => _selectedVehicle = val)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (grouped.isEmpty)
            Padding(
              padding: EdgeInsets.only(top: 40),
              child: Center(child: Text(context.watch<LocaleProvider>().t('no_trips_found'), style: TextStyle(color: AppColors.textSecondary))),
            ),
          for (final group in grouped.entries) ...[
            Text(
              loc.translateDateGroup(group.key),
              style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ...group.value.map((trip) => GestureDetector(
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const HistoryDetailScreen()),
                  ),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.divider.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${trip.vehicleCode}   ID: ${trip.vehicleId}',
                                style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.primary),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${trip.date}   ${trip.time}',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded, color: AppColors.primary),
                      ],
                    ),
                  ),
                )),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;

  const _FilterChip({required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.divider),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child: Text(
                label,
                style: const TextStyle(color: AppColors.primary),
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
              ),
            ),
            const Icon(Icons.arrow_drop_down, size: 18, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
