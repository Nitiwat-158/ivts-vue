import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'request_history_screen.dart';

class ProfileScreen extends StatelessWidget {
  final VoidCallback onBack;

  const ProfileScreen({super.key, required this.onBack});

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

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      child: ListView(
        children: [
          Row(
            children: [
              const CircleAvatar(
                radius: 30,
                backgroundColor: AppColors.cardGrey,
                child: Icon(Icons.person, size: 30, color: AppColors.primary),
              ),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Sodsroi Mala', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary)),
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
                  color: AppColors.divider.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text('User Information', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                ),
                const SizedBox(height: 10),
                _InfoRow(icon: Icons.mail_outline, label: 'Email address', value: 'B*****@gmail.com'),
                const Divider(height: 24),
                _InfoRow(icon: Icons.phone_iphone, label: 'Phone number', value: '+66*****999'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _menuTile(
            context,
            'Request History',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const RequestHistoryScreen()),
            ),
          ),
          _menuTile(context, 'Change Password'),
          _menuTile(context, 'Pass key'),
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: onBack,
            child: const Text('LOG OUT'),
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

  const _InfoRow({required this.icon, required this.label, required this.value, super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
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
    );
  }
}
