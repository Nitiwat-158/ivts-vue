class TripHistory {
  final String vehicleCode;
  final String vehicleId;
  final String dateGroup;
  final String date;
  final String time;

  const TripHistory({
    required this.vehicleCode,
    required this.vehicleId,
    required this.dateGroup,
    required this.date,
    required this.time,
  });
}

/// ประเภทของเหตุการณ์ที่กล้อง/จุดตรวจจับ:
/// - entry: เข้าพื้นที่ (มี exit คู่กันตามมาทีหลัง หรือยังไม่มี = ยังอยู่ในพื้นที่นี้)
/// - exit: ออกจากพื้นที่ (จับคู่กับ entry ก่อนหน้าที่มี zoneName เดียวกัน)
/// - checkpoint: จุดผ่านทาง เช่น ประตู/ทางเข้า-ออกมหาวิทยาลัย ไม่ใช่จุดจอด จึงไม่มี duration
enum WaypointEventType { entry, exit, checkpoint }

class TripWaypoint {
  final String time;
  final String zoneName;
  final WaypointEventType eventType;

  const TripWaypoint({
    required this.time,
    required this.zoneName,
    required this.eventType,
  });
}

class RequestHistoryItem {
  final String title;
  final String vehicleCode;
  final String vehicleId;
  final String date;
  final String dateGroup;

  const RequestHistoryItem({
    required this.title,
    required this.vehicleCode,
    required this.vehicleId,
    required this.date,
    required this.dateGroup,
  });
}