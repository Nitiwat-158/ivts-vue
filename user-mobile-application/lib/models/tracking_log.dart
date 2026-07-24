/// Model รวมข้อมูลจาก tracking_logs (ตำแหน่ง/เวลาที่กล้องเห็นรถ)
/// และ tracking_histories (การผูกกับ vehicle/user) เข้าด้วยกัน
///
/// ในระบบจริง backend ควร join 2 collection นี้ให้แล้วส่งมาเป็นก้อนเดียว
/// ผ่าน internal API เพราะฝั่ง frontend ไม่ควร query ข้าม collection เอง
class VehicleDetection {
  final int logId; // อ้างอิง tracking_logs._id
  final int vehicleId;
  final double latitude;
  final double longitude;
  final String? mediaUrl;
  final DateTime timestamp;

  const VehicleDetection({
    required this.logId,
    required this.vehicleId,
    required this.latitude,
    required this.longitude,
    this.mediaUrl,
    required this.timestamp,
  });
}