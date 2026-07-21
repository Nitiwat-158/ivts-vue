import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';
import 'vehicle_details_screen.dart';

class VehiclesListScreen extends StatelessWidget {
  final VoidCallback onBack;
  final Function(Vehicle) onLocationTap;

  const VehiclesListScreen({
    super.key,
    required this.onBack,
    required this.onLocationTap,
  });

  String _statusLabel(VehicleStatus s) {
    switch (s) {
      case VehicleStatus.pending:
        return 'Pending';
      case VehicleStatus.expiringSoon:
        return 'Expiring soon';
      case VehicleStatus.expired:
        return 'Expired';
      case VehicleStatus.active:
        return 'Active';
    }
  }

  Color _statusColor(VehicleStatus s) {
    switch (s) {
      case VehicleStatus.pending:
      case VehicleStatus.expiringSoon:
        return AppColors.warningAmber;
      case VehicleStatus.expired:
        return AppColors.accentRed;
      case VehicleStatus.active:
        return AppColors.success;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          color: AppColors.background,
          child: MockData.vehicles.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('ยังไม่มีรถที่ลงทะเบียน'),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  children: [
                    const SizedBox(height: 4),
                    ...MockData.vehicles.map((v) => Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.divider.withValues(alpha: 0.35),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 50,
                                    height: 50,
                                    decoration: BoxDecoration(
                                      color: AppColors.cardGrey,
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Icon(
                                      v.type == 'Motorcycle'
                                          ? Icons.two_wheeler_rounded
                                          : Icons.directions_car_filled_rounded,
                                      color: AppColors.primary,
                                      size: 26,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          v.plateNumber,
                                          style: const TextStyle(
                                            color: AppColors.primary,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'ID: ${v.vehicleCode}',
                                          style: const TextStyle(
                                            color: AppColors.textSecondary,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _statusColor(v.status),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      _statusLabel(v.status),
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () => onLocationTap(v),
                                      icon: const Icon(Icons.location_on_outlined, size: 18),
                                      label: const Text('Location'),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) => VehicleDetailsScreen(vehicle: v),
                                          ),
                                        );
                                      },
                                      child: const Text('More'),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
        ),
        Positioned(
          right: 20,
          bottom: 20,
          child: FloatingActionButton.extended(
            onPressed: () {},
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            icon: const Icon(Icons.add),
            label: const Text('Add Vehicle'),
          ),
        ),
      ],
    );
  }
}
