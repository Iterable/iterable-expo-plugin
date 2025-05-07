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

      // create a new folder
      const newFolderPath = path.resolve(srcPath, NS_TARGET_NAME);
      if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
      }

      // add the notification service file
      const notificationServicePath = path.resolve(
        srcPath,
        NS_TARGET_NAME,
        NS_MAIN_FILE_NAME
      );
      if (!fs.existsSync(notificationServicePath)) {
        fs.writeFileSync(notificationServicePath, NS_MAIN_FILE_CONTENT);
      }

      // add the notification plist file
      const notificationPlistPath = path.resolve(
        srcPath,
        NS_TARGET_NAME,
        NS_PLIST_FILE_NAME
      );
      if (!fs.existsSync(notificationPlistPath)) {
        fs.writeFileSync(notificationPlistPath, NS_PLIST_CONTENT);
      }

      // add the notifications entitlements file
      const entitlementsPath = path.resolve(
        srcPath,
        NS_TARGET_NAME,
        NS_ENTITLEMENTS_FILE_NAME
      );
      if (!fs.existsSync(entitlementsPath)) {
        fs.writeFileSync(entitlementsPath, NS_ENTITLEMENTS_CONTENT);
      }

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

    // Initialize with an empty object if these top-level objects are non-existent.
    // This guarantees that the extension targets will have a destination.
    const objects = xcodeProject.hash.project.objects;
    objects.PBXTargetDependency = objects.PBXTargetDependency || {};
    objects.PBXContainerItemProxy = objects.PBXContainerItemProxy || {};

    const groups = objects.PBXGroup;
    const xcconfigs = objects.XCBuildConfiguration;

    // Retrieve Swift version and code signing settings from main target to apply to dependency targets.
    let swiftVersion;
    let codeSignStyle;
    let codeSignIdentity;
    let otherCodeSigningFlags;
    let developmentTeam;
    let provisioningProfile;
    for (const configUUID of Object.keys(xcconfigs)) {
      const buildSettings = xcconfigs[configUUID].buildSettings;
      if (!swiftVersion && buildSettings && buildSettings.SWIFT_VERSION) {
        swiftVersion = buildSettings.SWIFT_VERSION;
        codeSignStyle = buildSettings.CODE_SIGN_STYLE;
        codeSignIdentity = buildSettings.CODE_SIGN_IDENTITY;
        otherCodeSigningFlags = buildSettings.OTHER_CODE_SIGN_FLAGS;
        developmentTeam = buildSettings.DEVELOPMENT_TEAM;
        provisioningProfile = buildSettings.PROVISIONING_PROFILE_SPECIFIER;
        break;
      }
    }

    if (!xcodeProject.pbxGroupByName(NS_TARGET_NAME)) {
      // Add the Notification Service Extension target.
      const richPushTarget = xcodeProject.addTarget(
        NS_TARGET_NAME,
        'app_extension',
        NS_TARGET_NAME,
        `${newConfig.ios?.bundleIdentifier}.${NS_TARGET_NAME}`
      );

      // Add the relevant files to the PBX group.
      const itblNotificationServiceGroup = xcodeProject.addPbxGroup(
        NS_FILES,
        NS_TARGET_NAME,
        NS_TARGET_NAME
      );

      for (const groupUUID of Object.keys(groups)) {
        if (
          typeof groups[groupUUID] === 'object' &&
          groups[groupUUID].name === undefined &&
          groups[groupUUID].path === undefined
        ) {
          xcodeProject.addToPbxGroup(
            itblNotificationServiceGroup.uuid,
            groupUUID
          );
        }
      }

      for (const configUUID of Object.keys(xcconfigs)) {
        const buildSettings = xcconfigs[configUUID].buildSettings;
        if (
          buildSettings &&
          buildSettings.PRODUCT_NAME === `"${NS_TARGET_NAME}"`
        ) {
          buildSettings.SWIFT_VERSION = swiftVersion;
          buildSettings.CODE_SIGN_ENTITLEMENTS = `${NS_TARGET_NAME}/${NS_ENTITLEMENTS_FILE_NAME}`;
          if (codeSignStyle) {
            buildSettings.CODE_SIGN_STYLE = codeSignStyle;
          }
          if (codeSignIdentity) {
            buildSettings.CODE_SIGN_IDENTITY = codeSignIdentity;
          }
          if (otherCodeSigningFlags) {
            buildSettings.OTHER_CODE_SIGN_FLAGS = otherCodeSigningFlags;
          }
          if (developmentTeam) {
            buildSettings.DEVELOPMENT_TEAM = developmentTeam;
          }
          if (provisioningProfile) {
            buildSettings.PROVISIONING_PROFILE_SPECIFIER = provisioningProfile;
          }
        }
      }

      // Set up target build phase scripts.
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
