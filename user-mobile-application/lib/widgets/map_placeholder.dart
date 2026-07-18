import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class MapPlaceholder extends StatelessWidget {
  final double height;

  const MapPlaceholder({super.key, this.height = 220});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFFEFF5F7), Color(0xFFDDE8EE)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: CustomPaint(
        painter: _MapPainter(),
        child: const SizedBox.expand(),
      ),
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

    for (final x in <double>[0, size.width * 0.25, size.width * 0.5, size.width * 0.75, size.width]) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (final y in <double>[0, size.height * 0.25, size.height * 0.5, size.height * 0.75, size.height]) {
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
