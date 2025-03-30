import {
  ConfigPlugin,
  withEntitlementsPlist,
  withPlugins,
  withInfoPlist,
} from 'expo/config-plugins';

import { ConfigPluginProps } from '../withIterable.types';

/**
 * Adds anything that would be added by going to Xcode > Signing & Capabilities
 * and clicking "+ Capability"
 */
const withCapabilities: ConfigPlugin<ConfigPluginProps> = (config, props) => {
  return withEntitlementsPlist(config, (newConfig) => {
    /**
     * Add push notification capabilities to the app.
     * @see Step 3.5.1 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
     */
    const appEnvironment = props?.appEnvironment || 'development';
    newConfig.modResults['aps-environment'] = appEnvironment;
    return newConfig;
  });
}

const withBackgroundModes: ConfigPlugin<ConfigPluginProps> = (config, props) => {
  return withInfoPlist(config, (newConfig) => {
    const backgroundModes = newConfig.modResults['UIBackgroundModes'] || [];

    /**
     * Add remote-notification to the background modes if it's not already there
     * @see Step 3.5.2 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
     */
    if (!backgroundModes.includes('remote-notification')) {
      newConfig.modResults.UIBackgroundModes = [...backgroundModes, 'remote-notification'];
    }

    return newConfig;
  });
}

/**
 * Adds a fully configured push notification service to the app unless
 * `props.autoConfigurePushNotifications` is `false`.
 */
export const withIosPushNotifications: ConfigPlugin<ConfigPluginProps> = (config, props) => {
  /**
   * No need to do anything if `props.autoConfigurePushNotifications` is
   * explicitly set to `false`.
   */
  if (props.autoConfigurePushNotifications === false) {
    return config;
  }
  
  return withPlugins(config, [
    [withCapabilities, props],
    [withBackgroundModes, props],
  ]);
}

export default withIosPushNotifications;
    