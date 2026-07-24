import '../models/emergency_status.dart';
import '../models/history_entry.dart';
import '../models/notification_item.dart';
import '../models/vehicle.dart';

/// In-memory data store for the app's screens.
///
/// These lists start EMPTY and are populated at runtime by
/// `services/app_data_repository.dart`, which fetches everything from the
/// backend mobile API (MongoDB-backed, see `backend-node/server/Project/ivts/
/// mobile.routes.js`). There is no hardcoded demo/mock content here anymore
/// — per product requirement, MongoDB is the sole data source. If a fetch
/// fails, the affected list simply stays as the last successfully loaded
/// data (or empty, if none has loaded yet); screens must handle the empty
/// state gracefully.
class MockData {
  static final List<Vehicle> vehicles = <Vehicle>[];

  /// Null when no vehicles have been loaded yet (e.g. before the first API
  /// fetch completes, or a genuinely empty fleet).
  static Vehicle? get mostRecentlyMoved => vehicles.isNotEmpty ? vehicles.first : null;

  static final List<TripHistory> tripHistory = <TripHistory>[];

  // No backend collection currently models zone-based entry/exit waypoints
  // (tracking_logs only stores raw lat/long detections, not zone names) —
  // this stays empty until such a data source exists. See
  // docs/tasks/2026-07-24-mobile-mongodb-api.md Open Questions.
  static final List<TripWaypoint> tripWaypoints = <TripWaypoint>[];

  static final List<RequestHistoryItem> requestHistory = <RequestHistoryItem>[];

  static final List<NotificationItem> notifications = <NotificationItem>[];

  // No backend collection models a per-report status timeline audit trail;
  // this stays empty until such a data source exists. Not currently
  // rendered by any screen (see emergency_status_screen.dart).
  static final List<EmergencyStatusUpdate> emergencyTimeline = <EmergencyStatusUpdate>[];

  static const String securityPhoneNumber = '+66531234567';
}
