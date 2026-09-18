# Build Instructions for Event Countdown App

This guide explains how to build the Event Countdown App for production and create installable files for Android and iOS devices.

## Prerequisites

Before building, ensure you have:
- Node.js installed (v18 or higher recommended)
- Expo CLI installed: `npm install -g expo-cli`
- For Android: Android Studio with SDK installed
- For iOS: macOS with Xcode (required for iOS builds)
- Expo account (free) for EAS builds

## Method 1: EAS Build (Recommended)

EAS (Expo Application Services) is the modern way to build Expo apps.

### Setup EAS

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure your project for EAS:
```bash
eas build:configure
```

### Build for Android (APK)

To create an APK file that can be installed directly on Android devices:

```bash
eas build --platform android --profile preview
```

This will create an APK file that you can download and install on any Android device.

### Build for iOS (IPA)

To create an IPA file for iOS devices (requires Apple Developer account):

```bash
eas build --platform ios --profile preview
```

Note: iOS builds require:
- Apple Developer account ($99/year)
- Proper certificates and provisioning profiles
- macOS with Xcode for local builds

## Method 2: Classic Expo Build (Legacy)

### Build Android APK

```bash
expo build:android
```

Follow the prompts:
- Choose "APK" for direct installation
- Wait for the build process (can take 10-30 minutes)
- Download the APK when complete

### Build iOS IPA

```bash
expo build:ios
```

Note: This requires:
- Apple Developer account
- Expo to handle the build process on their servers
- More setup than Android

## Local Installation

### Installing Android APK

1. Download the APK file from the build process
2. Enable "Install from Unknown Sources" on your Android device:
   - Go to Settings > Security > Unknown Sources
   - Enable the option
3. Transfer the APK to your device (USB, email, cloud storage)
4. Tap the APK file to install
5. If prompted, allow installation from unknown sources

### Installing iOS IPA

For iOS, installation is more restricted:

**Option 1: TestFlight (Recommended)**
1. Build for TestFlight using EAS
2. Upload to App Store Connect
3. Add testers (up to 10,000 for free)
4. Testers install via TestFlight app

**Option 2: Sideloading (Limited)**
- Requires developer account
- Limited to 100 devices per year
- More complex setup process

## Development Build

For local development builds that are faster to iterate:

### Android Development Build

```bash
eas build --platform android --profile development
```

Then run:
```bash
eas run --platform android
```

### iOS Development Build

```bash
eas build --platform ios --profile development
```

Then run:
```bash
eas run --platform ios
```

## Configuration Files

### app.json / app.config.js

Ensure your app configuration is set up correctly:

```json
{
  "expo": {
    "name": "Event Countdown App",
    "slug": "event-countdown-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "android": {
      "package": "com.eventcountdown.app",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.eventcountdown.app",
      "buildNumber": "1"
    }
  }
}
```

### EAS Configuration (eas.json)

Create or update `eas.json` in your project root:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

## Troubleshooting

### Common Android Issues

**"Build failed" errors:**
- Check that your dependencies are up to date: `npm install`
- Clear cache: `expo start --clear`
- Ensure Java JDK is properly installed

**APK won't install:**
- Enable installation from unknown sources in device settings
- Check Android version compatibility
- Verify APK signature

### Common iOS Issues

**"Missing provisioning profile":**
- Ensure you have valid Apple Developer account
- Check provisioning profiles in Apple Developer portal
- Use EAS build which handles this automatically

**Build takes too long:**
- iOS builds typically take 20-40 minutes
- Use development builds for faster iteration
- Consider using TestFlight for beta testing

## Store Submission

### Google Play Store

1. Build AAB (Android App Bundle):
```bash
eas build --platform android --profile production
```

2. Create Google Play Console account ($25 one-time fee)
3. Upload AAB to Play Console
4. Complete store listing and screenshots
5. Submit for review

### Apple App Store

1. Build IPA using EAS with production profile
2. Upload to App Store Connect
3. Complete app information and screenshots
4. Submit for review (typically 1-3 days)

## Alternative: Expo Go

For quick testing without building:
1. Install Expo Go app on your device
2. Run `expo start` in your project
3. Scan QR code with Expo Go
4. App will load in development mode

Note: This is for development only, not production distribution.

## Production Checklist

Before releasing to production:

- [ ] Update app version in app.json
- [ ] Test on multiple devices/screen sizes
- [ ] Remove console.log statements
- [ ] Optimize images and assets
- [ ] Test all user flows
- [ ] Ensure proper error handling
- [ ] Check performance and memory usage
- [ ] Verify data persistence works correctly
- [ ] Test offline functionality
- [ ] Prepare app store screenshots and descriptions

## Support and Resources

- Expo Documentation: https://docs.expo.dev/
- EAS Build Documentation: https://docs.expo.dev/build/introduction/
- React Native Documentation: https://reactnative.dev/
- Expo Forums: https://forums.expo.dev/

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
expo start

# Build Android APK (EAS)
eas build --platform android --profile preview

# Build iOS IPA (EAS)
eas build --platform ios --profile preview

# Build for production stores
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Cost Considerations

- **EAS Build**: Free tier includes limited builds per month
- **Apple Developer**: $99/year for iOS distribution
- **Google Play**: $25 one-time fee for Android
- **Hosting**: Not needed for standalone apps
- **Maintenance**: Consider future updates and bug fixes