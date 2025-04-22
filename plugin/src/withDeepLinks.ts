import { withAndroidManifest, type ConfigPlugin } from 'expo/config-plugins';
import type { ConfigPluginPropsWithDefaults } from './withIterable.types';

export const withDeepLinks: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config) => {
  return withAndroidManifest(config, (newConfig) => {
    const application = newConfig.modResults.manifest?.application?.[0];
    const activity = application?.activity?.[0];

    if (activity) {
      /**
       * Set the launch mode to singleTask to prevent multiple deep links from
       * opening multliple copies of the same activity in the same app.
       *
       * @see Step 2:
       * https://support.iterable.com/hc/en-us/articles/360046134911-Deep-Links-and-Custom-Actions-with-Iterable-s-React-Native-SDK#step-2-update-native-code-for-android
       */
      activity.$['android:launchMode'] = 'singleTask';
    }

    return newConfig;
  });
};

export default withDeepLinks;
