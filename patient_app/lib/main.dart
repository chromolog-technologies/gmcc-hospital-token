import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'services/notification_service.dart';
import 'services/banner_ad_helper.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Google Mobile Ads SDK once at app startup
  await BannerAdHelper.initialize();

  // Initialize Notifications
  await NotificationService.initialize();
  
  runApp(
    const ProviderScope(
      child: PosApp(),
    ),
  );
}

