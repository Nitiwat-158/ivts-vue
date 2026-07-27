import 'dart:convert';
import 'api_config.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class AuthUser {
  final String id;
  final String name;
  final String surname;
  final String email;
  final String role;

  AuthUser({
    required this.id,
    required this.name,
    required this.surname,
    required this.email,
    required this.role,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
        id: json['id'],
        name: json['name'],
        surname: json['surname'],
        email: json['email'],
        role: json['role'],
      );
}

class AuthService {
  static const String _clientId = 'ivts-gateway-local';
  static const String _authorizationEndpoint = 'https://iam.mfu.ac.th/oauth/authorize';
  static const String _redirectScheme = 'ivtsapp';
  static String get _backendBaseUrl => ApiConfig.baseUrl.replaceAll('/api/v1/mobile', '');

  static const _storage = FlutterSecureStorage();

  /// เปิด browser ให้ user login ผ่าน MFU IAM แล้วดักจับ redirect กลับมาที่แอป
  /// คืนค่า AuthUser ถ้าสำเร็จ, null ถ้า user ยกเลิก, throw Exception ถ้า error จริง
  Future<AuthUser?> signInWithIam() async {
    final redirectUri = '$_redirectScheme://callback';

    final authUrl = Uri.parse(_authorizationEndpoint).replace(queryParameters: {
      'client_id': _clientId,
      'response_type': 'code',
      'redirect_uri': redirectUri,
      'scope': 'openid profile email',
    });

    try {
      final result = await FlutterWebAuth2.authenticate(
        url: authUrl.toString(),
        callbackUrlScheme: _redirectScheme,
      );

      final code = Uri.parse(result).queryParameters['code'];
      if (code == null) return null;

      return _exchangeCodeWithBackend(code, redirectUri);
    } catch (e) {
      // กรณี User กดยกเลิก
      return null;
    }
  }

  Future<AuthUser> _exchangeCodeWithBackend(String code, String redirectUri) async {
    final response = await http.post(
      Uri.parse('$_backendBaseUrl/api/auth/login-iam'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'code': code, 'redirectUri': redirectUri}),
    );

    if (response.statusCode != 200) {
      throw Exception('เข้าสู่ระบบผ่าน IAM ไม่สำเร็จ (${response.statusCode})');
    }

    final data = jsonDecode(response.body);
    if (data['success'] != true) {
      throw Exception('เข้าสู่ระบบผ่าน IAM ไม่สำเร็จ');
    }

    await _storage.write(key: 'app_token', value: data['token']);
    return AuthUser.fromJson(data['user']);
  }

  Future<String?> getStoredToken() => _storage.read(key: 'app_token');

  Future<void> signOut() => _storage.delete(key: 'app_token');
}
