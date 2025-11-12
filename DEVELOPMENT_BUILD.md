# Development Build Setup Guide

## Why Development Build?

A development build is recommended for this app because:

1. **Native Modules**: `react-native-view-shot` requires custom native code that Expo Go doesn't support
2. **Full Permissions**: Media library and file system need full native permissions
3. **Better Performance**: Native modules work at full speed
4. **Production-like**: Closer to the final app experience
5. **All Features**: Test all features including screenshots and exports

## Prerequisites

1. **Xcode** (for iOS) - Install from App Store
2. **Android Studio** (for Android) - Optional, for Android development
3. **EAS CLI** - Expo Application Services CLI
   ```bash
   npm install -g eas-cli
   ```

## Setup Steps

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS Build
```bash
eas build:configure
```

This creates `eas.json` with build configuration.

### 4. Create Development Build for iOS

#### Option A: Local Build (Faster, requires Xcode)
```bash
# Install pods
cd ios
pod install
cd ..

# Build and run
npx expo run:ios
```

#### Option B: Cloud Build (EAS Build)
```bash
eas build --profile development --platform ios
```

### 5. Install on Device/Simulator

#### For iOS Simulator:
```bash
npx expo run:ios
```

#### For Physical iPhone:
1. Build the development client
2. Install via TestFlight or direct installation
3. Scan QR code from `expo start --dev-client`

## Development Workflow

### Start Development Server
```bash
npm start
# Or with dev client
npx expo start --dev-client
```

### Run on iOS
```bash
npx expo run:ios
```

### Run on Android
```bash
npx expo run:android
```

## Benefits Over Expo Go

✅ Full native module support
✅ Custom native code
✅ Full file system access
✅ Media library permissions
✅ Better performance
✅ Production-like environment
✅ All features work

## Troubleshooting

### Pod Install Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Clean Build
```bash
# iOS
cd ios
rm -rf build
cd ..
npx expo run:ios --clean

# Android
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Reset Metro Cache
```bash
npx expo start --clear
```

## Next Steps

1. Set up development build
2. Test all features
3. Optimize performance
4. Prepare for production build

For more information, see:
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

