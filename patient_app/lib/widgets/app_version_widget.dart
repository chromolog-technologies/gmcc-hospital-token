import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';

/// Dynamic App Version and Developer Branding Widget.
/// 
/// Automatically fetches the exact Version Name and Version Code (Build Number)
/// directly from the Android App Manifest / PackageInfo at runtime.
/// Updates automatically on every new release.
class AppVersionWidget extends StatefulWidget {
  final Color textColor;
  final Color brandColor;

  const AppVersionWidget({
    super.key,
    this.textColor = Colors.white,
    this.brandColor = Colors.white,
  });

  @override
  State<AppVersionWidget> createState() => _AppVersionWidgetState();
}

class _AppVersionWidgetState extends State<AppVersionWidget> {
  String _version = '2.1';
  String _buildNumber = '15';
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _loadPackageInfo();
  }

  Future<void> _loadPackageInfo() async {
    try {
      final info = await PackageInfo.fromPlatform();
      if (mounted) {
        setState(() {
          _version = info.version;
          _buildNumber = info.buildNumber;
          _loaded = true;
        });
      }
    } catch (e) {
      debugPrint('Error loading package info: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final versionDisplay = _loaded
        ? 'v$_version ($_buildNumber)'
        : 'v$_version ($_buildNumber)';

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          versionDisplay,
          style: TextStyle(
            color: widget.textColor.withOpacity(0.85),
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          'Developed by Chromolog Technologies',
          style: TextStyle(
            color: widget.brandColor,
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }
}
