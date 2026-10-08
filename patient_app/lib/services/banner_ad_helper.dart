import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

/// Production BannerAdHelper for Google AdMob Integration.
/// 
/// Manages AdMob SDK initialization, UMP Consent flow, and Banner Ad Unit ID selection.
/// Automatically enforces Official Google Test Banner Ad Unit IDs during Debug/Development
/// builds to comply strictly with Google Play and AdMob policies.
class BannerAdHelper {
  static const String _tag = 'AdMobBannerAdHelper';

  /// Official Google Android Test Banner Ad Unit ID
  static const String testBannerAdUnitId = 'ca-app-pub-3940256099942544/6300978111';

  /// Real Production Banner Ad Unit ID (Configured for Release builds)
  static const String productionBannerAdUnitId = 'ca-app-pub-7197849036557828/9049496605';

  /// AdMob Application ID for reference:
  /// App ID: ca-app-pub-7197849036557828~4476150171 (Configured in AndroidManifest.xml & strings.xml)
  /// Banner Ad Unit ID: ca-app-pub-7197849036557828/9049496605

  
  static bool _isInitialized = false;

  /// Returns the appropriate Ad Unit ID depending on the build mode.
  /// Enforces Test Banner Ad Unit ID during development (kDebugMode).
  static String get bannerAdUnitId {
    if (kDebugMode) {
      debugPrint('$_tag: DEBUG mode active -> Using Google Official Test Banner Ad Unit ID');
      return testBannerAdUnitId;
    } else {
      debugPrint('$_tag: RELEASE mode active -> Using Production Banner Ad Unit ID');
      return productionBannerAdUnitId;
    }
  }

  /// Initialize Google Mobile Ads SDK and handle UMP User Consent flow once at startup.
  static Future<void> initialize() async {
    if (_isInitialized) return;

    debugPrint('$_tag: AdMob SDK initialization started');
    try {
      // 1. Initialize AdMob SDK
      final InitializationStatus status = await MobileAds.instance.initialize();
      _isInitialized = true;
      debugPrint('$_tag: AdMob SDK initialized successfully: ${status.adapterStatuses}');

      // 2. Request UMP Consent Information
      await _requestUmpConsent();
    } catch (e) {
      debugPrint('$_tag: AdMob SDK initialization error: $e');
    }
  }

  /// Request Google User Messaging Platform (UMP) consent information for GDPR/Privacy compliance.
  static Future<void> _requestUmpConsent() async {
    try {
      final params = ConsentRequestParameters();
      ConsentInformation.instance.requestConsentInfoUpdate(
        params,
        () async {
          debugPrint('$_tag: UMP Consent status updated');
          if (await ConsentInformation.instance.isConsentFormAvailable()) {
            _loadConsentForm();
          }
        },
        (FormError error) {
          debugPrint('$_tag: UMP Consent update failed: ${error.errorCode} - ${error.message}');
        },
      );
    } catch (e) {
      debugPrint('$_tag: UMP Consent request error: $e');
    }
  }

  /// Load and present UMP Consent Form if required by regulations.
  static void _loadConsentForm() {
    ConsentForm.loadAndShowConsentFormIfRequired((FormError? formError) {
      if (formError != null) {
        debugPrint('$_tag: UMP Consent form error: ${formError.errorCode} - ${formError.message}');
      } else {
        debugPrint('$_tag: UMP Consent form completed successfully or not required');
      }
    });
  }
}
