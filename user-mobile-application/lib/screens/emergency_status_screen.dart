import '../providers/locale_provider.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../services/app_data_repository.dart';
import '../theme/app_theme.dart';


import '../services/mobile_api_service.dart';

class EmergencyStatusScreen extends StatefulWidget {
  final String emergencyId;

  const EmergencyStatusScreen({super.key, required this.emergencyId});

  @override
  State<EmergencyStatusScreen> createState() => _EmergencyStatusScreenState();
}

class _EmergencyStatusScreenState extends State<EmergencyStatusScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _report;
  
  @override
  void initState() {
    super.initState();
    _fetchReport();
  }

  Future<void> _fetchReport() async {
    setState(() => _isLoading = true);
    try {
      final report = await MobileApiService().fetchEmergencyReportById(widget.emergencyId);
      if (mounted) setState(() => _report = report);
    } catch (e) {
      debugPrint('Error fetching report: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _confirmMarkResolved() {
    // We mock marking as resolved for now, in a real app this would call an API
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(context.watch<LocaleProvider>().t('mark_as_resolved'), style: const TextStyle(color: AppColors.primary)),
        content: Text(context.watch<LocaleProvider>().t('confirm_close_emergency')),
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
                  child: Text(context.watch<LocaleProvider>().t('cancel'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
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
                  onPressed: () async {
                    Navigator.pop(ctx);
                    final messenger = ScaffoldMessenger.of(context);
                    final loc = context.read<LocaleProvider>();
                    try {
                      await MobileApiService().updateEmergencyReportStatus(widget.emergencyId, status: 'RESOLVED');
                      AppDataRepository.instance.activeEmergencyIdNotifier.value = null;
                      AppDataRepository.instance.activeEmergencyReportNotifier.value = null;
                      await AppDataRepository.instance.refresh();
                      messenger.showSnackBar(
                        SnackBar(content: Text(loc.t('case_marked_resolved'))),
                      );
                      if (mounted) Navigator.of(context).maybePop();
                    } catch (e) {
                      messenger.showSnackBar(
                        SnackBar(content: Text('Failed to update case status: $e')),
                      );
                    }
                  },
                  child: Text(context.watch<LocaleProvider>().t('confirm'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
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
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Text(context.watch<LocaleProvider>().t('emergency_request')),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchReport,
          ),
        ],
      ),
      body: SafeArea(
        child: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _report == null
            ? const Center(child: Text('Failed to load emergency report.'))
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: (_report!['status'] == 'CLOSED' || _report!['status'] == 'RESOLVED') ? AppColors.success.withValues(alpha: 0.18) : AppColors.warningAmber.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: (_report!['status'] == 'CLOSED' || _report!['status'] == 'RESOLVED') ? AppColors.success.withValues(alpha: 0.4) : AppColors.warningAmber.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          (_report!['status'] == 'CLOSED' || _report!['status'] == 'RESOLVED') ? Icons.check_circle_rounded : Icons.warning_amber_rounded,
                          color: (_report!['status'] == 'CLOSED' || _report!['status'] == 'RESOLVED') ? AppColors.success : AppColors.warningAmber,
                          size: 28,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${_report!['request_type']}',
                                style: const TextStyle(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'ID: ${_report!['_id']}',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (_report!['timeline'] != null)
                    ...(_report!['timeline'] as List).asMap().entries.map((entry) {
                      final i = entry.key;
                      final t = entry.value;
                      return _TimelineTile(
                        step: _StatusStep(
                          label: t['label'] ?? '',
                          timestamp: t['timestamp'] ?? '',
                          completed: t['completed'] == true,
                        ),
                        isLast: i == (_report!['timeline'] as List).length - 1,
                      );
                    }),
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
                    label: Text('${context.watch<LocaleProvider>().t('call_staff')} (${MockData.securityPhoneNumber})'),
                  ),
                  if (_report!['status'] != 'CLOSED' && _report!['status'] != 'RESOLVED') ...[
                    const SizedBox(height: 16),
                    TextButton(
                      style: TextButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      ),
                      onPressed: _confirmMarkResolved,
                      child: Text(
                        context.watch<LocaleProvider>().t('mark_resolved'),
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 16),
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
