import { ConfigPlugin } from 'expo/config-plugins';

import { withApiKey } from './withApiKey';
import { ConfigPluginProps } from './withIterable.types';

const withIterable: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  if (props.apiKey) {
    config = withApiKey(config, props);
  }

  return config;
};

export default withIterable;
