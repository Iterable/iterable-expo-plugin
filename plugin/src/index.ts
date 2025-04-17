import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import {
  type ConfigPluginProps,
  type ConfigPluginPropsWithDefaults,
} from './withIterable.types';
import { withPushNotifications } from './withPushNotifications';
import { withStoreConfigValues } from './withStoreConfigValues';
import { withIterableApis } from './withIterableApis';
import { withDeepLinks } from './withDeepLinks';

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
      props.requestPermissionsForPushNotifications ?? false,
    enableInAppMessages: props.enableInAppMessages ?? true,
  };


  return withPlugins(config, [
    [withIterableApis, propsWithDefaults],
    [withStoreConfigValues, propsWithDefaults],
    [withPushNotifications, propsWithDefaults],
    [withDeepLinks, propsWithDefaults],
  ]);
};

export default withIterable;
