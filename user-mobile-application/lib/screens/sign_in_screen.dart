import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';
import '../services/app_data_repository.dart';
import 'register_screen.dart';
import 'two_factor_screen.dart';

import '../widgets/google_sign_in_button/google_sign_in_button.dart';
import 'dart:async';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  late final GoogleSignIn _googleSignIn;
  StreamSubscription<GoogleSignInAccount?>? _currentUserSubscription;

  @override
  void initState() {
    super.initState();
    _googleSignIn = GoogleSignIn(
      scopes: ['email', 'profile', 'openid'],
      clientId: '298470872970-am1echombj03p2n223p9gavitmo811kq.apps.googleusercontent.com',
    );

    _currentUserSubscription = _googleSignIn.onCurrentUserChanged.listen((GoogleSignInAccount? account) async {
      if (account != null) {
        await _handleGoogleSignInResult(account);
      }
    });
  }

  @override
  void dispose() {
    _currentUserSubscription?.cancel();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _triggerMobileGoogleSignIn() async {
    setState(() {
      _isLoading = true;
    });
    try {
      await _googleSignIn.signIn();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  Future<void> _handleGoogleSignInResult(GoogleSignInAccount account) async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    try {
      final GoogleSignInAuthentication auth = await account.authentication;
      final String? idToken = auth.idToken;

      if (idToken == null) {
        throw Exception('ไม่สามารถดึงข้อมูลยืนยันตัวตนจาก Google ได้ (idToken is null)');
      }

      final result = await AuthService().signInWithGoogle(idToken);
      if (!mounted) return;

      if (result.requires2FA && result.pendingToken != null) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => TwoFactorScreen(pendingToken: result.pendingToken!),
          ),
        );
      } else if (!result.requires2FA && result.user != null) {
        await AppDataRepository.instance.refresh();
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => ValueListenableBuilder<int>(
              valueListenable: AppDataRepository.instance.refreshTick,
              builder: (context, _, __) => const HomeScreen(),
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
  Future<void> _signIn() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      final result = await AuthService().signIn(
        _usernameController.text.trim(),
        _passwordController.text,
      );
      if (!mounted) return;

      if (result.requires2FA && result.pendingToken != null) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => TwoFactorScreen(pendingToken: result.pendingToken!),
          ),
        );
      } else if (!result.requires2FA && result.user != null) {
        await AppDataRepository.instance.refresh();
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => ValueListenableBuilder<int>(
              valueListenable: AppDataRepository.instance.refreshTick,
              builder: (context, _, __) => const HomeScreen(),
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
              // Logo
              Container(
                width: 120,
                height: 120,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.directions_car,
                  size: 60,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'ระบบจัดการยานพาหนะอัจฉริยะ',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 48),
              Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_isLoading)
                      const Center(
                        child: CircularProgressIndicator(color: AppColors.primary),
                      )
                    else ...[
                      TextFormField(
                        controller: _usernameController,
                        decoration: const InputDecoration(
                          labelText: 'ชื่อผู้ใช้งาน (อีเมล)',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.person),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'กรุณากรอกชื่อผู้ใช้งาน';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        decoration: InputDecoration(
                          labelText: 'รหัสผ่าน',
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                        ),
                        obscureText: _obscurePassword,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'กรุณากรอกรหัสผ่าน';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _signIn,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          'เข้าสู่ระบบ',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Row(
                        children: [
                          Expanded(child: Divider()),
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16),
                            child: Text('หรือ'),
                          ),
                          Expanded(child: Divider()),
                        ],
                      ),
                      const SizedBox(height: 16),
                      buildGoogleSignInButton(
                        onPressed: _triggerMobileGoogleSignIn,
                      ),
                    ],

                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (!_isLoading) ...[
                TextButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const RegisterScreen()),
                    );
                  },
                  child: const Text(
                    'ลงทะเบียนผู้ใช้งานใหม่',
                    style: TextStyle(color: AppColors.primary),
                  ),
                ),
              ],
              const SizedBox(height: 32),
              const Text(
                'Mae Fah Luang University',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
}
