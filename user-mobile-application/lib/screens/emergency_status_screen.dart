import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/emergency_status.dart';
import '../theme/app_theme.dart';

class EmergencyStatusScreen extends StatelessWidget {
  const EmergencyStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final steps = MockData.emergencyTimeline;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text('Emergency Request'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(16),
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
              child: const Row(
                children: [
                  Icon(Icons.directions_car_filled_rounded, color: AppColors.primary),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text('สน 1669   ID: CR0001\nApril 11th, 2026  4:41 PM'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            for (int i = 0; i < steps.length; i++)
              _TimelineTile(update: steps[i], isLast: i == steps.length - 1),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.accentRed,
                side: const BorderSide(color: AppColors.accentRed),
                minimumSize: const Size.fromHeight(48),
              ),
              onPressed: () {},
              icon: const Icon(Icons.call),
              label: const Text('โทรหาเจ้าหน้าที่ (${MockData.securityPhoneNumber})'),
            ),
          ],
        ),
      ),
    );
  }
}

class _TimelineTile extends StatelessWidget {
  final EmergencyStatusUpdate update;
  final bool isLast;

  const _TimelineTile({required this.update, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final color = update.completed ? AppColors.success : AppColors.textSecondary;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Icon(
                update.completed ? Icons.check_circle : Icons.radio_button_unchecked,
                color: color,
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 2, color: AppColors.divider),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    update.label,
                    style: TextStyle(
                      fontWeight: update.completed ? FontWeight.bold : FontWeight.normal,
                      color: update.completed ? AppColors.textPrimary : AppColors.textSecondary,
                    ),
                  ),
                  if (update.timestamp.isNotEmpty)
                    Text(update.timestamp, style: const TextStyle(color: AppColors.textSecondary)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
