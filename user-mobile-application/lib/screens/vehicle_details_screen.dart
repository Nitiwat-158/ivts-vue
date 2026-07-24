import 'package:flutter/material.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';
import 'renewal_request_screen.dart';

class VehicleDetailsScreen extends StatelessWidget {
  final Vehicle vehicle;

  const VehicleDetailsScreen({super.key, required this.vehicle});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text('Details'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Info Card ──────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardGrey,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.directions_car_filled_rounded,
                          color: AppColors.textPrimary,
                          size: 26,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              vehicle.plateNumber,
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              'ID: ${vehicle.vehicleCode}',
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _InfoRow(label: 'Brand', value: vehicle.brand),
                  _InfoRow(label: 'Model', value: vehicle.model),
                  _InfoRow(label: 'Color', value: vehicle.color),
                  const SizedBox(height: 8),
                  _InfoRow(label: 'Date of Issue', value: vehicle.issueDate),
                  _InfoRow(label: 'Date of Expiry', value: vehicle.expiryDate),
                  if (vehicle.daysUntilExpiry > 0) ...[
                    const SizedBox(height: 8),
                    Text(
                      'เหลืออีก ${vehicle.daysUntilExpiry} วันก่อนหมดอายุ',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── Vehicle Registration Certificate ───────────────────────
            _DocumentRow(
              label: 'Vehicle Registration Certificate',
              onViewTap: () {
                _showMockImageDialog(
                  context,
                  'Vehicle Registration Certificate',
                  Colors.blue,
                  Icons.description_outlined,
                );
              },
            ),
            const SizedBox(height: 12),

            // ── Vehicle License Plate ──────────────────────────────────
            _DocumentRow(
              label: 'The vehicle license plate',
              onViewTap: () {
                _showMockImageDialog(
                  context,
                  'Vehicle License Plate',
                  Colors.green,
                  Icons.directions_car_filled_outlined,
                );
              },
            ),
            const SizedBox(height: 12),

            // ── Renewal Request ────────────────────────────────────────
            _RenewalButton(onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => RenewalRequestScreen(vehicle: vehicle),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

// ── Reusable sub-widgets ───────────────────────────────────────────────────────

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
          ),
          Text(
            ': $value',
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _DocumentRow extends StatelessWidget {
  final String label;
  final VoidCallback onViewTap;

  const _DocumentRow({required this.label, required this.onViewTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ),
          GestureDetector(
            onTap: onViewTap,
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'View',
                style: TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RenewalButton extends StatelessWidget {
  final VoidCallback onTap;

  const _RenewalButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: AppColors.warningAmber,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Row(
          children: [
            SizedBox(width: 16),
            Expanded(
              child: Text(
                'Renewal Request',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Colors.white),
            SizedBox(width: 16),
          ],
        ),
      ),
    );
  }
}

void _showMockImageDialog(BuildContext context, String title, Color color, IconData icon) {
  showDialog(
    context: context,
    builder: (ctx) => Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: double.infinity,
            height: 300,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color, width: 2),
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 80, color: color),
                  const SizedBox(height: 16),
                  Text(
                    'Mock Document:\n$title',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: color,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          IconButton(
            icon: const Icon(Icons.cancel, color: Colors.white, size: 40),
            onPressed: () => Navigator.of(ctx).pop(),
          ),
        ],
      ),
    ),
  );
}
