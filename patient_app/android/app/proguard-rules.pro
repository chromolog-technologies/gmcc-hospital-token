# Prevent R8 missing class warnings on Flutter deferred components & Play Store core
-dontwarn io.flutter.embedding.engine.deferredcomponents.**
-dontwarn com.google.android.play.core.**
-dontwarn com.google.android.gms.**

# Flutter Rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.provider.** { *; }
-keep class io.flutter.app.FlutterApplication { *; }

# Google Mobile Ads & AdMob Rules
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }

# Firebase Rules
-keep class com.google.firebase.** { *; }

# Native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Preserve generated serializer models
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
