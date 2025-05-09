import {
  ConfigPlugin,
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
  withPlugins,
  withPodfile,
  withXcodeProject,
  XcodeProject,
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
 * Create a file if it doesn't exist.
 * @param filePath - The path to the file
 * @param content - The content to write to the file
 */
export const createFileIfNotExists = (
  filePath: string,
  content: string
): void => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
};

/**
 * Xcode build settings
 */
type BuildSettings = {
  SWIFT_VERSION?: string;
  CODE_SIGN_STYLE?: string;
  CODE_SIGN_IDENTITY?: string;
  OTHER_CODE_SIGN_FLAGS?: string;
  DEVELOPMENT_TEAM?: string;
  PROVISIONING_PROFILE_SPECIFIER?: string;
  PRODUCT_NAME?: string;
};

/**
 * Extract build settings from Xcode project
 * @param xcconfigs - Xcode project configuration
 * @returns Build settings
 */
export const extractBuildSettings = (
  xcconfigs: Record<string, any>
): BuildSettings => {
  const settings: BuildSettings = {};

  for (const configUUID of Object.keys(xcconfigs)) {
    const buildSettings = xcconfigs[configUUID].buildSettings;
    if (buildSettings?.SWIFT_VERSION) {
      Object.assign(settings, {
        SWIFT_VERSION: buildSettings.SWIFT_VERSION,
        CODE_SIGN_STYLE: buildSettings.CODE_SIGN_STYLE,
        CODE_SIGN_IDENTITY: buildSettings.CODE_SIGN_IDENTITY,
        OTHER_CODE_SIGN_FLAGS: buildSettings.OTHER_CODE_SIGN_FLAGS,
        DEVELOPMENT_TEAM: buildSettings.DEVELOPMENT_TEAM,
        PROVISIONING_PROFILE_SPECIFIER:
          buildSettings.PROVISIONING_PROFILE_SPECIFIER,
      });
      break;
    }
  }

  return settings;
};

/**
 * Add the notification service target to the Xcode project
 * @param xcodeProject - The Xcode project
 * @param bundleIdentifier - The bundle identifier
 * @returns The target
 */
export const addNotificationServiceTarget = (
  xcodeProject: XcodeProject,
  bundleIdentifier: string
) => {
  return xcodeProject.addTarget(
    NS_TARGET_NAME,
    'app_extension',
    NS_TARGET_NAME,
    `${bundleIdentifier}.${NS_TARGET_NAME}`
  );
};

/**
 * Add the notification service group to the Xcode project
 * @param xcodeProject - The Xcode project
 * @returns The group
 */
export const addNotificationServiceGroup = (xcodeProject: XcodeProject) => {
  const group = xcodeProject.addPbxGroup(
    NS_FILES,
    NS_TARGET_NAME,
    NS_TARGET_NAME
  );

  // Add group to project's root group
  Object.keys(xcodeProject.hash.project.objects.PBXGroup).forEach(
    (groupUUID) => {
      const targetGroup = xcodeProject.hash.project.objects.PBXGroup[groupUUID];
      if (
        typeof targetGroup === 'object' &&
        !targetGroup.name &&
        !targetGroup.path
      ) {
        xcodeProject.addToPbxGroup(group.uuid, groupUUID);
      }
    }
  );

  return group;
};

/**
 * Update the build settings for the notification service target
 * @param xcodeProject - The Xcode project
 * @param buildSettings - The build settings
 */
export const updateBuildSettings = (
  xcodeProject: XcodeProject,
  buildSettings: any
) => {
  Object.keys(xcodeProject.hash.project.objects.XCBuildConfiguration).forEach(
    (configUUID) => {
      const configSettings =
        xcodeProject.hash.project.objects.XCBuildConfiguration[configUUID]
          .buildSettings;
      if (configSettings?.PRODUCT_NAME === `"${NS_TARGET_NAME}"`) {
        Object.assign(configSettings, {
          SWIFT_VERSION: buildSettings.SWIFT_VERSION,
          CODE_SIGN_ENTITLEMENTS: `${NS_TARGET_NAME}/${NS_ENTITLEMENTS_FILE_NAME}`,
          ...buildSettings,
        });
      }
    }
  );
};

/**
 * Add the build phases for the notification service target
 * @param xcodeProject - The Xcode project
 * @param targetUUID - The target UUID
 */
export const addBuildPhases = (
  xcodeProject: XcodeProject,
  targetUUID: string
) => {
  xcodeProject.addBuildPhase(
    [NS_MAIN_FILE_NAME],
    'PBXSourcesBuildPhase',
    'Sources',
    targetUUID
  );

  xcodeProject.addBuildPhase(
    ['UserNotifications.framework'],
    'PBXFrameworksBuildPhase',
    'Frameworks',
    targetUUID
  );
};
