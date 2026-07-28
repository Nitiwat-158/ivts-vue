import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/locale_provider.dart';
import '../services/auth_service.dart';
import 'request_history_screen.dart';
import 'sign_in_screen.dart';

class ProfileScreen extends StatefulWidget {
  final VoidCallback onBack;

  const ProfileScreen({super.key, required this.onBack});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  File? _avatarImage;
  final ImagePicker _picker = ImagePicker();

  // TODO: mock ไว้ก่อน — เปลี่ยนเป็นค่าจริงจาก session/API ตอนต่อ backend
  final String _fullEmail = 'Boonmee.s@gmail.com';
  final String _fullPhone = '+66812345999';

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(
            context.watch<LocaleProvider>().t('confirm_logout_title'),
            style: const TextStyle(color: AppColors.primary),
          ),
          content: Text(
            context.watch<LocaleProvider>().t('confirm_logout_message'),
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 16),
          ),
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
                    child: Text(
                      context.watch<LocaleProvider>().t('cancel').toUpperCase(),
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
                    onPressed: () async {
                      Navigator.pop(ctx);
                      await AuthService().signOut();
                      if (!mounted) return;
                      Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
                        MaterialPageRoute(builder: (_) => const SignInScreen()),
                        (route) => false,
                      );
                    },
                    child: Text(
                      context.watch<LocaleProvider>().t('confirm').toUpperCase(),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Future<void> _pickAvatar(ImageSource source) async {
    final picked = await _picker.pickImage(source: source, imageQuality: 80);
    if (picked != null) {
      setState(() => _avatarImage = File(picked.path));
    }
  }

  void _showAvatarOptions() {
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
                title: Text(context.watch<LocaleProvider>().t('take_photo')),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickAvatar(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library, color: AppColors.primary),
                title: Text(context.watch<LocaleProvider>().t('choose_from_gallery_short')),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickAvatar(ImageSource.gallery);
                },
              ),
              if (_avatarImage != null)
                ListTile(
                  leading: const Icon(Icons.delete_outline, color: Colors.red),
                  title: Text(context.watch<LocaleProvider>().t('delete_profile_picture'), style: TextStyle(color: Colors.red)),
                  onTap: () {
                    Navigator.pop(ctx);
                    setState(() => _avatarImage = null);
                  },
                ),
            ],
          ),
        );
      },
    );
  }

  void _showChangePasswordDialog() {
    final formKey = GlobalKey<FormState>();
    final oldPasswordCtrl = TextEditingController();
    final newPasswordCtrl = TextEditingController();
    final confirmPasswordCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(context.watch<LocaleProvider>().t('change_password'), style: TextStyle(color: AppColors.primary)),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: oldPasswordCtrl,
                  obscureText: true,
                  decoration: InputDecoration(labelText: context.watch<LocaleProvider>().t('current_password')),
                  validator: (v) =>
                      (v == null || v.isEmpty) ? context.read<LocaleProvider>().t('error_enter_current_password') : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: newPasswordCtrl,
                  obscureText: true,
                  decoration: InputDecoration(labelText: context.watch<LocaleProvider>().t('new_password')),
                  validator: (v) =>
                      (v == null || v.length < 8) ? context.read<LocaleProvider>().t('error_password_length') : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: confirmPasswordCtrl,
                  obscureText: true,
                  decoration: InputDecoration(labelText: context.watch<LocaleProvider>().t('confirm_new_password')),
                  validator: (v) =>
                      (v != newPasswordCtrl.text) ? context.read<LocaleProvider>().t('error_password_mismatch') : null,
                ),
              ],
            ),
          ),
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
                    child: Text(
                      context.watch<LocaleProvider>().t('cancel').toUpperCase(),
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
                    onPressed: () {
                      if (formKey.currentState!.validate()) {
                        // TODO: ต่อ API เปลี่ยนรหัสผ่านจริงตอนเชื่อม backend
                        // (MongoDB collection: user -> field passwordHash)
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(context.watch<LocaleProvider>().t('password_changed_success'))),
                        );
                      }
                    },
                    child: Text(
                      context.watch<LocaleProvider>().t('confirm').toUpperCase(),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  void _showDetailDialog(String title, String value) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(title, style: const TextStyle(color: AppColors.primary)),
        content: Text(value, style: const TextStyle(color: AppColors.textSecondary, fontSize: 16)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(context.watch<LocaleProvider>().t('close')),
          ),
        ],
      ),
    );
  }

  Widget _menuTile(BuildContext context, String label, {VoidCallback? onTap}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: ListTile(
        title: Text(label, style: const TextStyle(color: AppColors.primary)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.primary),
        onTap: onTap,
      ),
    );
  }

  Widget _languageTile(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          const Icon(Icons.language, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(localeProvider.t('language'), style: const TextStyle(color: AppColors.primary)),
          ),
          SegmentedButton<AppLanguage>(
            segments: [
              ButtonSegment<AppLanguage>(
                value: AppLanguage.thai,
                label: Text(context.watch<LocaleProvider>().t('thai')),
              ),
              ButtonSegment<AppLanguage>(
                value: AppLanguage.english,
                label: Text(context.watch<LocaleProvider>().t('english')),
              ),
            ],
            selected: {localeProvider.currentLanguage},
            onSelectionChanged: (Set<AppLanguage> newSelection) {
              context.read<LocaleProvider>().setLanguage(newSelection.first);
            },
            style: SegmentedButton.styleFrom(
              visualDensity: VisualDensity.compact,
              selectedForegroundColor: Colors.white,
              selectedBackgroundColor: AppColors.primary,
            ),
            showSelectedIcon: false,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      child: ListView(
        children: [
          Row(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.cardGrey,
                    backgroundImage: _avatarImage != null ? FileImage(_avatarImage!) : null,
                    child: _avatarImage == null
                        ? const Icon(Icons.person, size: 30, color: AppColors.primary)
                        : null,
                  ),
                  Positioned(
                    right: -2,
                    bottom: -2,
                    child: GestureDetector(
                      onTap: _showAvatarOptions,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt, size: 14, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Sodsroi Mala',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary)),
                  SizedBox(height: 2),
                  Text('6631501148', style: TextStyle(color: AppColors.textSecondary)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: AppColors.divider.withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(context.watch<LocaleProvider>().t('user_information'),
                      style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                ),
                const SizedBox(height: 10),
                _InfoRow(
                  icon: Icons.mail_outline,
                  label: 'Email address',
                  value: 'B*****@gmail.com',
                  onTap: () => _showDetailDialog('Email address', _fullEmail),
                ),
                const Divider(height: 24),
                _InfoRow(
                  icon: Icons.phone_iphone,
                  label: 'Phone number',
                  value: '+66*****999',
                  onTap: () => _showDetailDialog('Phone number', _fullPhone),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _menuTile(
            context,
            localeProvider.t('request_history'),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const RequestHistoryScreen()),
            ),
          ),
          _menuTile(context, localeProvider.t('change_password'), onTap: _showChangePasswordDialog),
          _languageTile(context),
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: _showLogoutDialog,
            child: Text(localeProvider.t('logout')),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onTap;

  const _InfoRow({required this.icon, required this.label, required this.value, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Row(
        children: [
          Icon(icon, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.primary)),
                    const SizedBox(width: 6),
                    const Icon(Icons.check_circle, size: 14, color: AppColors.success),
                  ],
                ),
                Text(value, style: const TextStyle(color: AppColors.textSecondary)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.primary),
        ],
      ),
    );
  }
}