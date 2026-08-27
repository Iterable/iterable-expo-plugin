# @iterable/expo-plugin Example

This is an example app demonstrating how to use `@iterable/expo-plugin` with
Expo.



<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=3 orderedList=false} -->

<!-- code_chunk_output -->

- [@iterable/expo-plugin Example](#iterableexpo-plugin-example)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [JWT authentication (optional)](#jwt-authentication-optional)
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
     (a non-JWT **mobile** key unless you follow [JWT authentication](#jwt-authentication-optional))
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

## JWT authentication (optional)

Email login with a non-JWT API key is the default. The example can also exercise
a JWT-enabled **mobile** API key using a **JavaScript demo signer** in
`example/src/jwt/`. This is demo-only.

**Never embed the Iterable JWT secret in a production app.** `EXPO_PUBLIC_*`
values are inlined into the JavaScript bundle. Production apps must return a
token from `authHandler` that was fetched from a backend that holds the secret.

To try the JWT path:

1. Create a JWT-enabled **mobile** API key:
   1. Sign into your Iterable account
   2. Go to [Integrations > API Keys](https://app.iterable.com/settings/apiKeys)
   3. Click **New API Key**
   4. Name: a descriptive name
   5. Type: **Mobile**
   6. JWT authentication: **checked**
   7. Create the key and copy both the API key and the JWT secret
2. In `.env.local`:
   - Set `EXPO_PUBLIC_ITERABLE_API_KEY` to that JWT-enabled mobile key
   - Uncomment and set `EXPO_PUBLIC_ITERABLE_JWT_ENABLED=true`
   - Uncomment and set `EXPO_PUBLIC_ITERABLE_JWT_SECRET` to the JWT secret
3. Rebuild / reload the example app

The demo `authHandler` is structured so you can replace the local signer with a
`fetch` to your backend. See the comment on `getDemoAuthToken` in
`example/src/jwt/demoAuth.ts`.

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

4. **iOS build fails on `fmt` / `FMT_STRING` / `library 'fmt' not found` (Xcode 26.4+)**
   - This is a known React Native + Xcode 26.4 compatibility issue
   - `@iterable/expo-plugin` injects a Podfile workaround automatically during prebuild
   - Rebuild native code: `npx expo prebuild --clean`, then `cd ios && pod install && cd ..`
   - If you still see the error, confirm your generated `ios/Podfile` contains the
     `@iterable/expo-plugin: fmt workaround for Xcode 26.4` comment inside `post_install`

### Development Tips

- Use `yarn start` to start the Metro bundler
- Use `yarn ios` or `yarn android` to build and run
- Use `npx expo prebuild --clean` to rebuild native code
- Use `cd ios && pod install && cd ..` to update iOS dependencies.  Usually not
  necessary, but may help if there is an issue after prebuild.