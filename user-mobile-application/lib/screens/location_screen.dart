import 'package:flutter/material.dart';
import '../models/vehicle.dart';

class LocationScreen extends StatelessWidget {
  final Vehicle? initialVehicle;

  const LocationScreen({super.key, this.initialVehicle});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Location')),
      body: Center(
        child: Text(initialVehicle?.plateNumber ?? 'Location screen placeholder'),
      ),
    );
  }
}
