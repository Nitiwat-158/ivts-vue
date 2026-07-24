import 'dart:io' show Platform;

/// Base URL configuration for the IVTS mobile API.
///
/// The backend (`backend-node`) listens on port 8203 in local dev
/// (see `backend-node/.env.local` `PORT=8203`) and mounts the mobile,
/// read-only API at `/api/v1/mobile` (see
/// `backend-node/server/routes/app.routes.js`).
///
/// Android emulators cannot reach the host machine via `localhost` — they
/// must use the special alias `10.0.2.2`. iOS simulators and desktop/web
/// runs can use `localhost` directly. A real device needs the host
/// machine's LAN IP instead; override [ApiConfig.baseUrl] or rebuild with
/// `--dart-define=API_BASE_URL=http://<lan-ip>:8203/api/v1/mobile` in that
/// case.
class ApiConfig {
  ApiConfig._();

  static const String _override = String.fromEnvironment('API_BASE_URL');

  static const int devPort = 8203;

  static String get baseUrl {
    if (_override.isNotEmpty) return _override;
    if (!Platform.isAndroid) return 'http://localhost:$devPort/api/v1/mobile';
    return 'http://10.0.2.2:$devPort/api/v1/mobile';
  }

  /// Network/parse timeout for each API call before falling back to
  /// MockData, per the product requirement: "ถ้าดึงข้อมูลจาก mongodb ผ่าน API
  /// ไม่ได้ ให้ใช้ mock_data".
  static const Duration requestTimeout = Duration(seconds: 6);
}
