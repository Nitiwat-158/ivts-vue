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

class TripWaypoint {
  final String time;
  final String description;

  const TripWaypoint({required this.time, required this.description});
}
