import 'package:flutter/material.dart';

enum AppLanguage { thai, english }

class LocaleProvider extends ChangeNotifier {
  AppLanguage _currentLanguage = AppLanguage.thai;

  AppLanguage get currentLanguage => _currentLanguage;

  void setLanguage(AppLanguage language) {
    if (_currentLanguage != language) {
      _currentLanguage = language;
      notifyListeners();
    }
  }

  String t(String key) {
    return _translations[key]?[_currentLanguage] ?? key;
  }

  static const Map<String, Map<AppLanguage, String>> _translations = {
    'home': {AppLanguage.english: 'Home', AppLanguage.thai: 'หน้าแรก'},
    'location': {AppLanguage.english: 'Location', AppLanguage.thai: 'ตำแหน่ง'},
    'vehicles': {AppLanguage.english: 'Vehicles', AppLanguage.thai: 'ยานพาหนะ'},
    'history': {AppLanguage.english: 'History', AppLanguage.thai: 'ประวัติ'},
    'profile': {AppLanguage.english: 'Profile', AppLanguage.thai: 'โปรไฟล์'},
    'cancel': {AppLanguage.english: 'CANCLE', AppLanguage.thai: 'ยกเลิก'},
    'submit': {AppLanguage.english: 'SUBMIT', AppLanguage.thai: 'ยืนยัน'},
    'confirm': {AppLanguage.english: 'CONFIRM', AppLanguage.thai: 'ตกลง'},
    'add_vehicle': {AppLanguage.english: 'Add Vehicle', AppLanguage.thai: 'เพิ่มรถ'},
    'change_password': {AppLanguage.english: 'Change Password', AppLanguage.thai: 'เปลี่ยนรหัสผ่าน'},
    'request_history': {AppLanguage.english: 'Request History', AppLanguage.thai: 'ประวัติการแจ้งเรื่อง'},
    'logout': {AppLanguage.english: 'LOG OUT', AppLanguage.thai: 'ออกจากระบบ'},
    'user_information': {AppLanguage.english: 'User Information', AppLanguage.thai: 'ข้อมูลผู้ใช้'},
    'email_address': {AppLanguage.english: 'Email address', AppLanguage.thai: 'อีเมล'},
    'phone_number': {AppLanguage.english: 'Phone number', AppLanguage.thai: 'เบอร์โทรศัพท์'},
    'take_photo_camera': {AppLanguage.english: 'Take Photo (Camera)', AppLanguage.thai: 'ถ่ายรูป (Camera)'},
    'choose_from_gallery': {AppLanguage.english: 'Choose from Gallery (Gallery)', AppLanguage.thai: 'เลือกจากคลังภาพ (Gallery)'},
    'take_photo': {AppLanguage.english: 'Take Photo', AppLanguage.thai: 'ถ่ายรูป'},
    'choose_from_gallery_short': {AppLanguage.english: 'Choose from Gallery', AppLanguage.thai: 'เลือกจากคลังภาพ'},
    'delete_profile_picture': {AppLanguage.english: 'Delete Profile Picture', AppLanguage.thai: 'ลบรูปโปรไฟล์'},
    'current_password': {AppLanguage.english: 'Current password', AppLanguage.thai: 'รหัสผ่านปัจจุบัน'},
    'new_password': {AppLanguage.english: 'New password', AppLanguage.thai: 'รหัสผ่านใหม่'},
    'confirm_new_password': {AppLanguage.english: 'Confirm new password', AppLanguage.thai: 'ยืนยันรหัสผ่านใหม่'},
    'error_enter_current_password': {AppLanguage.english: 'Please enter your current password', AppLanguage.thai: 'กรุณากรอกรหัสผ่านปัจจุบัน'},
    'error_password_length': {AppLanguage.english: 'New password must be at least 8 characters', AppLanguage.thai: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'},
    'error_password_mismatch': {AppLanguage.english: 'Passwords do not match', AppLanguage.thai: 'รหัสผ่านไม่ตรงกัน'},
    'password_changed_success': {AppLanguage.english: 'Password changed successfully (mock)', AppLanguage.thai: 'เปลี่ยนรหัสผ่านสำเร็จ (mock)'},
    'close': {AppLanguage.english: 'Close', AppLanguage.thai: 'ปิด'},
    'license_plate': {AppLanguage.english: 'License Plate', AppLanguage.thai: 'ป้ายทะเบียน'},
    'model': {AppLanguage.english: 'Model', AppLanguage.thai: 'รุ่น'},
    'brand': {AppLanguage.english: 'Brand', AppLanguage.thai: 'ยี่ห้อ'},
    'province': {AppLanguage.english: 'Province', AppLanguage.thai: 'จังหวัด'},
    'color': {AppLanguage.english: 'Color', AppLanguage.thai: 'สี'},
    'type': {AppLanguage.english: 'Type', AppLanguage.thai: 'ประเภท'},
    'name': {AppLanguage.english: 'Name', AppLanguage.thai: 'ชื่อ'},
    'surname': {AppLanguage.english: 'Surname', AppLanguage.thai: 'นามสกุล'},
    'citizen_id': {AppLanguage.english: 'Citizen ID', AppLanguage.thai: 'รหัสประจำตัวประชาชน'},
    'vehicle_registration_certificate': {AppLanguage.english: 'Vehicle Registration Certificate', AppLanguage.thai: 'เอกสารทะเบียนรถ'},
    'photo_license_plate': {AppLanguage.english: 'Photo Of The Vehicle License Plate', AppLanguage.thai: 'รูปรถและป้ายทะเบียน'},
    'owner': {AppLanguage.english: 'Owner', AppLanguage.thai: 'เจ้าของ'},
    'vehicle': {AppLanguage.english: 'Vehicle', AppLanguage.thai: 'ยานพาหนะ'},
    'confirm_submit_request': {AppLanguage.english: 'Are you sure to\nsubmit your request ?', AppLanguage.thai: 'คุณแน่ใจหรือไม่ที่จะ\nส่งคำร้องนี้ ?'},
    'emergency_request': {AppLanguage.english: 'Emergency Request', AppLanguage.thai: 'คำร้องฉุกเฉิน'},
    'description': {AppLanguage.english: 'Description', AppLanguage.thai: 'รายละเอียด'},
    'request_for': {AppLanguage.english: 'Request for', AppLanguage.thai: 'คำร้องสำหรับ'},
    'type_here': {AppLanguage.english: 'type here...', AppLanguage.thai: 'พิมพ์ที่นี่...'},
    'attach_picture': {AppLanguage.english: 'Attach Picture', AppLanguage.thai: 'แนบรูปภาพ'},
    'request_submitted': {AppLanguage.english: 'Request submitted', AppLanguage.thai: 'ส่งคำร้องเรียบร้อย'},
    'request_accepted': {AppLanguage.english: 'Staff accepted request', AppLanguage.thai: 'เจ้าหน้าที่รับคำร้องแล้ว'},
    'contacting_back': {AppLanguage.english: 'Contacting you back', AppLanguage.thai: 'กำลังติดต่อกลับ'},
    'case_marked_resolved': {AppLanguage.english: 'Case marked as resolved', AppLanguage.thai: 'เคสถูกทำเครื่องหมายว่าแก้ไขแล้ว'},
    'case_closed': {AppLanguage.english: 'Case closed (Resolved)', AppLanguage.thai: 'เคสถูกปิดแล้ว (Resolved)'},
    'mark_resolved': {AppLanguage.english: 'Mark resolved', AppLanguage.thai: 'ทำเครื่องหมายว่าแก้ไขแล้ว'},
    'mark_as_resolved': {AppLanguage.english: 'Mark as Resolved', AppLanguage.thai: 'ทำเครื่องหมายว่าแก้ไขแล้ว'},
    'confirm_close_emergency': {AppLanguage.english: 'Are you sure you want to mark this emergency as resolved?', AppLanguage.thai: 'คุณแน่ใจหรือไม่ที่จะปิดเคสฉุกเฉินนี้? (Are you sure you want to mark this as resolved?)'},
    'entry_exit_summary': {AppLanguage.english: 'Entry-Exit Summary', AppLanguage.thai: 'สรุปการเข้า-ออกพื้นที่'},
    'entry': {AppLanguage.english: 'Entry', AppLanguage.thai: 'เข้า'},
    'exit': {AppLanguage.english: 'Exit', AppLanguage.thai: 'ออก'},
    'currently_in_area': {AppLanguage.english: 'Currently in this area', AppLanguage.thai: 'อยู่ในพื้นที่นี้'},
    'trip_detail': {AppLanguage.english: 'Trip detail', AppLanguage.thai: 'รายละเอียดทริป'},
    'no_trips_found': {AppLanguage.english: 'No trips found', AppLanguage.thai: 'ไม่พบประวัติ'},
    'no_vehicle_location': {AppLanguage.english: 'No vehicle location data yet', AppLanguage.thai: 'ยังไม่มีข้อมูลตำแหน่งรถ'},
    'live': {AppLanguage.english: 'Live', AppLanguage.thai: 'สด'},
    'notification': {AppLanguage.english: 'Notification', AppLanguage.thai: 'การแจ้งเตือน'},
    'no_requests_found': {AppLanguage.english: 'No requests found', AppLanguage.thai: 'ไม่พบคำร้อง'},
    'no_registered_vehicles': {AppLanguage.english: 'No registered vehicles', AppLanguage.thai: 'ยังไม่มีรถที่ลงทะเบียน'},
    'more': {AppLanguage.english: 'More', AppLanguage.thai: 'เพิ่มเติม'},
    'date_of_issue': {AppLanguage.english: 'Date of Issue', AppLanguage.thai: 'วันที่ออก'},
    'date_of_expiry': {AppLanguage.english: 'Date of Expiry', AppLanguage.thai: 'วันที่หมดอายุ'},
    'view': {AppLanguage.english: 'View', AppLanguage.thai: 'ดู'},
    'details': {AppLanguage.english: 'Details', AppLanguage.thai: 'รายละเอียด'},
    'renewal_request': {AppLanguage.english: 'Renewal Request', AppLanguage.thai: 'คำร้องต่ออายุ'},
    'vehicle_license_plate': {AppLanguage.english: 'The vehicle license plate', AppLanguage.thai: 'ป้ายทะเบียนรถ'},
    'register_vehicle': {AppLanguage.english: 'Register Vehicle', AppLanguage.thai: 'ลงทะเบียนรถ'},
    'tap_to_view_full_route': {AppLanguage.english: 'Tap to view full route', AppLanguage.thai: 'แตะเพื่อดูเส้นทางแบบเต็มจอ'},
    'emergency': {AppLanguage.english: 'Emergency', AppLanguage.thai: 'ฉุกเฉิน'},
    'thai': {AppLanguage.english: 'Thai', AppLanguage.thai: 'ไทย'},
    'english': {AppLanguage.english: 'English', AppLanguage.thai: 'English'},
    'language': {AppLanguage.english: 'Language', AppLanguage.thai: 'ภาษา'},
    'emergency_banner': {AppLanguage.english: 'Emergency request (Theft / Stolen) in progress — Tap to view', AppLanguage.thai: 'มีคำร้องฉุกเฉิน (Theft / Stolen) กำลังดำเนินการ — แตะเพื่อดู'},
    'no_vehicle_banner': {AppLanguage.english: 'You have not registered a vehicle — Start registering your vehicle', AppLanguage.thai: 'คุณยังไม่ได้ลงทะเบียนรถ — เริ่มต้นลงทะเบียนรถของคุณ'},
    'call_staff': {AppLanguage.english: 'Call Staff', AppLanguage.thai: 'โทรหาเจ้าหน้าที่'},
    'time_prefix': {AppLanguage.english: 'Time', AppLanguage.thai: 'เวลา'},
    'date_prefix': {AppLanguage.english: 'Date', AppLanguage.thai: 'วันที่'},
    'call_staff_now': {AppLanguage.english: 'Call staff immediately', AppLanguage.thai: 'โทรแจ้งเจ้าหน้าที่ทันที'},
    'vehicle_registration_placeholder': {AppLanguage.english: 'Vehicle registration form placeholder', AppLanguage.thai: 'ฟอร์มลงทะเบียนรถ'},
    'vehicle_expiring': {AppLanguage.english: 'Vehicle {code} is expiring in {days} days', AppLanguage.thai: 'รถ {code} ใกล้หมดอายุทะเบียนใน {days} วัน'},
    'today': {AppLanguage.english: 'Today', AppLanguage.thai: 'วันนี้'},
    'skip_sign_in': {AppLanguage.english: 'Skip for now', AppLanguage.thai: 'ข้ามการเข้าสู่ระบบ'},
  };
}
