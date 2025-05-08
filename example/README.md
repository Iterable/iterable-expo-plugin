# @iterable/expo-plugin Example

This is an example app demonstrating how to use `@iterable/expo-plugin` with
Expo.



<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=3 orderedList=false} -->

<!-- code_chunk_output -->

- [@iterable/expo-plugin Example](#iterableexpo-plugin-example)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Running the App](#running-the-app)
    - [iOS](#ios)
    - [Android](#android)
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
4. Push Notifications (Optional)
    - Follow the instructions in the
      [README](https://github.com/Iterable/iterable-expo-plugin/blob/main/README.md#adding-push-capabilities)
      to add push notification capabilities to the example app.
5. Deep Links (Optional)
    - Follow the instructions in the
      [README](https://github.com/Iterable/iterable-expo-plugin/blob/main/README.md#deep-links-optional)
      to add deep link support to the example app.

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