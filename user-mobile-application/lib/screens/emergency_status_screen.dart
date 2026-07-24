import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../theme/app_theme.dart';

class EmergencyStatusScreen extends StatefulWidget {
  const EmergencyStatusScreen({super.key});

  @override
  State<EmergencyStatusScreen> createState() => _EmergencyStatusScreenState();
}

class _EmergencyStatusScreenState extends State<EmergencyStatusScreen> {
  bool _isResolved = false;
  String? _resolvedTime;

  void _confirmMarkResolved() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Mark as Resolved', style: TextStyle(color: AppColors.primary)),
        content: const Text('คุณแน่ใจหรือไม่ที่จะปิดเคสฉุกเฉินนี้? (Are you sure you want to mark this as resolved?)'),
        actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        actions: [
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFCE8B8A),
                    foregroundColor: AppColors.primary,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('CANCLE', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    setState(() {
                      _isResolved = true;
                      final now = DateTime.now();
                      final hour = now.hour % 12 == 0 ? 12 : now.hour % 12;
                      final minute = now.minute.toString().padLeft(2, '0');
                      final period = now.hour >= 12 ? 'PM' : 'AM';
                      _resolvedTime = '$hour:$minute $period';
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('เคสถูกทำเครื่องหมายว่าแก้ไขแล้ว')),
                    );
                  },
                  child: const Text('CONFIRM', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final steps = [
      const _StatusStep(label: 'ส่งคำร้องเรียบร้อย', timestamp: '4:41 PM', completed: true),
      const _StatusStep(label: 'เจ้าหน้าที่รับคำร้องแล้ว', timestamp: '4:43 PM', completed: true),
      if (_isResolved) ...[
        const _StatusStep(label: 'กำลังติดต่อกลับ', timestamp: '4:45 PM', completed: true),
        _StatusStep(label: 'เคสถูกปิดแล้ว (Resolved)', timestamp: _resolvedTime ?? '', completed: true),
      ] else ...[
        const _StatusStep(label: 'กำลังติดต่อกลับ', timestamp: '', completed: false),
      ]
    ];

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
                color: _isResolved ? AppColors.success.withValues(alpha: 0.18) : AppColors.warningAmber.withValues(alpha: 0.18),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: _isResolved ? AppColors.success.withValues(alpha: 0.4) : AppColors.warningAmber.withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  Icon(
                    _isResolved ? Icons.check_circle_rounded : Icons.warning_amber_rounded,
                    color: _isResolved ? AppColors.success : AppColors.warningAmber,
                    size: 28,
                  ),
                  const SizedBox(width: 12),
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
                        const SizedBox(height: 2),
                        const Text(
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
            if (!_isResolved) ...[
              const SizedBox(height: 16),
              TextButton(
                style: TextButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
                onPressed: _confirmMarkResolved,
                child: const Text(
                  'Mark resolved',
                  style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 16),
                ),
              ),
            ],
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
