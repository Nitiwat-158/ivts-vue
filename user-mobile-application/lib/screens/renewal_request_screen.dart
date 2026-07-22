import 'package:flutter/material.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';

class RenewalRequestScreen extends StatefulWidget {
  final Vehicle vehicle;

  const RenewalRequestScreen({super.key, required this.vehicle});

  @override
  State<RenewalRequestScreen> createState() => _RenewalRequestScreenState();
}

class _RenewalRequestScreenState extends State<RenewalRequestScreen> {
  final _nameController = TextEditingController();
  final _surnameController = TextEditingController();
  final _citizenIdController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _surnameController.dispose();
    _citizenIdController.dispose();
    super.dispose();
  }

  void _onSubmit() {
    // TODO: handle submit
    Navigator.of(context).maybePop();
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
        title: const Text('Renewal Request'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Vehicle Info Card ──────────────────────────────────────
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
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          widget.vehicle.type == 'Motorcycle'
                              ? Icons.two_wheeler_rounded
                              : Icons.directions_car_filled_rounded,
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
                              widget.vehicle.plateNumber,
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              'ID: ${widget.vehicle.vehicleCode}',
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
                  _InfoRow(label: 'Brand', value: widget.vehicle.brand),
                  _InfoRow(label: 'Color', value: widget.vehicle.color),
                  _InfoRow(label: 'Model', value: widget.vehicle.model),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Owner Section ──────────────────────────────────────────
            const Text(
              'Owner',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 12),

            _FieldLabel(label: 'Name'),
            const SizedBox(height: 6),
            _InputField(controller: _nameController),
            const SizedBox(height: 14),

            _FieldLabel(label: 'Surname'),
            const SizedBox(height: 6),
            _InputField(controller: _surnameController),
            const SizedBox(height: 14),

            _FieldLabel(label: 'Citizen ID'),
            const SizedBox(height: 6),
            _InputField(
              controller: _citizenIdController,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            // Upload Photo Row
            _UploadRow(
              label: 'The vehicle license plate',
              onAddTap: () {},
            ),
            const SizedBox(height: 24),

            // ── Submit Button ──────────────────────────────────────────
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
              onPressed: _onSubmit,
              child: const Text('SUBMIT'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// ── Reusable sub-widgets ─────────────────────────────────────────────────────

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
            width: 50,
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

class _FieldLabel extends StatelessWidget {
  final String label;

  const _FieldLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
    );
  }
}

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final TextInputType keyboardType;

  const _InputField({
    required this.controller,
    this.keyboardType = TextInputType.text,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.white,
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}

class _UploadRow extends StatelessWidget {
  final String label;
  final VoidCallback onAddTap;

  const _UploadRow({required this.label, required this.onAddTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
          GestureDetector(
            onTap: onAddTap,
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Add',
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
