import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'services/notification_service.dart';
import 'services/banner_ad_helper.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Run Flutter App UI immediately so it never freezes on the native splash screen
  runApp(
    const ProviderScope(
      child: PosApp(),
    ),
  );

  // 2. Initialize AdMob and Firebase Notifications asynchronously in the background
  _initializeBackgroundServices();
}

Future<void> _initializeBackgroundServices() async {
  try {
    await BannerAdHelper.initialize();
  } catch (e) {
    debugPrint('AdMob initialization error: $e');
  }

  try {
    await NotificationService.initialize();
  } catch (e) {
    debugPrint('NotificationService initialization error: $e');
  }
}

