# Stallion OTA Updates Setup

This project uses [Stallion](https://stalliontech.io) for over-the-air (OTA) updates, allowing you to push code changes to users without going through app stores.

## Features

- ✅ Runtime code updates without app store approval
- ✅ Patch updates (98% smaller than full bundles)
- ✅ Automatic rollbacks on crashes
- ✅ Phased rollouts
- ✅ Real-time analytics

## Setup Instructions

### 1. Get Your Stallion API Key

1. Sign up at [https://stalliontech.io](https://stalliontech.io)
2. Create a new app in the dashboard
3. Copy your API key

### 2. Configure API Key

Set your Stallion API key as an environment variable:

```bash
export STALLION_API_KEY="your-api-key-here"
```

Or add it to your `.env` file (make sure `.env` is in `.gitignore`):

```
STALLION_API_KEY=your-api-key-here
```

### 3. iOS Setup

The iOS configuration is already set up in `ios/zero/AppDelegate.swift`. After making changes, run:

```bash
cd ios && pod install && cd ..
```

### 4. Android Setup

The Android configuration is already set up in `android/app/src/main/java/com/anotherwhy/pietwice/MainApplication.kt`.

## Usage

### Building for Production

Before releasing an OTA update, you need to build a production bundle:

**iOS:**
```bash
npm run ios -- --configuration Release
```

**Android:**
```bash
npm run android -- --mode release
```

### Releasing an Update

1. Make your code changes
2. Build the JavaScript bundle:
   ```bash
   npm run stallion:build
   ```

3. Release the update:
   ```bash
   npm run stallion:release
   ```

### Checking for Updates

The app automatically checks for updates on launch (in production builds only). You can also manually check:

```typescript
import useStallionUpdate from './src/hooks/useStallionUpdate';

const {checkForUpdates, isUpdateAvailable} = useStallionUpdate();
```

## Configuration

Edit `stallion.config.js` to customize:

- Update check frequency
- Installation mode (immediate, on restart, etc.)
- Rollback settings
- Platform-specific settings

## How It Works

1. **Development Mode**: Updates are disabled, app uses Metro bundler
2. **Production Mode**: 
   - App checks for updates on launch
   - Downloads updates in the background
   - Installs updates automatically (based on configuration)
   - Falls back to bundled code if update fails

## Update Flow

```
App Launch → Check for Updates → Download (if available) → Install → Restart
```

## Troubleshooting

### Updates Not Working

1. Verify your API key is set correctly
2. Ensure you're testing on a production build (not debug)
3. Check logs using the logger utility
4. Verify network connectivity

### iOS Build Issues

If `pod install` fails:
```bash
export LANG=en_US.UTF-8
cd ios && pod install && cd ..
```

### Android Build Issues

Ensure your `build.gradle` has the correct package name matching `stallion.config.js`.

## Best Practices

1. **Test Updates Thoroughly**: Always test updates in staging before production
2. **Use Phased Rollouts**: Start with a small percentage of users
3. **Monitor Analytics**: Watch for crashes or issues after updates
4. **Version Your Updates**: Keep track of which version users are on
5. **Rollback Plan**: Have a plan to quickly rollback if issues occur

## Resources

- [Stallion Documentation](https://learn.stalliontech.io/docs/introduction)
- [Stallion Dashboard](https://stalliontech.io)
- [Migration from CodePush](https://learn.stalliontech.io/blogs/react-native-ota-migration-codepush-appcenter-stallion)

## Notes

- Updates only work in production builds
- Native code changes still require app store updates
- JavaScript/TypeScript changes can be updated OTA
- Database migrations should be handled carefully
