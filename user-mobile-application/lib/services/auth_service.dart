import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'api_config.dart';
import 'device_id_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class SignInResult {
  final bool requires2FA;
  final String? pendingToken;
  final AuthUser? user;

  SignInResult({required this.requires2FA, this.pendingToken, this.user});
}

class AuthUser {
  final String id;
  final String name;
  final String surname;
  final String email;
  final String? avatarUrl;
  final String role;

  AuthUser({
    required this.id,
    required this.name,
    required this.surname,
    required this.email,
    this.avatarUrl,
    required this.role,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      surname: json['surname'] ?? '',
      email: json['email'] ?? '',
      avatarUrl: json['avatarUrl'],
      role: json['role'] ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'surname': surname,
      'email': email,
      'avatarUrl': avatarUrl,
      'role': role,
    };
  }
}

class AuthService {
  static String get _backendBaseUrl => ApiConfig.baseUrl.replaceAll('/api/v1/mobile', '');

  static const _storage = FlutterSecureStorage();

  Future<SignInResult> signIn(String username, String password) async {
    // DEV BYPASS: ข้ามการตรวจสอบ IAM เพื่อให้เข้าแอปได้ทันที
    if (kDebugMode && username == 'tester01' && password == '********') {
      await _storage.write(key: 'xAccessToken', value: 'dummy_dev_token_123');
      final user = AuthUser(
        id: 'seed_usr_1', // ใช้ ID นี้เพื่อให้มีข้อมูลรถ (จากไฟล์ seed-owner-vehicles)
        name: 'สมชาย',
        surname: 'ใจดี',
        email: 'tester@test.com',
        role: 'user',
      );
      await _storage.write(key: 'user', value: jsonEncode({
        'id': user.id, 'name': user.name, 'surname': user.surname, 'email': user.email, 'role': user.role,
      }));
      return SignInResult(requires2FA: false, user: user);
    }

    final String encodedUsername = base64Encode(utf8.encode(username));
    final String encodedPassword = base64Encode(utf8.encode(password));
    final String deviceId = await DeviceIdService.getOrCreateDeviceId();

    final response = await http.post(
      Uri.parse('$_backendBaseUrl/api/v1/mobile/auth/signin'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': encodedUsername, 
        'password': encodedPassword,
        'system': 'ivts',
        'authSystem': 'ivts',
        'deviceId': deviceId
      }),
    );

    if (response.statusCode != 200) {
      try {
        final errData = jsonDecode(response.body);
        
        String errorMsg = 'เข้าสู่ระบบไม่สำเร็จ';
        if (errData['error'] != null) {
          errorMsg = errData['error'].toString();
        } else if (errData['message'] != null && errData['message'] is List && (errData['message'] as List).isNotEmpty) {
          final msgList = errData['message'] as List;
          final thMsg = msgList.firstWhere((m) => m['key'] == 'th', orElse: () => msgList.first);
          if (thMsg != null && thMsg['value'] != null) {
            errorMsg = thMsg['value'].toString();
          }
        } else if (errData['description'] != null && errData['description'] is List && (errData['description'] as List).isNotEmpty) {
          final descList = errData['description'] as List;
          final thDesc = descList.firstWhere((m) => m['key'] == 'th', orElse: () => descList.first);
          if (thDesc != null && thDesc['value'] != null) {
            errorMsg = thDesc['value'].toString();
          }
        }
        
        throw Exception(errorMsg);
      } catch (e) {
        if (e is Exception && !e.toString().contains('(${response.statusCode})')) {
          rethrow;
        }
        throw Exception('เข้าสู่ระบบไม่สำเร็จ (${response.statusCode})');
      }
    }

    final data = jsonDecode(response.body);
    if (data['status'] != true) {
      throw Exception(data['error'] ?? 'เข้าสู่ระบบไม่สำเร็จ');
    }

    final accessToken = data['data']['xAccessToken'];
    if (accessToken == null) {
      throw Exception('ไม่พบ Access Token');
    }

    final bool require2FA = !(data['data']['require2FA'] == false);

    if (require2FA) {
      return SignInResult(requires2FA: true, pendingToken: accessToken);
    }

    await _storage.write(key: 'app_token', value: accessToken);
    
