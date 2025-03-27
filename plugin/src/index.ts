import { ConfigPlugin } from 'expo/config-plugins';

const withIterable: ConfigPlugin = (config) => {
  console.log('my custom plugin');
  return config;
};

export default withIterable;
