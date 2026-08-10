import '../providers/locale_provider.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/vehicle.dart';
import '../services/auth_service.dart';
import '../services/app_data_repository.dart';
import '../services/mobile_api_service.dart';
import '../theme/app_theme.dart';

class AddVehicleScreen extends StatefulWidget {
  final Vehicle? vehicle;
  final bool isReadOnly;

  const AddVehicleScreen({
    super.key,
    this.vehicle,
    this.isReadOnly = false,
  });

  @override
  State<AddVehicleScreen> createState() => _AddVehicleScreenState();
}

class _AddVehicleScreenState extends State<AddVehicleScreen> {
  String? _selectedType;
  final List<String> _vehicleTypeKeys = ['car', 'motorcycle'];
  final MobileApiService _api = MobileApiService();

  File? _registrationFile;
  File? _licensePlateFile;
  final ImagePicker _picker = ImagePicker();
  bool _submitting = false;

  Future<void> _pickImage(bool isRegistration, ImageSource source) async {
    try {
      final picked = await _picker.pickImage(source: source);
      if (picked != null) {
        setState(() {
          if (isRegistration) {
            _registrationFile = File(picked.path);
          } else {
            _licensePlateFile = File(picked.path);
          }
        });
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  void _showAttachOptions(bool isRegistration) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo_camera, color: AppColors.primary),
                title: Text(context.watch<LocaleProvider>().t('take_photo_camera')),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(isRegistration, ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library, color: AppColors.primary),
                title: Text(context.watch<LocaleProvider>().t('choose_from_gallery')),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(isRegistration, ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  final _licensePlateController = TextEditingController();
  final _provinceController = TextEditingController();
  final _brandController = TextEditingController();
  final _modelController = TextEditingController();
  final _colorController = TextEditingController();
  final _nameController = TextEditingController();
  final _surnameController = TextEditingController();
  final _citizenIdController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.vehicle != null) {
      final v = widget.vehicle!;
      _selectedType = v.type.toLowerCase() == 'motorcycle' ? 'motorcycle' : 'car';
      _licensePlateController.text = v.plateNumber;
      _provinceController.text = (v.province != null && v.province!.isNotEmpty && v.province != '-') ? v.province! : '-';
      _brandController.text = v.brand;
      _modelController.text = v.model;
      _colorController.text = v.color;
      if (v.ownerName.contains(' ')) {
        final parts = v.ownerName.split(' ');
        _nameController.text = parts.first;
        _surnameController.text = parts.sublist(1).join(' ');
      } else {
        _nameController.text = v.ownerName;
        _surnameController.text = '';
      }
      _citizenIdController.text = '-';

      if (widget.isReadOnly && v.id.isNotEmpty && (v.id.startsWith('REQ') || v.id.contains('req'))) {
        _loadRequestDetails(v.id);
      }
    }
  }

  Future<void> _loadRequestDetails(String requestId) async {
    try {
      final data = await _api.fetchRequestById(requestId);
      if (!mounted) return;
      final vehicleInfo = data['vehicleInfo'] as Map<String, dynamic>? ?? {};
      final ownerInfo = data['ownerInfo'] as Map<String, dynamic>? ?? {};
      setState(() {
        final prv = vehicleInfo['province'] as String? ?? vehicleInfo['provinceLicense'] as String? ?? '';
        if (prv.isNotEmpty) _provinceController.text = prv;

        final lic = vehicleInfo['licensePlate'] as String? ?? '';
        if (lic.isNotEmpty) _licensePlateController.text = lic;

        final brd = vehicleInfo['brand'] as String? ?? '';
        if (brd.isNotEmpty) _brandController.text = brd;

        final mdl = vehicleInfo['model'] as String? ?? '';
        if (mdl.isNotEmpty) _modelController.text = mdl;

        final clr = vehicleInfo['color'] as String? ?? '';
        if (clr.isNotEmpty) _colorController.text = clr;

        final typ = vehicleInfo['type'] as String? ?? '';
        if (typ.isNotEmpty) {
          _selectedType = typ.toLowerCase() == 'motorcycle' ? 'motorcycle' : 'car';
        }

        final nm = ownerInfo['name'] as String? ?? '';
        if (nm.isNotEmpty) _nameController.text = nm;

        final snm = ownerInfo['surname'] as String? ?? '';
        if (snm.isNotEmpty) _surnameController.text = snm;

        final cid = ownerInfo['citizenId'] as String? ?? '';
        if (cid.isNotEmpty) _citizenIdController.text = cid;
      });
    } catch (e) {
      debugPrint('Error loading request detail for $requestId: $e');
    }
  }

  @override
  void dispose() {
    _api.close();
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

  String _mapVehicleType(String? key) {
    switch (key) {
      case 'motorcycle':
        return 'motorcycle';
      case 'car':
      default:
        return 'car';
    }
  }

  Future<void> _submitRequest() async {
    if (_submitting) return;

    final loc = context.read<LocaleProvider>();
    final selectedType = _selectedType;
    final licensePlate = _licensePlateController.text.trim();
    final province = _provinceController.text.trim();
    final brand = _brandController.text.trim();
    final model = _modelController.text.trim();
    final color = _colorController.text.trim();
    final ownerName = _nameController.text.trim();
    final ownerSurname = _surnameController.text.trim();
    final citizenId = _citizenIdController.text.trim();

    if (selectedType == null || licensePlate.isEmpty || province.isEmpty || brand.isEmpty || model.isEmpty || color.isEmpty || ownerName.isEmpty || ownerSurname.isEmpty || citizenId.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(loc.t('fill_required_fields'))),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final currentUser = await AuthService().getCurrentUser();
      if (currentUser == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('กรุณาเข้าสู่ระบบก่อนยื่นคำร้อง')),
        );
        return;
      }
      final userId = currentUser.effectiveUserId;

      await _api.createRequest({
        'user_id': userId,
        'users_id': userId,
        'request_type': 'register',
        'user_type': 'student',
        'vehicle_info': {
          'license_plate': licensePlate,
          'province_license': province,
          'brand': brand,
          'model': model,
          'color': color,
          'type': _mapVehicleType(selectedType),
          'priority_order': 'first_car',
        },
        'owner_info': {
          'name': ownerName,
          'surname': ownerSurname,
          'citizen_id': citizenId,
          'is_owner_match_user': true,
        },
        'uploaded_documents': {
          'registration_book_url': _registrationFile?.path,
          'vehicle_photo_url': _licensePlateFile?.path,
        },
      });

      await AppDataRepository.instance.refresh();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.read<LocaleProvider>().t('vehicle_saved_success'))),
      );
      Navigator.of(context).maybePop();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${context.read<LocaleProvider>().t('submit_failed_prefix')}: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  void _onSubmit() {
    final loc = context.read<LocaleProvider>();
    showDialog(
      context: context,
      builder: (dialogCtx) {
        return Dialog(
          backgroundColor: const Color(0xFFDFDFDF),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  loc.t('confirm_submit_request'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFCE8B8A), // Pinkish red
                          foregroundColor: AppColors.primary,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () => Navigator.of(dialogCtx).pop(),
                        child: Text(
                          loc.t('cancel').toUpperCase(),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                        ),
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
                        onPressed: _submitting
                            ? null
                            : () async {
                                Navigator.of(dialogCtx).pop(); // close dialog
                                await _submitRequest();
                              },
                        child: Text(
                          loc.t('submit'),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final loc = context.watch<LocaleProvider>();
    final vehicleTypeLabels = _vehicleTypeKeys.map((k) => loc.t(k)).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Text(widget.isReadOnly ? loc.t('details') : loc.t('add_vehicle')),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Vehicle Section ────────────────────────────────────────
            _SectionCard(
              title: loc.t('vehicle'),
              children: [
                // Type Dropdown
                _FieldLabel(label: loc.t('type')),
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
                      items: List.generate(_vehicleTypeKeys.length, (i) {
                        return DropdownMenuItem<String>(
                          value: _vehicleTypeKeys[i],
                          child: Text(vehicleTypeLabels[i], style: const TextStyle(color: AppColors.textPrimary)),
                        );
                      }),
                      onChanged: widget.isReadOnly ? null : (value) => setState(() => _selectedType = value),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                _FieldLabel(label: loc.t('license_plate')),
                const SizedBox(height: 6),
                _InputField(controller: _licensePlateController, enabled: !widget.isReadOnly),
                const SizedBox(height: 14),

                _FieldLabel(label: loc.t('province')),
                const SizedBox(height: 6),
                _InputField(controller: _provinceController, enabled: !widget.isReadOnly),
                const SizedBox(height: 14),

                _FieldLabel(label: loc.t('brand')),
                const SizedBox(height: 6),
                _InputField(controller: _brandController, enabled: !widget.isReadOnly),
                const SizedBox(height: 14),

                _FieldLabel(label: loc.t('model')),
                const SizedBox(height: 6),
                _InputField(controller: _modelController, enabled: !widget.isReadOnly),
                const SizedBox(height: 14),

                _FieldLabel(label: loc.t('color')),
                const SizedBox(height: 6),
                _InputField(controller: _colorController, enabled: !widget.isReadOnly),
              ],
            ),
            const SizedBox(height: 16),

            // ── Owner Section ──────────────────────────────────────────
            _SectionCard(
              title: loc.t('owner'),
              children: [
                _FieldLabel(label: loc.t('name')),
                const SizedBox(height: 6),
                _InputField(controller: _nameController, enabled: !widget.isReadOnly),
                const SizedBox(height: 14),

                _FieldLabel(label: loc.t('surname')),
                const SizedBox(height: 6),
                _InputField(controller: _surnameController, enabled: !widget.isReadOnly),
                const SizedBox(height: 14),

                _FieldLabel(label: loc.t('citizen_id')),
                const SizedBox(height: 6),
                _InputField(
                  controller: _citizenIdController,
                  keyboardType: TextInputType.number,
                  enabled: !widget.isReadOnly,
                ),
                const SizedBox(height: 16),

                // Vehicle Registration Certificate
                _UploadRow(
                  label: loc.t('vehicle_registration_certificate'),
                  isAdded: _registrationFile != null || widget.isReadOnly,
                  onAddTap: widget.isReadOnly ? () {} : () => _showAttachOptions(true),
                ),
                const SizedBox(height: 10),

                // Photo of License Plate
                _UploadRow(
                  label: loc.t('photo_license_plate'),
                  isAdded: _licensePlateFile != null || widget.isReadOnly,
                  onAddTap: widget.isReadOnly ? () {} : () => _showAttachOptions(false),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // ── Submit Button ──────────────────────────────────────────
            if (!widget.isReadOnly) ...[
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                onPressed: _submitting ? null : _onSubmit,
                child: Text(_submitting ? loc.t('submitting') : loc.t('submit')),
              ),
              const SizedBox(height: 24),
            ],
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
  final bool enabled;

  const _InputField({
    required this.controller,
    this.keyboardType = TextInputType.text,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      enabled: enabled,
      keyboardType: keyboardType,
      style: TextStyle(
        color: enabled ? AppColors.textPrimary : AppColors.textPrimary.withValues(alpha: 0.8),
        fontSize: 14,
      ),
      decoration: InputDecoration(
        filled: true,
        fillColor: enabled ? Colors.white : const Color(0xFFF2F2F2),
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
  final bool isAdded;

  const _UploadRow({required this.label, required this.onAddTap, this.isAdded = false});

  @override
  Widget build(BuildContext context) {
    final loc = context.watch<LocaleProvider>();
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
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isAdded) ...[
                    const Icon(Icons.check_circle, color: AppColors.success, size: 16),
                    const SizedBox(width: 4),
                  ],
                  Text(
                    isAdded ? loc.t('added') : loc.t('add'),
                    style: TextStyle(
                      color: isAdded ? AppColors.success : AppColors.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
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
