package gmcch.vast.token

import android.app.Activity
import android.content.Context
import android.util.DisplayMetrics
import android.util.Log
import android.view.View
import android.view.ViewGroup
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds

/**
 * BannerAdHelper
 *
 * Production-ready Kotlin helper class for managing Google AdMob Banner Advertisements.
 * Implements anchored adaptive banners, dynamic screen width detection, Lifecycle management,
 * and automatic Debug vs Release Ad Unit selection to prevent Google Play policy violations.
 */
object BannerAdHelper {

    private const val TAG = "AdMobBannerAdHelper"

    // Official Google Test Banner Ad Unit ID for Android
    private const val TEST_BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111"

    private var isInitialized = false

    /**
     * Initialize the Google Mobile Ads SDK once during application startup.
     */
    fun initialize(context: Context) {
        if (isInitialized) return
        Log.d(TAG, "AdMob SDK initialization started")
        MobileAds.initialize(context) { statusMap ->
            isInitialized = true
            Log.d(TAG, "AdMob SDK initialized successfully. Status: ${statusMap.adapterStatusMap}")
        }
    }

    /**
     * Dynamic screen width determination for anchored adaptive banner ad size.
     */
    fun getAdSize(activity: Activity): AdSize {
        val display = activity.windowManager.defaultDisplay
        val outMetrics = DisplayMetrics()
        display.getMetrics(outMetrics)

        val density = outMetrics.density
        var adWidthPixels = outMetrics.widthPixels.toFloat()

        if (adWidthPixels == 0f) {
            adWidthPixels = outMetrics.widthPixels.toFloat()
        }

        val adWidth = (adWidthPixels / density).toInt()
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(activity, adWidth)
    }

    /**
     * Get appropriate Banner Ad Unit ID.
     * Automatically returns Official Google Test Ad Unit ID during Debug mode.
     */
    fun getAdUnitId(context: Context): String {
        val isDebug = (context.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
        return if (isDebug) {
            Log.i(TAG, "DEBUG mode detected: Using Google Test Banner Ad Unit ID")
            TEST_BANNER_AD_UNIT_ID
        } else {
            val releaseAdUnitId = context.getString(R.string.admob_banner_ad_unit_id)
            Log.i(TAG, "RELEASE mode detected: Using Production Ad Unit ID")
            releaseAdUnitId
        }
    }

    /**
     * Create and load an anchored adaptive banner into a specified view container.
     */
    fun loadBanner(activity: Activity, container: ViewGroup): AdView {
        Log.d(TAG, "Banner loading started")

        val adView = AdView(activity)
        adView.adUnitId = getAdUnitId(activity)

        val adSize = getAdSize(activity)
        adView.setAdSize(adSize)

        adView.adListener = object : AdListener() {
            override fun onAdLoaded() {
                super.onAdLoaded()
                container.visibility = View.VISIBLE
                Log.d(TAG, "Banner loaded successfully")
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                super.onAdFailedToLoad(error)
                container.visibility = View.GONE
                Log.e(TAG, "Banner failed to load: Code ${error.code}, Message: ${error.message}, Domain: ${error.domain}")
            }

            override fun onAdOpened() {
                super.onAdOpened()
                Log.d(TAG, "Banner opened")
            }

            override fun onAdClosed() {
                super.onAdClosed()
                Log.d(TAG, "Banner closed")
            }
        }

        val adRequest = AdRequest.Builder().build()
        adView.loadAd(adRequest)
        container.removeAllViews()
        container.addView(adView)

        return adView
    }

    /**
     * Clean lifecycle destruction for an AdView instance.
     */
    fun destroyBanner(adView: AdView?) {
        try {
            adView?.destroy()
            Log.d(TAG, "Banner instance destroyed successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying banner instance: ${e.localizedMessage}")
        }
    }
}
