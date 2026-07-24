/// ประเภทกล้อง CCTV:
/// - gateIn / gateOut: กล้องทางเข้า-ออกมหาวิทยาลัย (ใช้ตัดสิน active/completed trip)
/// - internal: กล้องภายในพื้นที่มหาลัย (ใช้แสดง waypoint เท่านั้น ไม่กระทบสถานะ trip)
///
/// TODO: field นี้ (camera_type) ยังไม่มีจริงใน collection `cctvs` ต้องแจ้งทีม backend
/// เพิ่ม field นี้เข้าไป — ตอนนี้ mock ไว้ก่อนเพื่อให้โครงสร้างฝั่ง Flutter พร้อมใช้งาน
enum CameraType { gateIn, gateOut, internal }

class Camera {
  final String id; // Backend: '_id'
  final String name; // Backend: 'camera_name'
  final double latitude; // Backend: 'location.latitude'
  final double longitude; // Backend: 'location.longitude'
  final CameraType type; // Backend: (PENDING) 'camera_type'

  const Camera({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.type,
  });

  factory Camera.fromJson(Map<String, dynamic> json) {
    // Parse location sub-document
    final location = json['location'] as Map<String, dynamic>? ?? {};

    // TODO: 'camera_type' field is currently missing in the backend schema.
    // Defaulting to 'internal' for now. Once the backend adds this field, parse it here.
    final typeString = json['camera_type'] as String?;
    CameraType parsedType;
    switch (typeString) {
      case 'gateIn':
        parsedType = CameraType.gateIn;
        break;
      case 'gateOut':
        parsedType = CameraType.gateOut;
        break;
      case 'internal':
      default:
        parsedType = CameraType.internal;
        break;
    }

    return Camera(
      id: json['_id']?.toString() ?? '',
      name: json['camera_name'] ?? 'Unknown Camera',
      latitude: (location['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (location['longitude'] as num?)?.toDouble() ?? 0.0,
      type: parsedType,
    );
  }
}