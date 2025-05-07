# @iterable/expo-plugin Example

This is an example app demonstrating how to use `@iterable/expo-plugin` with
Expo.



<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=3 orderedList=false} -->

<!-- code_chunk_output -->

- [@iterable/expo-plugin Example](#iterableexpo-plugin-example)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
    - [Push Notifications (Optional)](#push-notifications-optional)
    - [Deep Links (Optional)](#deep-links-optional)
  - [Running the App](#running-the-app)
    - [iOS](#ios-2)
    - [Android](#android-2)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Development Tips](#development-tips)

<!-- /code_chunk_output -->



## Prerequisites

- Node.js version specified in `.nvmrc`
- Xcode 15 or newer (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

## Setup

1. Install dependencies in the *root* directory:
    ```bash
    # If starting in the example folder 
    cd ..
    yarn install
    ```
2. Install dependencies in the *example* directory:
    ```bash
    cd example
    yarn install
    ```
3. Configure your Iterable API key:
   - Create a file called `.env.local` in the *example* directory
   - Copy the contents of `.env` to the new `.env.local`
   - Replace `YOUR_ITERABLE_API_KEY` with your actual Iterable API key
   - If desired, uncomment `EXPO_PUBLIC_ITERABLE_EMAIL=YOUR_ITERABLE_EMAIL` and
     replace `YOUR_ITERABLE_EMAIL` with your actual Iterable email

### Push Notifications (Optional)

#### Android
- [Configure push notifications for Android in Iterable](https://support.iterable.com/hc/en-us/articles/115000331943-Setting-up-Android-Push-Notifications)
- Place your `google-services.json` file in the root of the *example*
  directory
- In `app.json`, add the path to the `google-services.json` file to
  `expo.android.googleServicesFile`.  EG:
  ```json
  {
    "expo": {
      "android": {
        "googleServicesFile": "./google-services.json"
      }
    }
  }
  ```
#### iOS 
- [Configure push notifications for iOS in Iterable](https://support.iterable.com/hc/en-us/articles/115000315806-Setting-up-iOS-Push-Notifications)

### Deep Links (Optional)

#### Prerequisites
- [Configure deep links for Iterable](https://support.iterable.com/hc/en-us/articles/115002651226-Configuring-Deep-Links-for-Email-or-SMS)

#### Android

Add [`intentFilters`](https://docs.expo.dev/linking/android-app-links/)
specifying your link scheme to `app.json`.  EG:

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        // ... other intent filters
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
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

#### iOS 
- Set [`associatedDomains`](https://docs.expo.dev/linking/ios-universal-links/) in `app.json`.  EG:
```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:links.example.com"]
    }
  }
}
```

## Running the App

### iOS

```bash
# Clean and rebuild
npx expo prebuild --clean

# Run the app
npx expo run:ios
```

### Android

```bash
# Clean and rebuild
npx expo prebuild --clean

# Run the app
npx expo run:android
```

## Troubleshooting

### Common Issues

1. **"No such module 'ExpoModulesCore'"**
   ```bash
   cd ios && pod install && cd ..
   ```

2. **"Failed to delete [ios|android] code: ENOTEMPTY"**
   - Run `npx expo prebuild --clean` again

3. **Push notifications not working**
   - Verify your API key in `app.json`
   - Check that `google-services.json` is properly placed (Android)
   - Verify certificates and provisioning profiles (iOS)

### Development Tips

- Use `yarn start` to start the Metro bundler
- Use `yarn ios` or `yarn android` to build and run
- Use `npx expo prebuild --clean` to rebuild native code
- Use `cd ios && pod install && cd ..` to update iOS dependencies.  Usually not
  necessary, but may help if there is an issue after prebuild.