![@iterable/expo-plugin](./assets/Iterable-Logo.png "@iterable/expo-plugin")
# @iterable/expo-plugin

This config plugin automatically configures your Expo app to work with
[@iterable/react-native-sdk](https://github.com/Iterable/react-native-sdk) when
the native code is generated through `expo prebuild`.


<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=3 orderedList=false} -->

<!-- code_chunk_output -->

- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Plugin Options](#plugin-options)
  - [Disabling New Architecture](#disabling-new-architecture)
  - [Adding push capabilities to android](#adding-push-capabilities-to-android)
  - [Adding Deeplinks](#adding-deeplinks)
  - [Configuring ProGuard](#configuring-proguardhttpsreactnativedevdocssigned-apk-androidenabling-proguard-to-reduce-the-size-of-the-apk-optional)
- [Requirements and Limitations](#requirements-and-limitations)
- [Features](#features)
  - [Push Notifications](#push-notifications)
  - [Deep Links](#deep-links)
- [Troubleshooting](#troubleshooting)
  - [Native Module Not Found](#native-module-not-found)
  - [Failed to delete [ios|android] code: ENOTEMPTY: directory not empty](#failed-to-delete-iosandroid-code-enotempty-directory-not-empty)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Further Reading](#further-reading)

<!-- /code_chunk_output -->


## Quick Start

1. Install the plugin and `@iterable/react-native-sdk` by running the following in your terminal:
    ```bash
    npx expo install @iterable/expo-plugin @iterable/react-native-sdk
    ```
2. Add the plugin to to your `app.json` or `app.config.js`
    ```json
    {
      "expo": {
        "plugins": [
          ["@iterable/expo-plugin", {}]
        ]
      }
    }
    ```
3. After installing and configuring the plugin, rebuild your native projects:
    ```bash
      npx expo prebuild --clean
    ```
    **WARNING**: `prebuild` will delete everything in your ios/android directories.
4. Run your ios or android simulator:
    - ios:
      ```bash
        npx expo run:ios
      ```
    - android:
      ```bash
        npx expo run:android
      ```
5. Import `@iterable/react-native-sdk` and use as needed.  EG:
    ```tsx
    import {useEffect} from 'react';
    import {Iterable, IterableConfig} from '@iterable/react-native-sdk';

    const App = () => {
      useEffect(() => {
        Iterable.initialize('MY_API_KEY', new IterableConfig());
      }, []);
    }
    ```

## Configuration

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      ["@iterable/expo-plugin", {
        "apiKey": "YOUR_ITERABLE_API_KEY",
        "appEnvironment": "development",
        "autoConfigurePushNotifications": true,
        "enableTimeSensitivePush": true,
        "requestPermissionsForPushNotifications": true,
      }]
    ]
  }
}
```

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | `''` | Your Iterable project API key |
| `appEnvironment` | `'development'` \| `'production'` | `'development'` | The environment of your app |
| `autoConfigurePushNotifications` | boolean | `true` | Whether to automatically configure push notifications. Set to `false` if you want to configure push notifications manually.  <br><br> **WARNING**: Iterable cannot guarantee compatibility with custom push notification configurations. |
| `enableTimeSensitivePush` | boolean | `true` | Whether to enable time-sensitive push notifications (iOS only) |
| `requestPermissionsForPushNotifications` | boolean | `false` | Whether to request permissions for push notifications (iOS only) |

### Disabling New Architecture
`@iterable/react-native-sdk` is *NOT* compatible with Reacts New Architecture,
so this needs to be disabled in your `app.json`:

```json
{
  "expo": {
    "newArchEnabled": false
  }
}
```

### Adding push capabilities to android

Add the path to your google-services.json file to the app.json file under
`expo.android.googleServicesFile`.  EG: If the google services file was added to
the root of the app, the expo file would look like this:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### Adding Deeplinks 

Deep linking allows users to navigate to specific screens in your app using
URLs.

To set up deep linking in your **Expo** application, [configure deep links in Iterable](https://support.iterable.com/hc/en-us/articles/115002651226-Configuring-Deep-Links-for-Email-or-SMS),
then follow the below instructions. 

#### iOS
To add deeplinks to your Expo app for use with Iterable on iOS devices, add associated domains
to your `app.json` under the iOS configuration.

EG: 
```json
{
  "expo": {
    "ios": {
      "associatedDomains": [
          "applinks:expo.dev",
          "applinks:iterable.com",
          "applinks:links.anotherone.com"
       ]
    }
  }
}
```

This is the equivalent of adding them through **Signing & Capabilities** in
Xcode, as described in step 5 of [Iterables iOS Univeral Links
Documentation](https://support.iterable.com/hc/en-us/articles/360035496511-iOS-Universal-Links)

See further documentation about how expo setup of iOS Universal Links
[here](https://docs.expo.dev/linking/ios-universal-links/).

#### Android
To add deeplinks to your Expo app for use with Iterable on Android devices, add
URL schemes and intent filters to your `app.json` under the Android
configuration.  These would be in `expo.android.intentFilters`.

EG:
```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "MAIN",
          "category": ["LAUNCHER"],
          "autoVerify": true,
        },
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "links.example.com",
              // Deep links coming from Iterable are prefixed by "/a/", so include this as the "pathPrefix".
              "pathPrefix": "/a/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

See further documentation about how expo setup of Android App Links
[here](https://docs.expo.dev/linking/android-app-links/).

### Configuring [ProGuard](https://reactnative.dev/docs/signed-apk-android#enabling-proguard-to-reduce-the-size-of-the-apk-optional)
If you're using ProGuard when building your Android app, you will need to add
this line of ProGuard configuration to your build: `-keep class org.json.** { *;
}`.

Below is how to do this using Expo:
1. Add the
   [expo-build-properties](https://www.npmjs.com/package/expo-build-properties)
   plugin by running: 
    ```bash
    npx expo install expo-build-properties
    ```
2. Add the plugin to your *app.json* file
3. To the plugin options, add `{"android":{"extraProguardRules":"-keep class org.json.** { *; }"}}`

The overall code in your *app.json* file should look something like this:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "extraProguardRules": "-keep class org.json.** { *; }"
          }
        }
      ]
    ]
  }
}
```

Learn more in the [Configure Proguard](https://support.iterable.com/hc/en-us/articles/360035019712-Iterable-s-Android-SDK#step-4-configure-proguard) section of Iterables Android SDK setup docs.

## Requirements and Limitations

- New Architecture needs to be disabled, as `@iterable/react-native-sdk` does
  not support it.  See [Disabling New Architecture](#disabling-new-architecture)
  for instructions on how to disable it.
- Your expo app needs to be run as a [development
  build](https://docs.expo.dev/develop/development-builds/introduction/) instead
  of through Expo Go.  Both
  `@iterable/iterable-expo-plugin` and `@iterable/react-native-sdk` will **NOT** work in Expo Go
  as they are reliant on native code, which Expo Go [does not
  support](https://expo.dev/blog/expo-go-vs-development-builds#expo-go-limitations).
- `@iterable/iterable-expo-plugin` is intended for managed workflows, and will
  overwrite the files in your `ios` and `android` directories.  Any manual
  changes to those directories will be overwritten on the next build. 
- This plugin has been tested on Expo version 52+.  While it may work on
  previous versions, they are not supported.

## Features

### Push Notifications

The plugin automatically configures push notifications for both iOS and Android platforms.

#### iOS
- Adds bridge to native Iterable code
- Sets up notification service extension
- Configures required entitlements
- Handles notification permissions

#### Android
- Adds bridge to native Iterable code
- Configures Firebase integration
- Sets up notification handling
- Manages notification permissions

### Deep Links

The plugin configures deep linking capabilities for both platforms.

#### iOS
- Sets up Universal Links
- Configures associated domains

#### Android
- Configures App Links
- Sets up intent filters

## Troubleshooting

### Native Module Not Found

If you encounter the error "Your JavaScript code tried to access a native module that doesn't exist in this development client", try:

1. Clean your project:
```bash
rm -rf node_modules
rm -rf ios/Pods
yarn cache clean
```

2. Reinstall dependencies:
```bash
yarn install
```

3. Rebuild native projects:
```bash
npx expo prebuild --clean
cd ios && pod install && cd ..
```

### Failed to delete [ios|android] code: ENOTEMPTY: directory not empty

Sometimes this error appears when running `npx expo prebuild --clean`.  It seems
to be an intermittent bug within expo.  It usually works upon running the same
command a second time, so just try again.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Support

For support, please:
1. Check the [documentation](https://github.com/Iterable/iterable-expo-plugin#readme)
2. Open an [issue](https://github.com/Iterable/iterable-expo-plugin/issues)
3. Contact [Iterable support](https://support.iterable.com/hc/en-us/requests/new)

## Further Reading
- [Installing Iterables React Native
  SDK](https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-7-add-support-for-deep-links)
- [Expo docs](https://docs.expo.dev/)