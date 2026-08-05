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
  AuthUser? _currentUser;
  bool _isLoadingUser = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await AuthService().getCurrentUser();
    if (mounted) {
      setState(() {
        _currentUser = user;
        _isLoadingUser = false;
      });
    }
  }

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

  void _showChangePasswordDialog() {
    final TextEditingController newPasswordController = TextEditingController();
    final TextEditingController confirmPasswordController = TextEditingController();
    bool obscureNew = true;
    bool obscureConfirm = true;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Text(
                context.watch<LocaleProvider>().t('change_password'),
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: newPasswordController,
                    obscureText: obscureNew,
                    decoration: InputDecoration(
                      labelText: context.watch<LocaleProvider>().t('new_password'),
                      suffixIcon: IconButton(
                        icon: Icon(obscureNew ? Icons.visibility_off : Icons.visibility),
                        onPressed: () => setState(() => obscureNew = !obscureNew),
                      ),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: confirmPasswordController,
                    obscureText: obscureConfirm,
                    decoration: InputDecoration(
                      labelText: context.watch<LocaleProvider>().t('confirm_new_password'),
                      suffixIcon: IconButton(
                        icon: Icon(obscureConfirm ? Icons.visibility_off : Icons.visibility),
                        onPressed: () => setState(() => obscureConfirm = !obscureConfirm),
                      ),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
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
                          // Handle confirm logic here
                          Navigator.pop(ctx);
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
      child: Material(
        color: Colors.transparent,
        child: ListTile(
          title: Text(label, style: const TextStyle(color: AppColors.primary)),
          trailing: const Icon(Icons.chevron_right, color: AppColors.primary),
          onTap: onTap,
        ),
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
                    backgroundImage: _avatarImage != null 
                        ? FileImage(_avatarImage!) as ImageProvider
                        : (_currentUser?.avatarUrl != null && _currentUser!.avatarUrl!.isNotEmpty)
                            ? NetworkImage(_currentUser!.avatarUrl!) as ImageProvider
                            : null,
                    child: (_avatarImage == null && (_currentUser?.avatarUrl == null || _currentUser!.avatarUrl!.isEmpty))
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_isLoadingUser)
                      const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    else ...[
                      Text('${_currentUser?.name ?? ''} ${_currentUser?.surname ?? ''}'.trim(),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary)),
                      const SizedBox(height: 2),
                      Text(_currentUser?.role.toUpperCase() ?? 'USER', style: const TextStyle(color: AppColors.textSecondary)),
                    ],
                  ],
                ),
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
                  label: context.watch<LocaleProvider>().t('email_address'),
                  value: _currentUser?.email ?? '-',
                  onTap: () => _showDetailDialog(context.read<LocaleProvider>().t('email_address'), _currentUser?.email ?? '-'),
                ),
                if (_currentUser?.phone != null && _currentUser!.phone!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _InfoRow(
                    icon: Icons.phone_outlined,
                    label: context.watch<LocaleProvider>().t('phone_number'),
                    value: _currentUser!.phone!,
                    onTap: () => _showDetailDialog(context.read<LocaleProvider>().t('phone_number'), _currentUser!.phone!),
                  ),
                ],
                if (_currentUser?.department != null && _currentUser!.department!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _InfoRow(
                    icon: Icons.person_outline,
                    label: context.watch<LocaleProvider>().t('user_type'),
                    value: _currentUser!.department!,
                    onTap: () => _showDetailDialog(context.read<LocaleProvider>().t('user_type'), _currentUser!.department!),
                  ),
                ],
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
          _menuTile(
            context,
            localeProvider.t('change_password'),
            onTap: _showChangePasswordDialog,
          ),

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