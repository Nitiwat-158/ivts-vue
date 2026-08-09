import 'package:flutter/foundation.dart';

import '../data/mock_data.dart';
import 'auth_service.dart';
import 'mobile_api_service.dart';

/// Loads vehicles / trip history / request history / notifications from the
/// backend mobile API (MongoDB-backed) filtered by the logged-in user ID.
class AppDataRepository {
  AppDataRepository._();

  static final AppDataRepository instance = AppDataRepository._();

  final MobileApiService _api = MobileApiService();

  /// Bumps whenever a refresh cycle finishes, so the root widget can force
  /// a rebuild and screens re-read the (possibly updated) MockData lists.
  final ValueNotifier<int> refreshTick = ValueNotifier<int>(0);

  /// Notifies UI when live connection to backend Docker server is established (true) or failed (false).
  final ValueNotifier<bool?> dockerConnectedNotifier = ValueNotifier<bool?>(null);

  /// Notifies UI whether there is an active emergency report in progress (holds the report ID).
  final ValueNotifier<String?> activeEmergencyIdNotifier = ValueNotifier<String?>(null);

  /// Notifies UI whether there is an active emergency report in progress (holds the report object).
  final ValueNotifier<Map<String, dynamic>?> activeEmergencyReportNotifier = ValueNotifier<Map<String, dynamic>?>(null);

  bool _loading = false;

  Future<void> refresh() async {
    if (_loading) return;
    _loading = true;
    bool success = false;
    try {
      final currentUser = await AuthService().getCurrentUser();
      final userId = currentUser?.effectiveUserId;

      final results = await Future.wait([
        _refreshVehicles(userId: userId),
        _refreshTripHistory(userId: userId),
        _refreshRequestHistory(userId: userId),
        _refreshNotifications(userId: userId),
        _refreshEmergencyReports(userId: userId),
      ]);
      success = results.any((res) => res == true);
      dockerConnectedNotifier.value = success;
    } catch (_) {
      dockerConnectedNotifier.value = false;
    } finally {
      _loading = false;
      refreshTick.value++;
    }
  }

  Future<bool> _refreshVehicles({String? userId}) async {
    try {
      final vehicles = await _api.fetchVehicles(userId: userId);
      MockData.vehicles
        ..clear()
        ..addAll(vehicles);
      debugPrint('AppDataRepository: loaded ${vehicles.length} vehicles from API for user $userId');
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchVehicles failed, keeping previously loaded data ($error)');
      return false;
    }
  }

  Future<bool> _refreshTripHistory({String? userId}) async {
    try {
      final history = await _api.fetchTripHistory(userId: userId);
      MockData.tripHistory
        ..clear()
        ..addAll(history);
      debugPrint('AppDataRepository: loaded ${history.length} trip history entries from API for user $userId');
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchTripHistory failed, keeping previously loaded data ($error)');
      return false;
    }
  }

  Future<bool> _refreshRequestHistory({String? userId}) async {
    try {
      final requests = await _api.fetchRequestHistory(userId: userId);
      MockData.requestHistory
        ..clear()
        ..addAll(requests);
      debugPrint('AppDataRepository: loaded ${requests.length} request history entries from API for user $userId');
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchRequestHistory failed, keeping previously loaded data ($error)');
      return false;
    }
  }

  Future<bool> _refreshNotifications({String? userId}) async {
    try {
      final notifications = await _api.fetchNotifications(userId: userId);
      MockData.notifications
        ..clear()
        ..addAll(notifications);
      debugPrint('AppDataRepository: loaded ${notifications.length} notifications from API for user $userId');
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchNotifications failed, keeping previously loaded data ($error)');
      return false;
    }
  }

  Future<bool> _refreshEmergencyReports({String? userId}) async {
    try {
      final reports = await _api.fetchEmergencyReports(userId: userId);
      if (reports.isEmpty) {
        activeEmergencyReportNotifier.value = null;
        activeEmergencyIdNotifier.value = null;
        return true;
      }

      final latestReport = reports.first;
      final status = (latestReport['status'] as String? ?? '').toUpperCase();

      if (status != 'RESOLVED' && status != 'CLOSED') {
        activeEmergencyReportNotifier.value = latestReport;
        activeEmergencyIdNotifier.value = latestReport['_id'] as String?;
      } else {
        activeEmergencyReportNotifier.value = null;
        activeEmergencyIdNotifier.value = null;
      }
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchEmergencyReports failed ($error)');
      return false;
    }
  }

}
