import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
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

  // Map label ที่โชว์บน UI ไปเป็นค่าที่ backend เก็บจริง (ตรงกับ collection emergency_reports)
  static const Map<String, String> _requestTypeValues = {
    'Theft / Stolen': 'theft',
    'Accident': 'accident',
    'Vehicle Breakdown': 'breakdown',
    'Other': 'other',
  };

  final _descriptionController = TextEditingController();
  final _picker = ImagePicker();

  final List<File> _attachedImages = [];

  // จับเวลาไว้ตอนกดยืนยัน SUBMIT จริง (ไม่ใช่ตอนเปิดหน้า) เพื่อให้ตรงกับเวลาที่ user กดส่งจริง
  DateTime? _submittedAt;

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  String _ordinalSuffix(int day) {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  String _formatDate(DateTime d) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return '${months[d.month - 1]} ${d.day}${_ordinalSuffix(d.day)}, ${d.year}';
  }

  String _formatTime(DateTime t) {
    final hour = t.hour % 12 == 0 ? 12 : t.hour % 12;
    final minute = t.minute.toString().padLeft(2, '0');
    final period = t.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  Future<void> _pickImage(ImageSource source) async {
    final picked = await _picker.pickImage(source: source, imageQuality: 80);
    if (picked != null) {
      setState(() => _attachedImages.add(File(picked.path)));
    }
  }

  void _showAttachOptions() {
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
                title: const Text('ถ่ายรูป'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library, color: AppColors.primary),
                title: const Text('เลือกจากคลังภาพ'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _confirmAndSubmit() {
    showDialog(
      context: context,
      builder: (context) {
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
                const Text(
                  'Are you sure to\nsubmit your request ?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
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
                          backgroundColor: const Color(0xFFCE8B8A),
                          foregroundColor: AppColors.primary,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text(
                          'CANCLE',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
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
                        onPressed: () {
                          final now = DateTime.now();
                          setState(() => _submittedAt = now);

                          // TODO: ต่อ API จริงตอนเชื่อม backend (MongoDB collection เดียวกับ admin)
                          // - _id: ไม่ส่ง ให้ backend generate เอง
                          // - incident_time: ใช้ค่าเดียวกับ submitted_at ตามที่ตกลงไว้ (auto)
                          // - status: ตั้งต้นเป็น OPEN เสมอตอน user ส่งใหม่ (CLOSED คือสถานะที่ admin ปิดเคสแล้วเท่านั้น)
                          // - assigned_admin_id: null เสมอฝั่ง user ให้ backend/admin เป็นคน assign
                          // - media_urls: ตอนนี้เป็นแค่ local file path (mock) ของจริงต้อง upload
                          //   ไฟล์ขึ้น server/object storage ก่อน แล้วค่อยเก็บ URL ที่ได้กลับมาลง field นี้
                          // - location: ยังไม่มี GPS capture ในสโคปนี้ ปล่อย null ไว้ก่อน
                          final reportPayload = {
                            'vehicle_id': widget.vehicle.vehicleCode,
                            'request_type': _requestTypeValues[_selected] ?? 'other',
                            'incident_time': now.toIso8601String(),
                            'submitted_at': now.toIso8601String(),
                            'description': _descriptionController.text,
                            'location': null,
                            'media_urls': _attachedImages.map((f) => f.path).toList(),
                            'status': 'OPEN',
                            'assigned_admin_id': null,
                          };
                          debugPrint('Emergency report (mock): $reportPayload');

                          Navigator.of(context).pop();
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const EmergencyStatusScreen()),
                          );
                        },
                        child: const Text(
                          'SUBMIT',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
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
    final displayTime = _submittedAt ?? DateTime.now();

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
                  Text('Date: ${_formatDate(displayTime)}'),
                  Text('Time: ${_formatTime(displayTime)}'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text('Request for', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
            RadioGroup<String>(
              groupValue: _selected,
              onChanged: (value) => setState(() => _selected = value!),
              child: Column(
                children: _options.map((option) => RadioListTile<String>(
                  value: option,
                  title: Text(option),
                  activeColor: AppColors.primary,
                  contentPadding: EdgeInsets.zero,
                )).toList(),
              ),
            ),
            const SizedBox(height: 12),

            // ช่องแนบรูป — เพิ่มใหม่ระหว่าง Request for กับ Description
            const Text('แนบรูปภาพ', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
            const SizedBox(height: 8),
            SizedBox(
              height: 84,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  ..._attachedImages.asMap().entries.map((entry) {
                    final index = entry.key;
                    final file = entry.value;
                    return Padding(
                      padding: const EdgeInsets.only(right: 10),
                      child: Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.file(file, width: 84, height: 84, fit: BoxFit.cover),
                          ),
                          Positioned(
                            top: 2,
                            right: 2,
                            child: GestureDetector(
                              onTap: () => setState(() => _attachedImages.removeAt(index)),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(
                                  color: Colors.black54,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.close, size: 14, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                  GestureDetector(
                    onTap: _showAttachOptions,
                    child: Container(
                      width: 84,
                      height: 84,
                      decoration: BoxDecoration(
                        color: AppColors.cardGrey,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.divider),
                      ),
                      child: const Icon(Icons.add_a_photo_outlined, color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            const Text('Description', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
            const SizedBox(height: 6),
            TextField(
              controller: _descriptionController,
              maxLines: 4,
              decoration: const InputDecoration(hintText: 'type here...'),
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