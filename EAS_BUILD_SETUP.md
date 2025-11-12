# EAS Development Build Setup (Cloud Build)

This guide covers setting up an **EAS Development Build** (internal cloud build) for Benchmark Draw.

## Why EAS Development Build?

- ✅ **No local setup needed** - No Xcode/Android Studio required for building
- ✅ **Cloud-based builds** - EAS builds your app in the cloud
- ✅ **Native modules work** - Full support for `react-native-view-shot` and other native modules
- ✅ **Easy distribution** - Install on devices/simulators via download link
- ✅ **Production-ready workflow** - Same process as production builds

## Prerequisites

1. **Expo account** (free) - Sign up at https://expo.dev
2. **EAS CLI installed** - Already installed
3. **Expo dev client** - Already in dependencies

## Setup Steps

### 1. Login to Expo
```bash
eas login
```

### 2. Configure EAS Build
The `eas.json` file is already configured with a development profile.

### 3. Build Development Client for iOS Simulator
```bash
eas build --profile development --platform ios
```

This will:
- Build your app in the cloud
- Create a development client with all native modules
- Provide a download link for iOS Simulator

### 4. Build for Physical iOS Device
```bash
eas build --profile development --platform ios --profile development.ios.simulator=false
```

### 5. Build for Android
```bash
eas build --profile development --platform android
```

### 6. Install the Build

#### iOS Simulator:
1. Download the `.tar.gz` file from the build page
2. Extract it
3. Run: `xcrun simctl install booted <path-to-app>`
4. Or use the install link from EAS Build dashboard

#### Physical Device:
1. Download the `.ipa` file
2. Install via TestFlight (if configured) or direct install
3. Or use the install link from EAS Build dashboard

### 7. Start Development Server
```bash
npx expo start --dev-client
```

### 8. Connect to Development Server
- Open the installed development build on your device/simulator
- Scan the QR code or enter the URL manually
- Your app will load from the development server

## Development Workflow

### Daily Development
1. Start dev server: `npx expo start --dev-client`
2. Make code changes
3. Reload in the development client (shake device or Cmd+R)
4. Changes appear instantly (Fast Refresh)

### When Adding New Native Modules
1. Add the dependency: `npm install <package>`
2. Rebuild the development client:
   ```bash
   eas build --profile development --platform ios
   ```
3. Install the new build
4. Continue development

## Build Profiles

### Development (for development)
- Includes development client
- Internal distribution
- iOS Simulator support
- Debug symbols

### Preview (for testing)
- Internal distribution
- No development client
- Production-like build

### Production (for App Store)
- App Store distribution
- Production optimizations
- Release build

## Troubleshooting

### Build Fails
- Check build logs in EAS dashboard
- Verify all dependencies are compatible
- Check app.json configuration

### Development Client Won't Connect
- Ensure dev server is running: `npx expo start --dev-client`
- Check network connectivity
- Verify QR code is scanned correctly

### Native Module Not Working
- Rebuild development client after adding native modules
- Clear Metro cache: `npx expo start --clear`
- Check if module is compatible with Expo

## Next Steps

1. Run `eas login` to authenticate
2. Run `eas build --profile development --platform ios` to create your first build
3. Install the build on your device/simulator
4. Start developing with `npx expo start --dev-client`

## Benefits Over Local Build

✅ No Xcode/Android Studio setup needed
✅ No local compilation errors
✅ Builds run on powerful cloud servers
✅ Easy to share builds with team
✅ Same build process as production
✅ Automatic dependency resolution

## Cost

- **Free tier**: Limited builds per month
- **Paid tier**: More builds, faster builds, priority support
- Development builds are typically free or very low cost

For more information, see:
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Development Builds Guide](https://docs.expo.dev/develop/development-builds/introduction/)

