import '../models/emergency_status.dart';
import '../models/history_entry.dart';
import '../models/notification_item.dart';
import '../models/vehicle.dart';

class MockData {
  static final List<Vehicle> vehicles = [
    const Vehicle(
      id: 'CR0001',
      plateNumber: 'สน 1669',
      vehicleCode: 'CR0001',
      type: 'Car',
      brand: 'Honda',
      model: 'Accord',
      color: 'Black',
      ownerName: 'Wan Inwza',
      issueDate: '11/08/2569',
      expiryDate: '11/08/2570',
      daysUntilExpiry: 21,
      status: VehicleStatus.expiringSoon,
      lastLocation: 'E2 (updated 4:40 PM)',
      lastUpdatedTime: '4:40 PM',
    ),
    const Vehicle(
      id: 'B0001',
      plateNumber: 'สน 191',
      vehicleCode: 'B0001',
      type: 'Motorcycle',
      brand: 'Yamaha',
      model: 'Fino',
      color: 'White',
      ownerName: 'Wan Inwza',
      issueDate: '02/02/2569',
      expiryDate: '02/02/2571',
      daysUntilExpiry: 210,
      status: VehicleStatus.active,
      lastLocation: 'Dorm 4 (updated 2:15 PM)',
      lastUpdatedTime: '2:15 PM',
    ),
  ];

  static Vehicle get mostRecentlyMoved => vehicles.first;

  static final List<TripHistory> tripHistory = [
    const TripHistory(
      vehicleCode: 'สน 1669',
      vehicleId: 'CR0001',
      dateGroup: 'Today',
      date: '11/04/2026',
      time: '03:16 PM',
    ),
    const TripHistory(
      vehicleCode: 'สน 1669',
      vehicleId: 'CR0001',
      dateGroup: '7 days ago',
      date: '10/04/2026',
      time: '09:52 AM',
    ),
    const TripHistory(
      vehicleCode: 'สน 1669',
      vehicleId: 'CR0001',
      dateGroup: '7 days ago',
      date: '09/04/2026',
      time: '01:05 PM',
    ),
  ];

  static final List<TripWaypoint> tripWaypoints = [
    const TripWaypoint(time: '03:16 PM', description: 'ประตูหน้ามหาลัย'),
    const TripWaypoint(time: '03:16 PM', description: 'เข้าจอดที่อาคารเรียนรวม 5'),
    const TripWaypoint(time: '04:24 PM', description: 'ออกจากอาคารเรียนรวม 5'),
    const TripWaypoint(time: '04:26 PM', description: 'ถึงที่จอดรถหอพักนักศึกษา'),
  ];

  static final List<RequestHistoryItem> requestHistory = [
    const RequestHistoryItem(
      title: 'Renewal',
      vehicleCode: 'สน 1669',
      vehicleId: 'CR0001',
      date: '10/03/2026',
      dateGroup: 'Today',
    ),
    const RequestHistoryItem(
      title: 'Vehicle registration',
      vehicleCode: 'สน 1669',
      vehicleId: 'CR0001',
      date: '10/03/2026',
      dateGroup: '11 month ago',
    ),
  ];

  static final List<NotificationItem> notifications = [
    const NotificationItem(
      type: NotificationType.system,
      title: 'Your request had been submit',
      description: 'Your request number TH00001 on 11/04/2026 has been submit',
      dateGroup: 'Today',
    ),
    const NotificationItem(
      type: NotificationType.system,
      title: 'Traffic Update: Road closure for Lamduan Games 26th',
      description: 'Road closure from Swimming pool building to the Central Stadium on 11 Jun 13 Jun',
      dateGroup: '7 days ago',
    ),
    const NotificationItem(
      type: NotificationType.renewal,
      title: 'My Vehicle',
      description: 'รถหมายเลขทะเบียน รถ 1999 กำลังใกล้หมดอายุ ผ่านอาคาร E4',
      dateGroup: '7 days ago',
    ),
  ];

  static final List<EmergencyStatusUpdate> emergencyTimeline = [
    const EmergencyStatusUpdate(
      step: EmergencyStep.submitted,
      label: 'ส่งคำร้องเรียบร้อย',
      timestamp: '4:41 PM',
      completed: true,
    ),
    const EmergencyStatusUpdate(
      step: EmergencyStep.acknowledged,
      label: 'เจ้าหน้าที่รับคำร้องแล้ว',
      timestamp: '4:43 PM',
      completed: true,
    ),
    const EmergencyStatusUpdate(
      step: EmergencyStep.contacting,
      label: 'กำลังติดต่อกลับ',
      timestamp: '',
      completed: false,
    ),
  ];

  static const String securityPhoneNumber = '+66531234567';
}
