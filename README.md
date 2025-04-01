# @iterable/expo-plugin 

## Instructions

### Adding Deeplinks 

#### iOS
To add deeplinks to your Expo app for use with Iterable, add associated domains
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

### Configuring [Proguard](https://reactnative.dev/docs/signed-apk-android#enabling-proguard-to-reduce-the-size-of-the-apk-optional)

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
3. To the plugin options, add `{android:{extraProguardRules:"-keep class
   org.json.** { *; }"}}

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

## Troubleshooting

### Example App

#### Failed to delete [ios|android] code: ENOTEMPTY: directory not empty

Sometimes this error appears when running `npx expo prebuild --clean`.  It seems
to be an intermittent bug within expo.  It usually works upon running the same
command a second time, so just try again.
