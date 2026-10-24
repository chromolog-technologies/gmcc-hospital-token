import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../services/banner_ad_helper.dart';

/// Reusable Anchored Adaptive Banner Ad Widget.
/// 
/// Dynamically calculates available screen width for optimal banner display.
/// Manages ad loading lifecycle, failure handling, and safe disposal.
/// Remains completely invisible (zero height) if an ad fails to load, ensuring
/// the existing application UI and experience are never broken.
class BannerAdWidget extends StatefulWidget {
  const BannerAdWidget({super.key});

  @override
  State<BannerAdWidget> createState() => _BannerAdWidgetState();
}

class _BannerAdWidgetState extends State<BannerAdWidget> {
  static const String _tag = 'BannerAdWidget';

  BannerAd? _bannerAd;
  bool _isAdLoaded = false;
  AdSize? _adSize;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_bannerAd == null) {
      _loadAnchoredAdaptiveBanner();
    }
  }

  Future<void> _loadAnchoredAdaptiveBanner() async {
    final double width = MediaQuery.of(context).size.width.truncateToDouble();
    final AdSize? size = await AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(width.toInt());

    if (size == null) {
      debugPrint('$_tag: Could not determine anchored adaptive banner size');
      return;
    }

    setState(() {
      _adSize = size;
    });

    final String adUnitId = BannerAdHelper.bannerAdUnitId;
    debugPrint('$_tag: Banner loading started with Unit ID: $adUnitId');

    _bannerAd = BannerAd(
      adUnitId: adUnitId,
      size: size,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (Ad ad) {
          debugPrint('$_tag: Banner loaded successfully');
          if (mounted) {
            setState(() {
              _isAdLoaded = true;
            });
          }
        },
        onAdFailedToLoad: (Ad ad, LoadAdError error) {
          debugPrint('$_tag: Banner failed to load: Code ${error.code}, Message: ${error.message}');
          ad.dispose();
          if (mounted) {
            setState(() {
              _bannerAd = null;
              _isAdLoaded = false;
            });
          }
        },
        onAdOpened: (Ad ad) => debugPrint('$_tag: Banner ad opened'),
        onAdClosed: (Ad ad) => debugPrint('$_tag: Banner ad closed'),
        onAdImpression: (Ad ad) => debugPrint('$_tag: Banner ad impression recorded'),
      ),
    );

    return _bannerAd!.load();
  }

  @override
  void dispose() {
    debugPrint('$_tag: Disposing banner ad widget resources');
    _bannerAd?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAdLoaded || _bannerAd == null || _adSize == null) {
      // Return zero-size box when ad is not available to maintain seamless UI
      return const SizedBox.shrink();
    }

    return Container(
      alignment: Alignment.center,
      width: _adSize!.width.toDouble(),
      height: _adSize!.height.toDouble(),
      color: Colors.transparent,
      child: AdWidget(ad: _bannerAd!),
    );
  }
}
