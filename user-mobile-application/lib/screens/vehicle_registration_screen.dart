import 'package:flutter/material.dart';

class VehicleRegistrationScreen extends StatelessWidget {
  const VehicleRegistrationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register Vehicle')),
      body: const Padding(
        padding: EdgeInsets.all(16),
        child: Center(child: Text('Vehicle registration form placeholder')),
      ),
    );
  }
}
