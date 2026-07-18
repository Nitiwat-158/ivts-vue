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
}
