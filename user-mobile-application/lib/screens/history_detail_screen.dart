import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/history_entry.dart';
import '../theme/app_theme.dart';
import '../widgets/map_placeholder.dart';

/// จับคู่ session เข้า-ออกจาก field eventType ตรงๆ (ไม่ต้องเดาจากข้อความอีกแล้ว)
class _ZoneSession {
  final String zoneName;
  final String entryTime;
  final String? exitTime; // null = ยังไม่มี exit event ที่จับคู่ได้ (ยังอยู่ในพื้นที่นี้)
  final bool isCheckpointOnly;

  const _ZoneSession({
    required this.zoneName,
    required this.entryTime,
    this.exitTime,
    this.isCheckpointOnly = false,
  });
}

List<_ZoneSession> _groupWaypointsIntoSessions(List<TripWaypoint> waypoints) {
  final sessions = <_ZoneSession>[];
  final usedExitIndexes = <int>{};

  for (int i = 0; i < waypoints.length; i++) {
    if (usedExitIndexes.contains(i)) continue;
    final wp = waypoints[i];

    if (wp.eventType == WaypointEventType.checkpoint) {
      sessions.add(_ZoneSession(
        zoneName: wp.zoneName,
        entryTime: wp.time,
        isCheckpointOnly: true,
      ));
      continue;
    }

    if (wp.eventType == WaypointEventType.entry) {
      int? matchedExitIndex;
      for (int j = i + 1; j < waypoints.length; j++) {
        if (waypoints[j].eventType == WaypointEventType.exit &&
            waypoints[j].zoneName == wp.zoneName) {
          matchedExitIndex = j;
          break;
        }
      }
      if (matchedExitIndex != null) {
        usedExitIndexes.add(matchedExitIndex);
        sessions.add(_ZoneSession(
          zoneName: wp.zoneName,
          entryTime: wp.time,
          exitTime: waypoints[matchedExitIndex].time,
        ));
      } else {
        // ไม่มี exit จับคู่ได้ = ยังอยู่ในพื้นที่นี้ (current)
        sessions.add(_ZoneSession(zoneName: wp.zoneName, entryTime: wp.time));
      }
    }
    // eventType == exit ที่ไม่ถูกจับคู่ (กรณีข้อมูลไม่ครบ) จะถูกข้ามไปเงียบๆ
    // TODO: พิจารณาเพิ่ม log/แจ้งเตือนถ้าเจอ exit ที่ไม่มี entry คู่กัน (อาจแปลว่าข้อมูล tracks table ขาดหาย)
  }
  return sessions;
}

IconData _iconForZone(_ZoneSession s) {
  if (s.isCheckpointOnly) return Icons.sensor_door_rounded;
  if (s.zoneName.contains('จอดรถ') || s.zoneName.contains('หอพัก')) {
    return Icons.local_parking_rounded;
  }
  return Icons.apartment_rounded;
}

class HistoryDetailScreen extends StatelessWidget {
  const HistoryDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sessions = _groupWaypointsIntoSessions(MockData.tripWaypoints);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text('Trip detail'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: MapPlaceholder(height: 220),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.divider.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.directions_car_filled_rounded, color: AppColors.primary),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'สน 1669   ID: CR0001\nApril 11, 2026 at 3:16 PM · Chiang Rai',
                            style: TextStyle(color: AppColors.primary),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'สรุปการเข้า-ออกพื้นที่',
                    style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 15),
                  ),
                  const SizedBox(height: 10),
                  ...sessions.map((s) => _ZoneSessionCard(session: s)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ZoneSessionCard extends StatelessWidget {
  final _ZoneSession session;

  const _ZoneSessionCard({required this.session});

  @override
  Widget build(BuildContext context) {
    final isOngoing = !session.isCheckpointOnly && session.exitTime == null;
    final statusColor = isOngoing ? AppColors.success : AppColors.textSecondary;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isOngoing ? AppColors.success.withValues(alpha: 0.4) : AppColors.divider,
          width: isOngoing ? 1.4 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.cardGrey,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(_iconForZone(session), size: 18, color: AppColors.primary),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  session.zoneName,
                  style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
                ),
              ),
              if (isOngoing)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'อยู่ในพื้นที่นี้',
                    style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w700, fontSize: 11),
                  ),
                ),
            ],
          ),
          if (!session.isCheckpointOnly) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                _TimePoint(label: 'เข้า', time: session.entryTime, color: AppColors.primary),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Icon(Icons.arrow_forward_rounded, size: 16, color: AppColors.divider),
                ),
                _TimePoint(
                  label: 'ออก',
                  time: session.exitTime ?? '—',
                  color: statusColor,
                ),
              ],
            ),
          ] else ...[
            const SizedBox(height: 6),
            Text(
              'ผ่านเวลา ${session.entryTime}',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}

class _TimePoint extends StatelessWidget {
  final String label;
  final String time;
  final Color color;

  const _TimePoint({required this.label, required this.time, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        Text(time, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13)),
      ],
    );
  }
}