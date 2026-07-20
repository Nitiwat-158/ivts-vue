enum EmergencyStep { submitted, acknowledged, contacting }

class EmergencyStatusUpdate {
  final EmergencyStep step;
  final String label;
  final String timestamp;
  final bool completed;

  const EmergencyStatusUpdate({
    required this.step,
    required this.label,
    required this.timestamp,
    required this.completed,
  });
}
