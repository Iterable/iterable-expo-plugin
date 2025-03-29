import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import { withApiKey } from './withApiKey';
import { withPushNotifications } from './withPushNotifications';
import { ConfigPluginProps } from './withIterable.types';

const withIterable: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  return withPlugins(config, [
    [withApiKey, props],
    [withPushNotifications, props],
  ]);
};

export default withIterable;
