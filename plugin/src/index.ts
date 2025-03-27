import { ConfigPlugin } from '@expo/config-plugins';

const withIterable: ConfigPlugin<{ name?: string }> = (config, { name = 'my-app' } = {}) => {
  console.log('withIterable', config);
  return config;
};

export default withIterable;
