import '../providers/locale_provider.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';
import 'renewal_request_screen.dart';
import '../services/mobile_api_service.dart';

class VehicleDetailsScreen extends StatelessWidget {
  final Vehicle vehicle;

  const VehicleDetailsScreen({super.key, required this.vehicle});

  @override
  Widget build(BuildContext context) {
    final loc = context.watch<LocaleProvider>();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Text(loc.t('details')),
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
                  _InfoRow(label: loc.t('brand'), value: vehicle.brand),
                  _InfoRow(label: loc.t('model'), value: vehicle.model),
                  _InfoRow(label: loc.t('color'), value: vehicle.color),
                  const SizedBox(height: 8),
                  _InfoRow(label: loc.t('date_of_issue'), value: vehicle.issueDate),
                  _InfoRow(label: loc.t('date_of_expiry'), value: vehicle.expiryDate),
                  if (vehicle.daysUntilExpiry > 0) ...[
                    const SizedBox(height: 8),
                    Text(
                      loc.t('expires_in_days').replaceAll('{days}', vehicle.daysUntilExpiry.toString()),
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
              label: loc.t('vehicle_registration_certificate'),
              onViewTap: () {
                _showMockImageDialog(
                  context,
                  loc.t('vehicle_registration_certificate'),
                  Colors.blue,
                  Icons.description_outlined,
                );
              },
            ),
            const SizedBox(height: 12),

            // ── Vehicle License Plate ──────────────────────────────────
            _DocumentRow(
              label: loc.t('photo_license_plate'),
              onViewTap: () {
                _showMockImageDialog(
                  context,
                  loc.t('photo_license_plate'),
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
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () async {
                final scaffold = ScaffoldMessenger.of(context);
                try {
                  scaffold.showSnackBar(const SnackBar(content: Text('Loading timeline...')));
                  final api = MobileApiService();
                  final globalId = vehicle.aiTrackGlobalId ?? int.tryParse(vehicle.vehicleCode);
                  if (globalId == null) {
                    scaffold.hideCurrentSnackBar();
                    scaffold.showSnackBar(const SnackBar(content: Text('No AI-Track ID available for this vehicle')));
                    return;
                  }
                  final data = await api.fetchAiTrackVehicleTimeline(globalId);
                  scaffold.hideCurrentSnackBar();
                  showDialog(
                    context: context,
                    builder: (ctx) => Dialog(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        width: double.infinity,
                        height: 360,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'AI-Track Timeline',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(height: 8),
                            Expanded(
                              child: data['timeline'] != null && (data['timeline'] as List).isNotEmpty
                                  ? ListView.builder(
                                      itemCount: (data['timeline'] as List).length,
                                      itemBuilder: (c, i) {
                                        final item = (data['timeline'] as List)[i] as Map<String, dynamic>;
                                        final ts = item['timestamp'] ?? item['time'] ?? '';
                                        final camera = item['camera_id'] ?? item['location_name'] ?? '';
                                        final cls = item['predicted_class'] ?? '';
                                        final lat = item['lat']?.toString() ?? '';
                                        final lng = item['lng']?.toString() ?? '';
                                        return ListTile(
                                          title: Text('$camera — $cls'),
                                          subtitle: Text('$ts\n$lat, $lng'),
                                        );
                                      },
                                    )
                                  : const Center(child: Text('No timeline data')),
                            ),
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () => Navigator.of(ctx).pop(),
                                child: const Text('Close'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                } catch (err) {
                  scaffold.showSnackBar(SnackBar(content: Text('Failed to load timeline: $err')));
                }
              },
              child: Container(
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
                        'Show Tracking Timeline',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                    const Icon(Icons.timeline, color: Colors.white),
                    const SizedBox(width: 16),
                  ],
                ),
              ),
            ),
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
    final loc = context.watch<LocaleProvider>();
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
              child: Text(
                loc.t('view'),
                style: const TextStyle(
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
    final loc = context.watch<LocaleProvider>();
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: AppColors.warningAmber,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                loc.t('renewal_request'),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white),
            const SizedBox(width: 16),
          ],
        ),
      ),
    );
  }
}

void _showMockImageDialog(BuildContext context, String title, Color color, IconData icon) {
  final loc = context.read<LocaleProvider>();
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
                    '${loc.t('mock_document')}:\n$title',
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
