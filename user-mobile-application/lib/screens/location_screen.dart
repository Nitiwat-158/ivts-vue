import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';

class LocationScreen extends StatelessWidget {
  final Vehicle? initialVehicle;

  const LocationScreen({super.key, this.initialVehicle});

  @override
  Widget build(BuildContext context) {
    final vehicle = initialVehicle ?? MockData.mostRecentlyMoved;

    return Stack(
      children: [
        Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFFEFF5F7), Color(0xFFDDE8EE)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: CustomPaint(
            painter: _MapPainter(),
            child: const SizedBox.expand(),
          ),
        ),

        Positioned(
          top: 90,
          right: 24,
          child: Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.divider.withOpacity(0.35),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 28),
          ),
        ),
        Positioned(
          bottom: 16,
          left: 16,
          right: 16,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppColors.divider.withOpacity(0.4),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.cardGrey,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.directions_car_rounded, color: AppColors.primary, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        vehicle.plateNumber,
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'ID: ${vehicle.vehicleCode}',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        vehicle.lastLocation,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.14),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Live',
                    style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w700, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFBFD5DE)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final verticalLines = <double>[0, size.width * 0.25, size.width * 0.5, size.width * 0.75, size.width];
    for (final x in verticalLines) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    final horizontalLines = <double>[0, size.height * 0.25, size.height * 0.5, size.height * 0.75, size.height];
    for (final y in horizontalLines) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }

    final outline = Paint()
      ..color = const Color(0xFF8DA6B6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;

    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.12, size.height * 0.18, size.width * 0.72, size.height * 0.6),
        const Radius.circular(26),
      ),
      outline,
    );

    final road = Paint()
      ..color = const Color(0xFF6F8A99)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(Offset(size.width * 0.18, size.height * 0.22), Offset(size.width * 0.42, size.height * 0.48), road);
    canvas.drawLine(Offset(size.width * 0.42, size.height * 0.48), Offset(size.width * 0.72, size.height * 0.26), road);
    canvas.drawLine(Offset(size.width * 0.3, size.height * 0.74), Offset(size.width * 0.82, size.height * 0.64), road);

    final marker = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.fill;

    canvas.drawCircle(Offset(size.width * 0.68, size.height * 0.54), 12, marker);
    canvas.drawCircle(Offset(size.width * 0.68, size.height * 0.54), 6, Paint()..color = Colors.white..style = PaintingStyle.fill);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
