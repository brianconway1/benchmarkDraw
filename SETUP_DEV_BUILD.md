# Development Build Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Expo Dev Client
```bash
npm install expo-dev-client
```

### 3. Prebuild Native Projects
```bash
npx expo prebuild
```

This generates the `ios/` and `android/` folders with native code.

### 4. Run on iOS (Local Build)
```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..

# Build and run
npx expo run:ios
```

### 5. Run on Android
```bash
npx expo run:android
```

## Development Workflow

### Start Development Server
```bash
npm start
# Or with dev client
npx expo start --dev-client
```

### Run on iOS Simulator
```bash
npx expo run:ios
```

### Run on Android Emulator
```bash
npx expo run:android
```

## Benefits

✅ Full native module support (`react-native-view-shot` works)
✅ Full media library permissions
✅ Better performance
✅ Production-like environment
✅ All features work

## Troubleshooting

### Clean Build
```bash
# iOS
cd ios
rm -rf build
pod install
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

### Pod Install Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

## Next Steps

1. Run `npm install` to install expo-dev-client
2. Run `npx expo prebuild` to generate native projects
3. Run `npx expo run:ios` to build and run on iOS
4. Test all features including screenshots

