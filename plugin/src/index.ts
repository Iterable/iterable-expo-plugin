import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import { withDeepLinks } from './withDeepLinks';
import {
  type ConfigPluginProps,
  type ConfigPluginPropsWithDefaults,
} from './withIterable.types';
import { withPushNotifications } from './withPushNotifications';
import { withStoreConfigValues } from './withStoreConfigValues';

const withIterable: ConfigPlugin<ConfigPluginProps> = (config, props = {}) => {
  // Set default values for props
  const propsWithDefaults: ConfigPluginPropsWithDefaults = {
    ...props,
    appEnvironment: props.appEnvironment ?? 'development',
    autoConfigurePushNotifications:
      props.autoConfigurePushNotifications ?? true,
    enableTimeSensitivePush: props.enableTimeSensitivePush ?? true,
    requestPermissionsForPushNotifications:
      props.requestPermissionsForPushNotifications ?? false,
  };

  return withPlugins(config, [
    [withStoreConfigValues, propsWithDefaults],
    [withPushNotifications, propsWithDefaults],
    [withDeepLinks, propsWithDefaults],
  ]);
};

export default withIterable;
