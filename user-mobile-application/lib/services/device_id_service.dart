import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

class DeviceIdService {
  static const _storage = FlutterSecureStorage();
  static const _deviceIdKey = 'device_id';
  static String? _cachedDeviceId;

  /// Retrieves the existing device ID from secure storage,
  /// or generates a new one if it doesn't exist.
  static Future<String> getOrCreateDeviceId() async {
    if (_cachedDeviceId != null) {
      return _cachedDeviceId!;
    }

    String? id = await _storage.read(key: _deviceIdKey);
    if (id == null || id.isEmpty) {
      id = const Uuid().v4();
      await _storage.write(key: _deviceIdKey, value: id);
    }

    _cachedDeviceId = id;
    return id;
  }
}
