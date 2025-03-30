import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import { ConfigPluginProps } from '../withIterable.types';
import { withIosPushNotifications } from './withIosPushNotifications';

export const withPushNotifications: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  return withPlugins(config, [
    [withIosPushNotifications, props],
  ]);
};

export default withPushNotifications;