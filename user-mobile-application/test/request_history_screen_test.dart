import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:user_mobile_application/data/mock_data.dart';
import 'package:user_mobile_application/models/history_entry.dart';
import 'package:user_mobile_application/providers/locale_provider.dart';
import 'package:user_mobile_application/screens/request_history_screen.dart';
import 'package:user_mobile_application/services/app_data_repository.dart';

void main() {
  setUp(() {
    MockData.requestHistory.clear();
    AppDataRepository.instance.refreshTick.value = 0;
  });

  testWidgets('Request history screen rebuilds when repository data refreshes', (tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => LocaleProvider(),
        child: const MaterialApp(home: RequestHistoryScreen()),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('ไม่พบคำร้อง'), findsOneWidget);

    MockData.requestHistory.add(const RequestHistoryItem(
      title: 'Emergency request',
      vehicleCode: 'AB-1234',
      vehicleId: 'veh-1',
      date: '08/08/2569',
      dateGroup: 'Today',
    ));

    AppDataRepository.instance.refreshTick.value++;
    await tester.pump();

    expect(find.text('คำร้องฉุกเฉิน'), findsOneWidget);
  });
}
