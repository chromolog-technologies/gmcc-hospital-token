import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'core/theme/app_theme.dart';
import 'screens/splash_screen.dart'; // Keeping old splash for now

class PosApp extends ConsumerWidget {
  const PosApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ScreenUtilInit(
      designSize: const Size(1280, 800), // Standard POS Tablet size
      minTextAdapt: true,
      builder: (context, child) => MaterialApp(
        title: 'GMCCH Patient Portal',
        theme: AppTheme.light,
        home: const SplashScreen(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
