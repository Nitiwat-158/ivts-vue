enum VehicleStatus { active, pending, expiringSoon, expired }

class Vehicle {
  final String id;
  final String plateNumber;
  final String vehicleCode;
  final String type;
  final String brand;
  final String model;
  final String color;
  final String ownerName;
  final String issueDate;
  final String expiryDate;
  final int daysUntilExpiry;
  final VehicleStatus status;
  final String lastLocation;
  final String lastUpdatedTime;

  const Vehicle({
    required this.id,
    required this.plateNumber,
    required this.vehicleCode,
    required this.type,
    required this.brand,
    required this.model,
    required this.color,
    required this.ownerName,
    required this.issueDate,
    required this.expiryDate,
    required this.daysUntilExpiry,
    required this.status,
    required this.lastLocation,
    required this.lastUpdatedTime,
  });
}
