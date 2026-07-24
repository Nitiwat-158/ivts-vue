import 'dart:math';
import '../models/camera.dart';
import '../models/tracking_log.dart';

enum TripStatus { active, completed }

/// 1 trip = ช่วงตั้งแต่รถเข้าประตูมหาลัย (gate_in) จนถึงออกประตู (gate_out)
/// หรือยังไม่ออก (status = active)
class Trip {
  final int vehicleId;
  final List<VehicleDetection> detections; // เรียงตามเวลา รวม gate_in, internal, gate_out (ถ้ามี)
  final Camera entryCamera;
  final Camera? exitCamera; // null = ยังไม่ออก (active)
  final DateTime entryTime;
  final DateTime? exitTime;

  Trip({
    required this.vehicleId,
    required this.detections,
    required this.entryCamera,
    required this.entryTime,
    this.exitCamera,
    this.exitTime,
  });

  TripStatus get status => exitCamera == null ? TripStatus.active : TripStatus.completed;
}

class TripSessionService {
  /// ระยะห่างสูงสุด (เมตร) ที่ยอมให้ถือว่า detection จุดนั้นเป็นกล้องตัวนี้
  /// TODO: ปรับค่าตามความแม่นยำ GPS จริงของกล้องแต่ละจุด อาจต้องต่างกันตามพื้นที่
  static const double _matchThresholdMeters = 50;

  /// คำนวณระยะห่างระหว่าง 2 พิกัดด้วยสูตร Haversine (หน่วยเมตร)
  static double _distanceMeters(double lat1, double lng1, double lat2, double lng2) {
    const earthRadius = 6371000; // เมตร
    final dLat = _degToRad(lat2 - lat1);
    final dLng = _degToRad(lng2 - lng1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_degToRad(lat1)) * cos(_degToRad(lat2)) * sin(dLng / 2) * sin(dLng / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }

  static double _degToRad(double deg) => deg * pi / 180;

  /// หากล้องที่ใกล้ตำแหน่ง detection ที่สุด (ภายใน threshold) — คืน null ถ้าไม่มีกล้องไหนใกล้พอ
  static Camera? matchCamera(VehicleDetection detection, List<Camera> cameras) {
    Camera? nearest;
    double nearestDistance = double.infinity;

    for (final cam in cameras) {
      final d = _distanceMeters(detection.latitude, detection.longitude, cam.latitude, cam.longitude);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearest = cam;
      }
    }

    if (nearest != null && nearestDistance <= _matchThresholdMeters) {
      return nearest;
    }
    return null; // ไม่มีกล้องไหนใกล้พอ — detection นี้จับคู่ไม่ได้ (ข้อมูลเพี้ยน/กล้องยังไม่ลงทะเบียน)
  }

  /// แบ่ง detection ทั้งหมดของรถ 1 คัน (เรียงตามเวลาแล้ว) เป็น list ของ Trip
  /// โดยเริ่ม trip ใหม่ทุกครั้งที่เจอ gate_in และปิด trip เมื่อเจอ gate_out ถัดมา
  static List<Trip> buildTrips({
    required int vehicleId,
    required List<VehicleDetection> detections,
    required List<Camera> cameras,
  }) {
    final sorted = [...detections]..sort((a, b) => a.timestamp.compareTo(b.timestamp));
    final trips = <Trip>[];

    List<VehicleDetection>? currentTripDetections;
    Camera? currentEntryCamera;
    DateTime? currentEntryTime;

    for (final detection in sorted) {
      final camera = matchCamera(detection, cameras);
      if (camera == null) continue; // ข้าม detection ที่จับคู่กล้องไม่ได้

      if (camera.type == CameraType.gateIn) {
        // ถ้ามี trip ที่ยังไม่ปิดค้างอยู่ (ไม่มี gate_out ตามมาก่อนเจอ gate_in ใหม่)
        // ให้ถือว่า trip เก่ายังเป็น active ต่อไป แล้วเริ่ม trip ใหม่แยกออกมา
        if (currentTripDetections != null && currentEntryCamera != null) {
          trips.add(Trip(
            vehicleId: vehicleId,
            detections: currentTripDetections,
            entryCamera: currentEntryCamera,
            entryTime: currentEntryTime!,
          ));
        }
        currentTripDetections = [detection];
        currentEntryCamera = camera;
        currentEntryTime = detection.timestamp;
      } else if (camera.type == CameraType.gateOut) {
        if (currentTripDetections != null && currentEntryCamera != null) {
          currentTripDetections.add(detection);
          trips.add(Trip(
            vehicleId: vehicleId,
            detections: currentTripDetections,
            entryCamera: currentEntryCamera,
            entryTime: currentEntryTime!,
            exitCamera: camera,
            exitTime: detection.timestamp,
          ));
          currentTripDetections = null;
          currentEntryCamera = null;
          currentEntryTime = null;
        }
        // ถ้าเจอ gate_out โดยไม่มี gate_in ค้างอยู่ก่อน = ข้อมูลไม่ครบ (รถเข้ามาก่อนระบบเริ่มเก็บ log)
        // ในกรณีนี้ข้าม ไม่สร้าง trip ให้ เพราะไม่รู้เวลาเข้าจริง
      } else {
        // internal camera — เป็นแค่ waypoint ระหว่างทาง ไม่กระทบสถานะ trip
        currentTripDetections?.add(detection);
      }
    }

    // ถ้ายังมี trip ค้างไม่ปิด (ไม่เจอ gate_out เลย) = trip นี้ยัง active อยู่
    if (currentTripDetections != null && currentEntryCamera != null) {
      trips.add(Trip(
        vehicleId: vehicleId,
        detections: currentTripDetections,
        entryCamera: currentEntryCamera,
        entryTime: currentEntryTime!,
      ));
    }

    return trips;
  }

  /// ใช้ในหน้า Location — คืนเฉพาะ trip ที่ status == active (ยังอยู่ในพื้นที่)
  static List<Trip> filterActiveTrips(List<Trip> trips) =>
      trips.where((t) => t.status == TripStatus.active).toList();

  /// ใช้ในหน้า History — คืนเฉพาะ trip ที่ status == completed (จบทริปแล้ว)
  static List<Trip> filterCompletedTrips(List<Trip> trips) =>
      trips.where((t) => t.status == TripStatus.completed).toList();
}