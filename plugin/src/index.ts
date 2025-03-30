import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import { ConfigPluginProps } from './withIterable.types';
import { withApiKey } from './withApiKey';
import { withPushNotifications } from './withPushNotifications';

const withIterable: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  return withPlugins(config, [
    [withApiKey, props],
    [withPushNotifications, props],
  ]);
};

export default withIterable;