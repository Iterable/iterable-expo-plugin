import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import { withApiKey } from './withApiKey';
import { ConfigPluginProps } from './withIterable.types';

const withIterable: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  return withPlugins(config, [
    [withApiKey, props],
  ]);
};

export default withIterable;