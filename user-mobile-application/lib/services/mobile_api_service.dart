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

  Future<List<NotificationItem>> fetchNotifications({String? userId}) async {
    final json = await _getJson('/notifications', userId: userId);
    return json.map(_notificationFromJson).toList();
  }

  Future<List<Map<String, dynamic>>> _getJson(String path, {String? userId}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path').replace(
      queryParameters: userId != null && userId.isNotEmpty ? {'user_id': userId} : null,
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
      ownerName: json['ownerName'] as String? ?? '',
      issueDate: json['issueDate'] as String? ?? '',
      expiryDate: json['expiryDate'] as String? ?? '',
      daysUntilExpiry: (json['daysUntilExpiry'] as num?)?.toInt() ?? 0,
      status: _statusFromString(json['status'] as String?),
      lastLocation: json['lastLocation'] as String? ?? '',
      lastUpdatedTime: json['lastUpdatedTime'] as String? ?? '',
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
