import 'package:flutter/material.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';

class VehicleDetailsScreen extends StatelessWidget {
  final Vehicle vehicle;

  const VehicleDetailsScreen({super.key, required this.vehicle});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(vehicle.plateNumber)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Vehicle Details', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            _infoRow('Plate', vehicle.plateNumber),
            _infoRow('Vehicle ID', vehicle.vehicleCode),
            _infoRow('Brand', vehicle.brand),
            _infoRow('Model', vehicle.model),
            _infoRow('Color', vehicle.color),
            _infoRow('Owner', vehicle.ownerName),
            _infoRow('Expiry', vehicle.expiryDate),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(width: 90, child: Text(label, style: const TextStyle(color: AppColors.textSecondary))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}
