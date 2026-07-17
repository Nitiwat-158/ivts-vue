import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('IVTS User Mobile'),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.mobile_friendly, size: 72),
            const SizedBox(height: 16),
            const Text(
              'Flutter mobile app scaffold created',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 12),
            Text(
              'Separated from the web frontend',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
