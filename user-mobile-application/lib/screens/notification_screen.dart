import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/notification_item.dart';
import '../theme/app_theme.dart';

class NotificationScreen extends StatelessWidget {
  final VoidCallback? onBack;

  const NotificationScreen({super.key, this.onBack});

  IconData _iconFor(NotificationType t) {
    switch (t) {
      case NotificationType.emergency:
        return Icons.error_outline_rounded;
      case NotificationType.renewal:
        return Icons.warning_amber_rounded;
      case NotificationType.system:
        return Icons.check_circle_outline_rounded;
    }
  }

  Color _colorFor(NotificationType t) {
    switch (t) {
      case NotificationType.emergency:
        return AppColors.accentRed;
      case NotificationType.renewal:
        return AppColors.warningAmber;
      case NotificationType.system:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final grouped = <String, List<NotificationItem>>{};
    for (final n in MockData.notifications) {
      grouped.putIfAbsent(n.dateGroup, () => []).add(n);
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: onBack ?? () => Navigator.of(context).maybePop(),
        ),
        title: const Text('Notification'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            for (final group in grouped.entries) ...[
              Text(
                group.key,
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...group.value.map((n) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _colorFor(n.type).withOpacity(0.4)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(_iconFor(n.type), color: _colorFor(n.type)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(n.title, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                              const SizedBox(height: 2),
                              Text(n.description, style: const TextStyle(color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )),
              const SizedBox(height: 8),
            ],
          ],
        ),
      ),
    );
  }
}
