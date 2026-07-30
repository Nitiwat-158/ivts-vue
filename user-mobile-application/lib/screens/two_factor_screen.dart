import 'dart:async';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';

class TwoFactorScreen extends StatefulWidget {
  final String pendingToken;

  const TwoFactorScreen({super.key, required this.pendingToken});

  @override
  State<TwoFactorScreen> createState() => _TwoFactorScreenState();
}

class _TwoFactorScreenState extends State<TwoFactorScreen> {
  final _otpController = TextEditingController();
  final _authService = AuthService();

  bool _isLoading = false;
  bool _trustDevice = false;
  
  int _resendCooldown = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCooldown();
  }

  @override
  void dispose() {
    _otpController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startCooldown() {
    setState(() {
      _resendCooldown = 30;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCooldown > 0) {
        setState(() {
          _resendCooldown--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _verifyOtp() async {
    final code = _otpController.text.trim();
    if (code.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await _authService.verifyTwoFactor(code, widget.pendingToken, trustDevice: _trustDevice);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (e) {
      if (!mounted) return;
      String errorMsg = e.toString().replaceFirst('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg)));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resendOtp() async {
    if (_resendCooldown > 0) return;

    setState(() => _isLoading = true);
    try {
      await _authService.resendTwoFactor(widget.pendingToken);
      _startCooldown();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ส่ง OTP ใหม่อีกครั้งแล้ว')),
      );
    } catch (e) {
      if (!mounted) return;
      String errorMsg = e.toString().replaceFirst('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg)));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ยืนยันรหัส OTP')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'กรุณากรอกรหัส OTP ที่ได้รับทางอีเมล',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 24.0),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'รหัส OTP 6 หลัก',
                border: OutlineInputBorder(),
              ),
              maxLength: 6,
            ),
            const SizedBox(height: 16.0),
            Row(
              children: [
                Checkbox(
                  value: _trustDevice,
                  onChanged: (val) {
                    setState(() => _trustDevice = val ?? false);
                  },
                ),
                const Text('จดจำอุปกรณ์นี้ 30 วัน'),
              ],
            ),
            const SizedBox(height: 24.0),
            ElevatedButton(
              onPressed: _isLoading ? null : _verifyOtp,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16.0),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('ยืนยัน OTP', style: TextStyle(color: Colors.white)),
            ),
            const SizedBox(height: 16.0),
            TextButton(
              onPressed: (_isLoading || _resendCooldown > 0) ? null : _resendOtp,
              child: Text(
                _resendCooldown > 0
                    ? 'ส่ง OTP อีกครั้ง (${_resendCooldown}s)'
                    : 'ส่ง OTP อีกครั้ง',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
