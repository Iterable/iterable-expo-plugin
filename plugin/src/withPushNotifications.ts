import { ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

import { ConfigPluginProps } from './withIterable.types';

export const withPushNotifications: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  return withInfoPlist(config, (config) => {
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
};

export default withPushNotifications;
