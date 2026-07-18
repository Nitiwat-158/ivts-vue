import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../theme/app_theme.dart';

class RequestHistoryScreen extends StatelessWidget {
  const RequestHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final grouped = <String, List<dynamic>>{};
    for (final request in MockData.requestHistory) {
      grouped.putIfAbsent(request.dateGroup, () => []).add(request);
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text('Request History'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: const [
                Expanded(child: _Chip(label: 'Today')),
                SizedBox(width: 10),
                Expanded(child: _Chip(label: 'สน 1669')),
              ],
            ),
            const SizedBox(height: 16),
            for (final group in grouped.entries) ...[
              Text(
                group.key,
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...group.value.map((request) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(request.title, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                              const SizedBox(height: 4),
                              Text('${request.vehicleCode}   ID: ${request.vehicleId}', style: const TextStyle(color: AppColors.textSecondary)),
                              const SizedBox(height: 4),
                              Text(request.date, style: const TextStyle(color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right, color: AppColors.primary),
                      ],
                    ),
                  )),
              const SizedBox(height: 12),
            ],
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;

  const _Chip({required this.label, super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: AppColors.primary)),
          const Icon(Icons.arrow_drop_down, size: 18, color: AppColors.primary),
        ],
      ),
    );
  }
}
