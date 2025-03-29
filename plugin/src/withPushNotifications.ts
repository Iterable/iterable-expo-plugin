import {
  ConfigPlugin,
  withInfoPlist,
  withPodfile,
  withEntitlementsPlist,
} from 'expo/config-plugins';

import { ConfigPluginProps } from './withIterable.types';

export const withPushNotifications: ConfigPlugin<ConfigPluginProps> = (_config, props = {}) => {
  _config = withInfoPlist(_config, (config) => {
    const backgroundModes = config.modResults['UIBackgroundModes'] || [];

    // Add remote-notification to the background modes if it's not already there
    // See:
    // https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK,
    // step 3.5.2
    if (!backgroundModes.includes('remote-notification')) {
      config.modResults.UIBackgroundModes = [...backgroundModes, 'remote-notification'];
    }

    return config;
  });

  // Add the entitlement to allow time-sensitive notifications
  // See:
  // https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK,
  // step 3.5.3
  _config = withEntitlementsPlist(_config, (config) => {
    config.modResults = {
      ...config.modResults,
      'com.apple.developer.usernotifications.time-sensitive': true,
    };
    return config;
  });

  _config = withPodfile(_config, (config) => {
    config.modResults.contents =
      config.modResults.contents +
      `
target 'Rich Notification Extension' do
  pod 'Iterable-iOS-AppExtensions'
end
    `;
    return config;
  });


  return _config;
};

export default withPushNotifications;
