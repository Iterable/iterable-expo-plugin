import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import {
  type ConfigPluginProps,
  type ConfigPluginPropsWithDefaults,
} from './withIterable.types';
import { withPushNotifications } from './withPushNotifications';
import { withStoreConfigValues } from './withStoreConfigValues';
import { withIterableApis } from './withIterableApis';

const withIterable: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  // Set default values for props
  const propsWithDefaults: ConfigPluginPropsWithDefaults = {
    ...props,
    apiKey: props.apiKey ?? '',
    appEnvironment: props.appEnvironment ?? 'development',
    autoConfigurePushNotifications:
      props.autoConfigurePushNotifications ?? true,
    enableTimeSensitivePush: props.enableTimeSensitivePush ?? true,
    requestPermissionsForPushNotifications:
      props.requestPermissionsForPushNotifications ?? true,
    enableInAppMessages: props.enableInAppMessages ?? true,
  };


  return withPlugins(config, [
    [withIterableApis, propsWithDefaults],
    [withStoreConfigValues, propsWithDefaults],
    [withPushNotifications, propsWithDefaults],
  ]);
};

export default withIterable;
