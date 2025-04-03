# @iterable/expo-plugin 

## Instructions

### Adding push capabilities to android

Add the path to your google-services.json file to the app file under
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

This will set up 

See further documentation about how expo setup of Android App Links
[here](https://docs.expo.dev/linking/android-app-links/).


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
