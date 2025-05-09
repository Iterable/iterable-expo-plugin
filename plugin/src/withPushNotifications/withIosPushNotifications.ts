import {
  ConfigPlugin,
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
  withPlugins,
  withPodfile,
  withXcodeProject,
} from 'expo/config-plugins';

import { ConfigPluginPropsWithDefaults } from '../withIterable.types';
import {
  NS_ENTITLEMENTS_CONTENT,
  NS_ENTITLEMENTS_FILE_NAME,
  NS_FILES,
  NS_MAIN_FILE_CONTENT,
  NS_MAIN_FILE_NAME,
  NS_PLIST_CONTENT,
  NS_PLIST_FILE_NAME,
  NS_POD,
  NS_TARGET_NAME,
} from './withIosPushNotifications.constants';
import {
  createFileIfNotExists,
  extractBuildSettings,
} from './withIosPushNotifications.utils';

const fs = require('fs');
const path = require('path');

/**
 * Adds anything that would be added by going to Xcode > Signing & Capabilities
 * and clicking "+ Capability"
 */
const withCapabilities: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config,
  props
) => {
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
      newConfig.modResults[
        'com.apple.developer.usernotifications.time-sensitive'
      ] = true;
    }

    return newConfig;
  });
};

/**
 * Adds any needed background modes to the app.
 */
const withBackgroundModes: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config
) => {
  return withInfoPlist(config, (newConfig) => {
    const backgroundModes = newConfig.modResults.UIBackgroundModes || [];

    /**
     * Add remote-notification to the background modes if it's not already there
     * @see Step 3.5.2 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
     */
    if (!backgroundModes.includes('remote-notification')) {
      newConfig.modResults.UIBackgroundModes = [
        ...backgroundModes,
        'remote-notification',
      ];
    }

    return newConfig;
  });
};

/**
 * Adds the notification service files to the app.
 */
const withAddNSFiles: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config
) => {
  return withDangerousMod(config, [
    'ios',
    (newConfig) => {
      const { projectRoot, platformProjectRoot } = newConfig.modRequest;
      const srcPath = path.resolve(projectRoot, platformProjectRoot);
      const newFolderPath = path.resolve(srcPath, NS_TARGET_NAME);

      // Create folder if it doesn't exist
      if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
      }

      // Create all required files
      const files = [
        { name: NS_MAIN_FILE_NAME, content: NS_MAIN_FILE_CONTENT },
        { name: NS_PLIST_FILE_NAME, content: NS_PLIST_CONTENT },
        { name: NS_ENTITLEMENTS_FILE_NAME, content: NS_ENTITLEMENTS_CONTENT },
      ];

      files.forEach(({ name, content }) => {
        createFileIfNotExists(path.resolve(newFolderPath, name), content);
      });

      return newConfig;
    },
  ]);
};

/**
 * Updates the Xcode project to add the notification service target.
 */
const withXcodeUpdates: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config
) => {
  return withXcodeProject(config, (newConfig) => {
    const xcodeProject = newConfig.modResults;

    if (xcodeProject.pbxTargetByName(NS_TARGET_NAME)) {
      console.log(`${NS_TARGET_NAME} already exists in project. Skipping...`);
      return newConfig;
    }

    // Initialize project objects
    const objects = xcodeProject.hash.project.objects;
    objects.PBXTargetDependency = objects.PBXTargetDependency || {};
    objects.PBXContainerItemProxy = objects.PBXContainerItemProxy || {};

    const buildSettings = extractBuildSettings(objects.XCBuildConfiguration);

    if (!xcodeProject.pbxGroupByName(NS_TARGET_NAME)) {
      // Add the Notification Service Extension target
      const richPushTarget = xcodeProject.addTarget(
        NS_TARGET_NAME,
        'app_extension',
        NS_TARGET_NAME,
        `${newConfig.ios?.bundleIdentifier}.${NS_TARGET_NAME}`
      );

      // Add files to PBX group
      const itblNotificationServiceGroup = xcodeProject.addPbxGroup(
        NS_FILES,
        NS_TARGET_NAME,
        NS_TARGET_NAME
      );

      // Add group to project
      Object.keys(objects.PBXGroup).forEach((groupUUID) => {
        const group = objects.PBXGroup[groupUUID];
        if (typeof group === 'object' && !group.name && !group.path) {
          xcodeProject.addToPbxGroup(
            itblNotificationServiceGroup.uuid,
            groupUUID
          );
        }
      });

      // Update build settings
      Object.keys(objects.XCBuildConfiguration).forEach((configUUID) => {
        const configSettings =
          objects.XCBuildConfiguration[configUUID].buildSettings;
        if (configSettings?.PRODUCT_NAME === `"${NS_TARGET_NAME}"`) {
          Object.assign(configSettings, {
            SWIFT_VERSION: buildSettings.SWIFT_VERSION,
            CODE_SIGN_ENTITLEMENTS: `${NS_TARGET_NAME}/${NS_ENTITLEMENTS_FILE_NAME}`,
            ...buildSettings,
          });
        }
      });

      // Add build phases
      xcodeProject.addBuildPhase(
        [NS_MAIN_FILE_NAME],
        'PBXSourcesBuildPhase',
        'Sources',
        richPushTarget.uuid
      );

      xcodeProject.addBuildPhase(
        ['UserNotifications.framework'],
        'PBXFrameworksBuildPhase',
        'Frameworks',
        richPushTarget.uuid
      );
    }

    return newConfig;
  });
};

/**
 * Adds the notification service.
 * This is the equivalent of going to Xcode > File > New > Target... and selecting "Notification Service Extension".
 * @see Step 3.5.7 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
 */
const withAddNotificationService: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  return withPlugins(config, [
    [withAddNSFiles, props],
    [withXcodeUpdates, props],
  ]);
};

/**
 * Adds the notification service pod to the podfile and ensures it uses our sdk
 * @see Step 3.5.7 of https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-3-5-set-up-support-for-push-notifications
 */
const withAddServiceToPodfile: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config
) => {
  return withPodfile(config, (newConfig) => {
    const { contents } = newConfig.modResults;
    if (!contents.includes(NS_POD)) {
      newConfig.modResults.contents =
        contents +
        `
target '${NS_TARGET_NAME}' do
    use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
    use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']
    pod '${NS_POD}'
end`;
    }

    return newConfig;
  });
};

/**
 * Adds a fully configured push notification service to the app unless
 * `props.autoConfigurePushNotifications` is `false`.
 */
export const withIosPushNotifications: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  return withPlugins(config, [
    [withCapabilities, props],
    [withBackgroundModes, props],
    [withAddNotificationService, props],
    [withAddServiceToPodfile, props],
  ]);
};

export default withIosPushNotifications;
