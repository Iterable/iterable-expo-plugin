import { ConfigPlugin, withPlugins } from 'expo/config-plugins';

import { withDeepLinks } from './withDeepLinks';
import { withIosDeploymentTargetLift } from './withIosDeploymentTargetLift';
import { withIosFmtWorkaround } from './withIosFmtWorkaround';
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

  // Pipeline order: withStoreConfigValues is listed first by convention.
  // Expo runs withPodfile mods in reverse order, so the generated Podfile has
  // the fmt block before the deployment target lift. The two are independent.
  return withPlugins(config, [
    [withStoreConfigValues, propsWithDefaults],
    [withPushNotifications, propsWithDefaults],
    [withDeepLinks, propsWithDefaults],
    withIosFmtWorkaround,
    withIosDeploymentTargetLift,
  ]);
};

export default withIterable;
