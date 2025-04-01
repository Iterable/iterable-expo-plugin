import { ConfigPlugin } from 'expo/config-plugins';

const withIterable: ConfigPlugin = (config) => {
  console.log('withIterable plugin', config);
  return config;
};

export default withIterable;