    final account = data['data']['account'] ?? {};
    final user = AuthUser(
      id: account['_id'] ?? '',
      name: account['firstname'] ?? account['name'] ?? '',
      surname: account['lastname'] ?? account['surname'] ?? '',
      email: account['email'] ?? '',
      avatarUrl: account['avatar_url'],
      role: account['role'] ?? 'user',
    );
    
    await _storage.write(key: 'user', value: jsonEncode(user.toJson()));

    return SignInResult(requires2FA: false, user: user);
  }

  Future<SignInResult> signInWithGoogle(String idToken) async {
    final String deviceId = await DeviceIdService.getOrCreateDeviceId();

    final response = await http.post(
      Uri.parse('$_backendBaseUrl/api/v1/mobile/auth/signin'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': idToken,
        'authType': '689c06d5255db4e56aea8902',
        'system': 'ivts',
        'authSystem': 'ivts',
        'deviceId': deviceId
      }),
    );

    if (response.statusCode != 200) {
      try {
        final errData = jsonDecode(response.body);
        String errorMsg = 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ';
        if (errData['error'] != null) {
          errorMsg = errData['error'].toString();
        }
        throw Exception(errorMsg);
      } catch (e) {
        if (e is Exception && !e.toString().contains('(${response.statusCode})')) {
          rethrow;
        }
        throw Exception('เข้าสู่ระบบด้วย Google ไม่สำเร็จ (${response.statusCode})');
      }
    }

    final data = jsonDecode(response.body);
    if (data['status'] != true) {
      throw Exception(data['error'] ?? 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    }

    final accessToken = data['data']['xAccessToken'];
    if (accessToken == null) {
      throw Exception('ไม่พบ Access Token');
    }

    final bool require2FA = !(data['data']['require2FA'] == false);

    if (require2FA) {
      return SignInResult(requires2FA: true, pendingToken: accessToken);
    }

    await _storage.write(key: 'app_token', value: accessToken);
    
    final account = data['data']['account'] ?? {};
    final user = AuthUser(
      id: account['_id'] ?? '',
      name: account['firstname'] ?? account['name'] ?? '',
      surname: account['lastname'] ?? account['surname'] ?? '',
      email: account['email'] ?? '',
      avatarUrl: account['avatar_url'],
      role: account['role'] ?? 'user',
    );
    
    await _storage.write(key: 'user', value: jsonEncode(user.toJson()));

    return SignInResult(requires2FA: false, user: user);
  }

  Future<String?> getStoredToken() => _storage.read(key: 'app_token');

  Future<AuthUser?> getCurrentUser() async {
    final userStr = await _storage.read(key: 'user');
    if (userStr != null && userStr.isNotEmpty) {
      try {
        return AuthUser.fromJson(jsonDecode(userStr));
      } catch (e) {
        debugPrint('Failed to parse stored user: $e');
      }
    }
    return null;
  }

  Future<void> verifyTwoFactor(String otpCode, String pendingToken, {bool trustDevice = false}) async {
    final response = await http.post(
      Uri.parse('$_backendBaseUrl/api/v1/auth/2fa/verify'),
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': pendingToken,
      },
      body: jsonEncode({'code': otpCode}),
    );

    if (response.statusCode != 200) {
      throw Exception('รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว');
    }

    if (trustDevice) {
      try {
        await http.post(
          Uri.parse('$_backendBaseUrl/api/v1/auth/trust-device'),
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': pendingToken,
          },
          body: jsonEncode({'deviceId': await DeviceIdService.getOrCreateDeviceId()}),
        );
      } catch (e) {
        // Ignore trust device failure
      }
    }

    await _storage.write(key: 'app_token', value: pendingToken);
  }

  Future<void> resendTwoFactor(String pendingToken) async {
    final response = await http.post(
      Uri.parse('$_backendBaseUrl/api/v1/auth/2fa/request'),
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': pendingToken,
      },
    );

    if (response.statusCode != 200) {
      throw Exception('ไม่สามารถขอ OTP ใหม่ได้ในขณะนี้');
    }
  }

  Future<void> signOut() async {
    final token = await getStoredToken();
    if (token != null) {
      try {
        await http.post(
          Uri.parse('$_backendBaseUrl/api/v1/auth/logout'),
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
        );
      } catch (e) {
        debugPrint('revoke session error: $e');
      }
    }
    await _storage.delete(key: 'app_token');
    await _storage.delete(key: 'xAccessToken');
    await _storage.delete(key: 'user');
  }
}
