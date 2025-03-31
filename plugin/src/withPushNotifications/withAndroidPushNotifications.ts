import { ConfigPlugin } from 'expo/config-plugins';

import { ConfigPluginPropsWithDefaults } from '../withIterable.types';

export const withAndroidPushNotifications: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  return config;
};

export default withAndroidPushNotifications;
