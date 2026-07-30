import 'package:flutter/foundation.dart';

import '../data/mock_data.dart';
import 'mobile_api_service.dart';

/// Loads vehicles / trip history / request history / notifications from the
/// backend mobile API (MongoDB-backed) and replaces `MockData`'s in-memory
/// lists in place. MongoDB is the sole data source — there is no
/// hardcoded mock/demo content anymore. If a fetch fails (network error,
/// timeout, unreachable backend, unexpected response shape), the affected
/// list simply keeps whatever was last successfully loaded (empty if
/// nothing has loaded yet); it is not replaced with fake data.
///
/// Note: `tracking_histories` and `requests` collections are currently
/// empty in the live database (verified via mongosh, see
/// docs/tasks/2026-07-24-mobile-mongodb-api.md), so a successful-but-empty
/// API response for those two resources is expected — this is real data,
/// not a fetch failure.
class AppDataRepository {
  AppDataRepository._();

  static final AppDataRepository instance = AppDataRepository._();

  final MobileApiService _api = MobileApiService();

  /// Bumps whenever a refresh cycle finishes, so the root widget can force
  /// a rebuild and screens re-read the (possibly updated) MockData lists.
  final ValueNotifier<int> refreshTick = ValueNotifier<int>(0);

  /// Notifies UI when live connection to backend Docker server is established (true) or failed (false).
  final ValueNotifier<bool?> dockerConnectedNotifier = ValueNotifier<bool?>(null);

  /// Notifies UI whether there is an active emergency report in progress.
  final ValueNotifier<bool> hasActiveEmergencyNotifier = ValueNotifier<bool>(false);


  bool _loading = false;

  Future<void> refresh() async {
    if (_loading) return;
    _loading = true;
    bool success = false;
    try {
      final results = await Future.wait([
        _refreshVehicles(),
        _refreshTripHistory(),
        _refreshRequestHistory(),
        _refreshNotifications(),
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

  Future<bool> _refreshVehicles() async {
    try {
      final vehicles = await _api.fetchVehicles();
      MockData.vehicles
        ..clear()
        ..addAll(vehicles);
      debugPrint('AppDataRepository: loaded ${vehicles.length} vehicles from API');
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchVehicles failed, keeping previously loaded data ($error)');
      return false;
    }
  }

  Future<bool> _refreshTripHistory() async {
    try {
      final history = await _api.fetchTripHistory();
      MockData.tripHistory
        ..clear()
        ..addAll(history);
      debugPrint('AppDataRepository: loaded ${history.length} trip history entries from API');
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchTripHistory failed, keeping previously loaded data ($error)');
      return false;
    }
  }

  Future<bool> _refreshRequestHistory() async {
    try {
      final requests = await _api.fetchRequestHistory();
      MockData.requestHistory
        ..clear()
        ..addAll(requests);
      debugPrint('AppDataRepository: loaded ${requests.length} request history entries from API');
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchRequestHistory failed, keeping previously loaded data ($error)');
      return false;
    }
  }

  Future<bool> _refreshNotifications() async {
    try {
      final notifications = await _api.fetchNotifications();
      MockData.notifications
        ..clear()
        ..addAll(notifications);
      debugPrint('AppDataRepository: loaded ${notifications.length} notifications from API');
      return true;
    } catch (error) {
      debugPrint('AppDataRepository: fetchNotifications failed, keeping previously loaded data ($error)');
      return false;
    }
  }

}
