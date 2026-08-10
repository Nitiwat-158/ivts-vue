import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';
import '../models/history_entry.dart';
import '../models/notification_item.dart';
import '../models/vehicle.dart';

/// Thin HTTP client for the backend mobile API
/// (`backend-node/server/Project/ivts/mobile.routes.js`, mounted at
/// `/api/v1/mobile`). Every method throws on any network, HTTP, or parse
/// error — callers (see `services/app_data_repository.dart`) decide the
/// mock-data fallback.
class MobileApiService {
  MobileApiService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<List<Vehicle>> fetchVehicles({String? userId}) async {
    final json = await _getJson('/vehicles', userId: userId);
    return json.map(_vehicleFromJson).toList();
  }

  Future<List<TripHistory>> fetchTripHistory({String? userId}) async {
    final json = await _getJson('/tracking/history', userId: userId);
    return json.map(_tripHistoryFromJson).toList();
  }

  Future<List<RequestHistoryItem>> fetchRequestHistory({String? userId}) async {
    final json = await _getJson('/requests', userId: userId);
    return json.map(_requestHistoryFromJson).toList();
  }

  Future<Map<String, dynamic>> fetchRequestById(String requestId) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/requests/$requestId');
    final response = await _client.get(uri).timeout(ApiConfig.requestTimeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('GET $uri failed with status ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! Map<String, dynamic>) {
      throw const FormatException('Unexpected request detail API response shape');
    }

    return decoded['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createRequest(Map<String, dynamic> payload) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/requests');
    final response = await _client
        .post(
          uri,
          headers: const {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        )
        .timeout(ApiConfig.requestTimeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('POST $uri failed with status ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! Map<String, dynamic>) {
      throw const FormatException('Unexpected create request API response shape');
    }

    return decoded['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createEmergencyReport(Map<String, dynamic> payload) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/emergency-reports');
    final response = await _client
        .post(
          uri,
          headers: const {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        )
        .timeout(ApiConfig.requestTimeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('POST $uri failed with status ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! Map<String, dynamic>) {
      throw const FormatException('Unexpected create emergency report API response shape');
    }

    return decoded['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> fetchEmergencyReportById(String id) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/emergency-reports/$id');
    final response = await _client.get(uri).timeout(ApiConfig.requestTimeout);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('GET $uri failed with status ${response.statusCode}');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! Map<String, dynamic>) {
      throw const FormatException('Unexpected mobile API response shape');
    }
    return decoded['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateEmergencyReportStatus(String id, {String status = 'RESOLVED'}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/emergency-reports/$id');
    final response = await _client
        .patch(
          uri,
          headers: const {'Content-Type': 'application/json'},
          body: jsonEncode({'status': status}),
        )
        .timeout(ApiConfig.requestTimeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('PATCH $uri failed with status ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! Map<String, dynamic>) {
      throw const FormatException('Unexpected update emergency report API response shape');
    }

    return decoded['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> fetchEmergencyReports({String? userId, String? vehicleId}) async {
    final queryParameters = <String, String>{};
    if (userId != null && userId.isNotEmpty) {
      queryParameters['user_id'] = userId;
      queryParameters['users_id'] = userId;
    }
    if (vehicleId != null && vehicleId.isNotEmpty) {
      queryParameters['vehicle_id'] = vehicleId;
    }
    final uri = Uri.parse('${ApiConfig.baseUrl}/emergency-reports').replace(
      queryParameters: queryParameters.isEmpty ? null : queryParameters,
    );
    final response = await _client.get(uri).timeout(ApiConfig.requestTimeout);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('GET $uri failed with status ${response.statusCode}');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! List) {
      throw const FormatException('Unexpected mobile API response shape');
    }
    return (decoded['data'] as List).cast<Map<String, dynamic>>();
  }

  Future<List<NotificationItem>> fetchNotifications({String? userId}) async {
    final json = await _getJson('/notifications', userId: userId);
    return json.map(_notificationFromJson).toList();
  }

  Future<List<Map<String, dynamic>>> fetchAiTrackCameras({String? userId}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/ai-track/cameras').replace(
      queryParameters: userId != null && userId.isNotEmpty ? {'user_id': userId, 'users_id': userId} : null,
    );
    final response = await _client.get(uri).timeout(ApiConfig.requestTimeout);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('GET $uri failed with status ${response.statusCode}');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('Unexpected mobile API response shape');
    }
    return (decoded['data'] as Map<String, dynamic>).entries
        .map((entry) => {'id': entry.key, ...entry.value as Map<String, dynamic>})
        .toList();
  }

  Future<List<Map<String, dynamic>>> fetchAiTrackRecentVehicles({String? userId, int? limit}) async {
    final queryParameters = <String, String>{};
    if (userId != null && userId.isNotEmpty) {
      queryParameters['user_id'] = userId;
      queryParameters['users_id'] = userId;
    }
    if (limit != null) queryParameters['limit'] = limit.toString();
    final uri = Uri.parse('${ApiConfig.baseUrl}/ai-track/vehicles/recent').replace(queryParameters: queryParameters.isEmpty ? null : queryParameters);
    final response = await _client.get(uri).timeout(ApiConfig.requestTimeout);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('GET $uri failed with status ${response.statusCode}');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! Map<String, dynamic>) {
      throw const FormatException('Unexpected mobile API response shape');
    }
    return (decoded['data']['vehicles'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> fetchAiTrackVehicleTimeline(int globalId) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/ai-track/vehicle/$globalId/timeline');
    final response = await _client.get(uri).timeout(ApiConfig.requestTimeout);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('GET $uri failed with status ${response.statusCode}');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! Map<String, dynamic>) {
      throw const FormatException('Unexpected mobile API response shape');
    }
    return decoded['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> _getJson(String path, {String? userId}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path').replace(
      queryParameters: userId != null && userId.isNotEmpty
          ? {'user_id': userId, 'users_id': userId}
          : null,
    );

    final response = await _client.get(uri).timeout(ApiConfig.requestTimeout);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('GET $uri failed with status ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['data'] is! List) {
      throw const FormatException('Unexpected mobile API response shape');
    }

    return (decoded['data'] as List).cast<Map<String, dynamic>>();
  }

  Vehicle _vehicleFromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] as String? ?? '',
      plateNumber: json['plateNumber'] as String? ?? '',
      vehicleCode: json['vehicleCode'] as String? ?? '',
      type: json['type'] as String? ?? 'Car',
      brand: json['brand'] as String? ?? '',
      model: json['model'] as String? ?? '',
      color: json['color'] as String? ?? '',
      province: json['province'] as String? ?? json['provinceLicense'] as String? ?? json['province_license'] as String?,
      ownerName: json['ownerName'] as String? ?? '',
      issueDate: json['issueDate'] as String? ?? '',
      expiryDate: json['expiryDate'] as String? ?? '',
      daysUntilExpiry: (json['daysUntilExpiry'] as num?)?.toInt() ?? 0,
      status: _statusFromString(json['status'] as String?),
      lastLocation: json['lastLocation'] as String? ?? '',
      lastUpdatedTime: json['lastUpdatedTime'] as String? ?? '',
      aiTrackGlobalId: (() {
        // Accept several possible shapes from backend: aiTrackGlobalId, ai_track_global_id, global_id
        final candidate = json['aiTrackGlobalId'] ?? json['ai_track_global_id'] ?? json['global_id'];
        if (candidate == null) return null;
        if (candidate is int) return candidate;
        if (candidate is String) {
          final parsed = int.tryParse(candidate);
          return parsed;
        }
        return null;
      })(),
    );
  }

  VehicleStatus _statusFromString(String? value) {
    switch (value) {
      case 'pending':
        return VehicleStatus.pending;
      case 'expiringSoon':
        return VehicleStatus.expiringSoon;
      case 'expired':
        return VehicleStatus.expired;
      case 'active':
      default:
        return VehicleStatus.active;
    }
  }

  TripHistory _tripHistoryFromJson(Map<String, dynamic> json) {
    return TripHistory(
      vehicleCode: json['vehicleCode'] as String? ?? '',
      vehicleId: json['vehicleId'] as String? ?? '',
      dateGroup: json['dateGroup'] as String? ?? '',
      date: json['date'] as String? ?? '',
      time: json['time'] as String? ?? '',
    );
  }

  RequestHistoryItem _requestHistoryFromJson(Map<String, dynamic> json) {
    return RequestHistoryItem(
      title: json['title'] as String? ?? '',
      vehicleCode: json['vehicleCode'] as String? ?? '',
      vehicleId: json['vehicleId'] as String? ?? '',
      province: json['province'] as String? ?? json['provinceLicense'] as String? ?? json['province_license'] as String?,
      date: json['date'] as String? ?? '',
      dateGroup: json['dateGroup'] as String? ?? '',
    );
  }

  NotificationItem _notificationFromJson(Map<String, dynamic> json) {
    return NotificationItem(
      type: _notificationTypeFromString(json['type'] as String?),
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      dateGroup: json['dateGroup'] as String? ?? '',
    );
  }

  NotificationType _notificationTypeFromString(String? value) {
    switch (value) {
      case 'renewal':
        return NotificationType.renewal;
      case 'system':
        return NotificationType.system;
      case 'emergency':
      default:
        return NotificationType.emergency;
    }
  }

  void close() => _client.close();
}
