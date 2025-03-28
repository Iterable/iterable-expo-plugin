import { ConfigPlugin } from 'expo/config-plugins';

import { withApiKey } from './withApiKey';
import { ConfigPluginProps } from './withIterable.types';

const withIterable: ConfigPlugin<ConfigPluginProps> = (config, { apiKey }) => {
  config = withApiKey(config, { apiKey });

  return config;
};

export default withIterable;
