import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import { type ConfigPluginPropsWithDefaults } from '../withIterable.types';
import { withAndroidPushNotifications } from './withAndroidPushNotifications';
import { withIosPushNotifications } from './withIosPushNotifications';

export const withPushNotifications: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  return withPlugins(config, [
    [withIosPushNotifications, props],
    [withAndroidPushNotifications, props],
  ]);
};

export default withPushNotifications;
