import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AddVehicleScreen extends StatefulWidget {
  const AddVehicleScreen({super.key});

  @override
  State<AddVehicleScreen> createState() => _AddVehicleScreenState();
}

class _AddVehicleScreenState extends State<AddVehicleScreen> {
  String? _selectedType;
  final List<String> _vehicleTypes = ['Car', 'Motorcycle'];

  final _licensePlateController = TextEditingController();
  final _provinceController = TextEditingController();
  final _brandController = TextEditingController();
  final _modelController = TextEditingController();
  final _colorController = TextEditingController();
  final _nameController = TextEditingController();
  final _surnameController = TextEditingController();
  final _citizenIdController = TextEditingController();

  @override
  void dispose() {
    _licensePlateController.dispose();
    _provinceController.dispose();
    _brandController.dispose();
    _modelController.dispose();
    _colorController.dispose();
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
        title: const Text('Add Vehicle'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Vehicle Section ────────────────────────────────────────
            _SectionCard(
              title: 'Vehicle',
              children: [
                // Type Dropdown
                _FieldLabel(label: 'Type'),
                const SizedBox(height: 6),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedType,
                      isExpanded: true,
                      hint: const SizedBox.shrink(),
                      icon: const Icon(Icons.arrow_drop_down, color: AppColors.textSecondary),
                      items: _vehicleTypes.map((type) {
                        return DropdownMenuItem<String>(
                          value: type,
                          child: Text(type, style: const TextStyle(color: AppColors.textPrimary)),
                        );
                      }).toList(),
                      onChanged: (value) => setState(() => _selectedType = value),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                _FieldLabel(label: 'License Plate'),
                const SizedBox(height: 6),
                _InputField(controller: _licensePlateController),
                const SizedBox(height: 14),

                _FieldLabel(label: 'Province'),
                const SizedBox(height: 6),
                _InputField(controller: _provinceController),
                const SizedBox(height: 14),

                _FieldLabel(label: 'Brand'),
                const SizedBox(height: 6),
                _InputField(controller: _brandController),
                const SizedBox(height: 14),

                _FieldLabel(label: 'Model'),
                const SizedBox(height: 6),
                _InputField(controller: _modelController),
                const SizedBox(height: 14),

                _FieldLabel(label: 'Color'),
                const SizedBox(height: 6),
                _InputField(controller: _colorController),
              ],
            ),
            const SizedBox(height: 16),

            // ── Owner Section ──────────────────────────────────────────
            _SectionCard(
              title: 'Owner',
              children: [
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

                // Vehicle Registration Certificate
                _UploadRow(
                  label: 'Vehicle Registration Certificate',
                  onAddTap: () {},
                ),
                const SizedBox(height: 10),

                // Photo of License Plate
                _UploadRow(
                  label: 'Photo Of The Vehicle License Plate',
                  onAddTap: () {},
                ),
              ],
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

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SectionCard({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardGrey,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 14),
          ...children,
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
