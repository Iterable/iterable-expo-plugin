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
