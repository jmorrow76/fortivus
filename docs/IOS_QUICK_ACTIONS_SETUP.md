# iOS Quick Actions & Siri Shortcuts Setup

## Quick Actions (3D Touch / Long Press)

After syncing the project with `npx cap sync ios`, add the following to your `ios/App/App/Info.plist` file, inside the main `<dict>` tag:

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

## Siri Shortcuts Setup

To enable Siri Shortcuts, add to your `ios/App/App/AppDelegate.swift`:

```swift
import Intents

// In application(_:continue:restorationHandler:) method:
func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    if userActivity.activityType == "com.fortivus.start-run" {
        // Navigate to running page
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

## Lock Screen Widget (iOS 16+)

Lock Screen Widgets require creating a Widget Extension in Xcode:

1. Open your project in Xcode
2. File → New → Target → Widget Extension
3. Name it "FortivusWidgets"
4. Create the widget UI with buttons for Run/Workout/Check-in

This requires native Swift/SwiftUI development beyond what can be configured in Capacitor.

## Testing Quick Actions

1. Build and run the app on a device/simulator
2. Long-press the app icon on the home screen
3. You should see "Start Run", "Start Workout", and "Daily Check-in" options
