import {
  ConfigPlugin,
  withEntitlementsPlist,
  withPlugins,
  withInfoPlist,
  withDangerousMod,
} from 'expo/config-plugins';

import { ConfigPluginPropsWithDefaults } from '../withIterable.types';
import { NS_TARGET_NAME, NS_PLIST_FILE_NAME, NS_ENTITLEMENTS_FILE_NAME, NS_MAIN_FILE_NAME, NS_FILES, NS_MAIN_FILE_CONTENT, NS_PLIST_CONTENT, NS_ENTITLEMENTS_CONTENT } from './withIosPushNotifications.constants';

const fs = require('fs');
const path = require('path');

/**
 * Adds anything that would be added by going to Xcode > Signing & Capabilities
 * and clicking "+ Capability"
 */
const withCapabilities: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config, props) => {
  return withEntitlementsPlist(config, (newConfig) => {
    /**
     * Add push notification capabilities to the app.
     * @see Step 3.5.1 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
     */
    newConfig.modResults['aps-environment'] = props?.appEnvironment;

    /**
     * Add the entitlement to allow time-sensitive notifications if
     * `props.enableTimeSensitivePush` not explicitly set to `false`.
     * @see Step 3.5.3 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
     */
    if (props.enableTimeSensitivePush !== false) {
      newConfig.modResults['com.apple.developer.usernotifications.time-sensitive'] = true;
    }

    return newConfig;
  });
}

/**
 * Adds any needed background modes to the app.
 */
const withBackgroundModes: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config, props) => {
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
 * Adds the notification service files to the app.
 */
const withNSFiles: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config) => {
  return withDangerousMod(config, [
    'ios',
    (newConfig) => {
      const { projectRoot, platformProjectRoot } = newConfig.modRequest;
      const srcPath = path.resolve(
        projectRoot,
        platformProjectRoot
      );
      
      // create a new folder
      const newFolderPath = path.resolve(srcPath, NS_TARGET_NAME);
      if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath)
      }
      
      // add the notification service file
      const notificationServicePath = path.resolve(srcPath, NS_TARGET_NAME, NS_MAIN_FILE_NAME);
      if (!fs.existsSync(notificationServicePath)) {
        fs.writeFileSync(notificationServicePath, NS_MAIN_FILE_CONTENT);
      }
      
      // add the notification plist file
      const notificationPlistPath = path.resolve(srcPath, NS_TARGET_NAME, NS_PLIST_FILE_NAME);
      if (!fs.existsSync(notificationPlistPath)) {
        fs.writeFileSync(notificationPlistPath, NS_PLIST_CONTENT);
      }
      
      // add the notifications entitlements file
      const entitlementsPath = path.resolve(srcPath, NS_TARGET_NAME, NS_ENTITLEMENTS_FILE_NAME);
      if (!fs.existsSync(entitlementsPath)) {
        fs.writeFileSync(entitlementsPath, NS_ENTITLEMENTS_CONTENT);
      }

      return newConfig;
    },
  ]);
}


/**
 * Adds a fully configured push notification service to the app unless
 * `props.autoConfigurePushNotifications` is `false`.
 */
export const withIosPushNotifications: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config, props) => {
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
    [withNSFiles, props],
  ]);
}

export default withIosPushNotifications;
    