import 'package:flutter/material.dart';
import 'package:flex_color_scheme/flex_color_scheme.dart';

class AppTheme {
  static ThemeData light = FlexThemeData.light(
    scheme: FlexScheme.materialBaseline,
    surfaceMode: FlexSurfaceMode.levelSurfacesLowScaffold,
    blendLevel: 7,
    subThemesData: const FlexSubThemesData(
      blendOnLevel: 10,
      useM2StyleDividerInM3: true,
      adaptiveRemoveElevationTint: FlexAdaptive.all(),
      defaultRadius: 8.0,
      filledButtonRadius: 10.0,
    ),
    visualDensity: VisualDensity.adaptivePlatformDensity,
    useMaterial3: true,
  );
}
