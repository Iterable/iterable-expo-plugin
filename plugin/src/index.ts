import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import { ConfigPluginProps, type ConfigPluginPropsWithDefaults } from './withIterable.types';
import { withPushNotifications } from './withPushNotifications';
import { withStoreConfigValues } from './withStoreConfigValues';

const withIterable: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  // Set default values for props
  const propsWithDefaults: ConfigPluginPropsWithDefaults = {
    ...props,
    apiKey: props.apiKey || '',
    appEnvironment: props.appEnvironment || 'development',
    autoConfigurePushNotifications: props.autoConfigurePushNotifications || true,
    enableTimeSensitivePush: props.enableTimeSensitivePush || true,
    requestPermissionsForPushNotifications: props.requestPermissionsForPushNotifications || true,
  };

  return withPlugins(config, [
    [withStoreConfigValues, propsWithDefaults],
    [withPushNotifications, propsWithDefaults],
  ]);
};

export default withIterable;