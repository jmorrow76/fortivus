# iOS Setup Guide

## Native Features Overview

Fortivus uses Capacitor plugins for native iOS functionality that differentiates it from a standard web app:

- **Native GPS Tracking** - High-accuracy background location for run tracking
- **Haptic Feedback** - Tactile responses for achievements, PRs, and interactions  
- **HealthKit Integration** - Sync workouts and health data with Apple Health
- **Quick Actions** - 3D Touch shortcuts from home screen
- **Camera Access** - Progress photo uploads

---

## Required Info.plist Permissions (CRITICAL)

Add ALL of these keys to your `ios/App/App/Info.plist` file inside the main `<dict>` tag:

### Camera & Photos (Prevents Crashes)
```xml
<key>NSCameraUsageDescription</key>
<string>Fortivus needs camera access to take progress photos and body analysis photos.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Fortivus needs photo library access to upload progress photos.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Fortivus needs permission to save photos to your library.</string>
```

### Location (GPS Run Tracking)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Fortivus uses your location to track runs and display your route on a map.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Fortivus uses your location to track runs in the background so you can see your full route.</string>
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
</array>
```

### HealthKit (Apple Health Sync)
```xml
<key>NSHealthShareUsageDescription</key>
<string>Fortivus reads your health data to personalize workouts and track your fitness progress.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Fortivus writes workout data to Apple Health to keep all your fitness data in one place.</string>
```

**Without these permissions, the app will CRASH when accessing camera, GPS, or HealthKit.**

---

## Native Capacitor Plugins

The app uses these Capacitor plugins for native functionality:

| Plugin | Purpose | App Feature |
|--------|---------|-------------|
| `@capacitor/geolocation` | Native GPS | Run Tracker with background tracking |
| `@capacitor/haptics` | Vibration feedback | PRs, badges, achievements |
| `@capacitor/core` | Platform detection | iOS/Android detection |

These are already installed and integrated in the codebase.

---

## Quick Actions (3D Touch / Long Press)

Add to `ios/App/App/Info.plist`:

```xml
<key>UIApplicationShortcutItems</key>
<array>
    <dict>
        <key>UIApplicationShortcutItemType</key>
        <string>com.fortivus.start-run</string>
        <key>UIApplicationShortcutItemTitle</key>
        <string>Start Run</string>
        <key>UIApplicationShortcutItemSubtitle</key>
        <string>Track your run with GPS</string>
        <key>UIApplicationShortcutItemIconType</key>
        <string>UIApplicationShortcutIconTypeShuffle</string>
    </dict>
    <dict>
        <key>UIApplicationShortcutItemType</key>
        <string>com.fortivus.start-workout</string>
        <key>UIApplicationShortcutItemTitle</key>
        <string>Start Workout</string>
        <key>UIApplicationShortcutItemSubtitle</key>
        <string>Log your strength training</string>
        <key>UIApplicationShortcutItemIconType</key>
        <string>UIApplicationShortcutIconTypeAdd</string>
    </dict>
    <dict>
        <key>UIApplicationShortcutItemType</key>
        <string>com.fortivus.daily-checkin</string>
        <key>UIApplicationShortcutItemTitle</key>
        <string>Daily Check-in</string>
        <key>UIApplicationShortcutItemSubtitle</key>
        <string>Log your mood & energy</string>
        <key>UIApplicationShortcutItemIconType</key>
        <string>UIApplicationShortcutIconTypeTask</string>
    </dict>
</array>
```

---

## HealthKit Capability

In Xcode:
1. Select your project in the navigator
2. Select the "App" target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "HealthKit"
6. Enable "Clinical Health Records" if needed

---

## Siri Shortcuts Setup

Add to `ios/App/App/AppDelegate.swift`:

```swift
import Intents

// In application(_:continue:restorationHandler:) method:
func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    if userActivity.activityType == "com.fortivus.start-run" {
        NotificationCenter.default.post(name: NSNotification.Name("OpenDeepLink"), object: nil, userInfo: ["path": "/running"])
        return true
    } else if userActivity.activityType == "com.fortivus.start-workout" {
        NotificationCenter.default.post(name: NSNotification.Name("OpenDeepLink"), object: nil, userInfo: ["path": "/workouts"])
        return true
    } else if userActivity.activityType == "com.fortivus.daily-checkin" {
        NotificationCenter.default.post(name: NSNotification.Name("OpenDeepLink"), object: nil, userInfo: ["path": "/daily-checkin"])
        return true
    }
    return false
}
```

---

## Apple In-App Purchase Setup

For iOS App Store compliance:

1. **Create Products in App Store Connect:**
   - Monthly: `com.fortivus.elite.monthly` ($29.99/month)
   - Yearly: `com.fortivus.elite.yearly` ($199/year)

2. **Configure Subscription Group:** Create "Fortivus Elite" group

3. **Implement StoreKit:** The app has hooks ready (`useAppleIAP`), native StoreKit implementation needed

4. **Server-Side Validation:** Set up receipt validation on backend

---

## Testing Checklist

- [ ] Long-press app icon shows Quick Actions
- [ ] Run tracker gets GPS location
- [ ] Haptic feedback triggers on PR/badge achievements  
- [ ] HealthKit permission prompt appears
- [ ] Camera permission prompt appears for progress photos
- [ ] IAP products load correctly
