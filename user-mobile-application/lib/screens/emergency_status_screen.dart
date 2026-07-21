import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../theme/app_theme.dart';

class EmergencyStatusScreen extends StatelessWidget {
  const EmergencyStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final steps = [
      const _StatusStep(label: 'ส่งคำร้องเรียบร้อย', timestamp: '4:41 PM', completed: true),
      const _StatusStep(label: 'เจ้าหน้าที่รับคำร้องแล้ว', timestamp: '4:43 PM', completed: true),
      const _StatusStep(label: 'กำลังติดต่อกลับ', timestamp: '', completed: false),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text('Emergency Request'),
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text(
              'Mark resolved',
              style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.warningAmber.withValues(alpha: 0.18),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.warningAmber.withValues(alpha: 0.4)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: AppColors.warningAmber, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Theft / Stolen · สน 1669',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'ID: CR0001',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            for (int i = 0; i < steps.length; i++)
              _TimelineTile(step: steps[i], isLast: i == steps.length - 1),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.accentRed,
                side: const BorderSide(color: AppColors.accentRed),
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
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

class _StatusStep {
  final String label;
  final String timestamp;
  final bool completed;

  const _StatusStep({
    required this.label,
    required this.timestamp,
    required this.completed,
  });
}

class _TimelineTile extends StatelessWidget {
  final _StatusStep step;
  final bool isLast;

  const _TimelineTile({required this.step, required this.isLast});

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Icon(
                step.completed ? Icons.check_circle : Icons.panorama_fish_eye_rounded,
                color: step.completed ? AppColors.success : AppColors.textSecondary,
                size: 22,
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
                    step.label,
                    style: TextStyle(
                      fontWeight: step.completed ? FontWeight.bold : FontWeight.normal,
                      color: step.completed ? AppColors.textPrimary : AppColors.textSecondary,
                    ),
                  ),
                  if (step.timestamp.isNotEmpty)
                    Text(
                      step.timestamp,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
