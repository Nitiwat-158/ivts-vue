import '../providers/locale_provider.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';

class VehicleRegistrationScreen extends StatelessWidget {
  const VehicleRegistrationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.watch<LocaleProvider>().t('register_vehicle'))),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(context.watch<LocaleProvider>().t('vehicle_registration_placeholder')),
      ),
    );
  }
}
