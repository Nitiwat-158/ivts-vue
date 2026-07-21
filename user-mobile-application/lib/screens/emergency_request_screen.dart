import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../data/mock_data.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';
import 'emergency_status_screen.dart';

class EmergencyRequestScreen extends StatefulWidget {
  final Vehicle vehicle;

  const EmergencyRequestScreen({super.key, required this.vehicle});

  @override
  State<EmergencyRequestScreen> createState() => _EmergencyRequestScreenState();
}

class _EmergencyRequestScreenState extends State<EmergencyRequestScreen> {
  String _selected = 'Theft / Stolen';
  final _options = const ['Theft / Stolen', 'Accident', 'Vehicle Breakdown', 'Other'];

  void _confirmAndSubmit() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Are you sure to submit your request?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const EmergencyStatusScreen()),
              );
            },
            child: const Text('SUBMIT'),
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
        title: const Text('Emergency Request'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _CallButton(),
            const SizedBox(height: 14),
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.cardGrey,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.directions_car_filled_rounded, color: AppColors.primary),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.vehicle.plateNumber, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                          Text('ID: ${widget.vehicle.vehicleCode}'),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text('Date: April 11th, 2026'),
                  const Text('Time: 4:41 PM'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text('Request for', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
            ..._options.map((option) => RadioListTile<String>(
                  value: option,
                  groupValue: _selected,
                  title: Text(option),
                  activeColor: AppColors.primary,
                  contentPadding: EdgeInsets.zero,
                  onChanged: (value) => setState(() => _selected = value!),
                )),
            const SizedBox(height: 8),
            const Text('Description', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
            const SizedBox(height: 6),
            const TextField(
              maxLines: 4,
              decoration: InputDecoration(hintText: 'type here...'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _confirmAndSubmit,
              child: const Text('SUBMIT'),
            ),
          ],
        ),
      ),
    );
  }
}

class _CallButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.accentRed,
        side: const BorderSide(color: AppColors.accentRed),
        minimumSize: const Size.fromHeight(48),
      ),
      onPressed: () {
        HapticFeedback.mediumImpact();
      },
      icon: const Icon(Icons.call),
      label: const Text('โทรแจ้งเจ้าหน้าที่ทันที (${MockData.securityPhoneNumber})'),
    );
  }
}
