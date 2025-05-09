import { XcodeProject } from 'expo/config-plugins';

import {
  NS_ENTITLEMENTS_FILE_NAME,
  NS_FILES,
  NS_MAIN_FILE_NAME,
  NS_TARGET_NAME,
} from './withIosPushNotifications.constants';

const fs = require('fs');

/**
 * Create a file if it doesn't exist.
 * @param filePath - The path to the file
 * @param content - The content to write to the file
 */
export const createFileIfNoneExists = (
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
  CODE_SIGN_ENTITLEMENTS?: string;
};

/**
 * Retrieve Swift version and code signing settings from main target to apply to
 * dependency targets.
 * @param xcconfigs - Xcode project configuration
 * @returns Build settings
 */
export const extractBuildSettings = (
  xcconfigs: Record<string, any>
): BuildSettings => {
  let swiftVersion;
  for (const configUUID of Object.keys(xcconfigs)) {
    const buildSettings = xcconfigs[configUUID]?.buildSettings;
    if (!swiftVersion && buildSettings && buildSettings.SWIFT_VERSION) {
      swiftVersion = buildSettings.SWIFT_VERSION;
      return buildSettings;
    }
  }

  return { SWIFT_VERSION: swiftVersion };
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
  const objects = xcodeProject.hash.project.objects;
  const groups = objects.PBXGroup;

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
      xcodeProject.addToPbxGroup(itblNotificationServiceGroup.uuid, groupUUID);
    }
  }

  return itblNotificationServiceGroup;
};

/**
 * Apply the build settings to the notification service target
 * @param currentBuildSettings - The current build settings
 * @param newBuildSettings - The new build settings
 */
const applyBuildSettings = (
  currentBuildSettings: BuildSettings,
  newBuildSettings: BuildSettings
) => {
  currentBuildSettings.CODE_SIGN_ENTITLEMENTS = `${NS_TARGET_NAME}/${NS_ENTITLEMENTS_FILE_NAME}`;

  const valuesToUpdate = [
    'SWIFT_VERSION',
    'CODE_SIGN_STYLE',
    'CODE_SIGN_IDENTITY',
    'OTHER_CODE_SIGN_FLAGS',
    'DEVELOPMENT_TEAM',
    'PROVISIONING_PROFILE_SPECIFIER',
  ] as (keyof BuildSettings)[];

  valuesToUpdate.forEach((value) => {
    if (newBuildSettings[value]) {
      currentBuildSettings[value] = newBuildSettings[value];
    }
  });
};

/**
 * Update the build settings for the notification service target
 * @param xcodeProject - The Xcode project
 * @param buildSettings - The build settings
 */
export const updateBuildSettings = (xcodeProject: XcodeProject) => {
  const xcconfigs = xcodeProject.hash.project.objects.XCBuildConfiguration;
  const newBuildSettings = extractBuildSettings(xcconfigs);

  for (const configUUID of Object.keys(xcconfigs)) {
    const buildSettings = xcconfigs[configUUID].buildSettings;
    if (buildSettings && buildSettings.PRODUCT_NAME === `"${NS_TARGET_NAME}"`) {
      applyBuildSettings(buildSettings, newBuildSettings);
    }
  }
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
