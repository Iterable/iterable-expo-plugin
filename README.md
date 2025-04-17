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

## Troubleshooting

### Example App

#### Failed to delete [ios|android] code: ENOTEMPTY: directory not empty

Sometimes this error appears when running `npx expo prebuild --clean`.  It seems
to be an intermittent bug within expo.  It usually works upon running the same
command a second time, so just try again.
