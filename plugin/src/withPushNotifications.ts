import {
  ConfigPlugin,
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
  withPodfile,
  withXcodeProject,
  IOSConfig
} from 'expo/config-plugins';

import { ConfigPluginProps } from './withIterable.types';

const fs = require('fs');
const path = require('path');

const NS_TARGET_NAME = 'IterableExpoRichPush';
const NS_PLIST_FILENAME = `${NS_TARGET_NAME}-Info.plist`;
const NS_ENTITLEMENTS_FILENAME = `${NS_TARGET_NAME}.entitlements`;


const NS_FILES = [
  'NotificationService.swift',
  NS_PLIST_FILENAME,
  NS_ENTITLEMENTS_FILENAME,
];

const NS_POD = 'Iterable-iOS-AppExtensions';

export const withPushNotifications: ConfigPlugin<ConfigPluginProps> = (_config, props) => {
  _config = withInfoPlist(_config, (config) => {
    const backgroundModes = config.modResults['UIBackgroundModes'] || [];

    // Add remote-notification to the background modes if it's not already there
    // See:
    // https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK,
    // step 3.5.2
    if (!backgroundModes.includes('remote-notification')) {
      config.modResults.UIBackgroundModes = [...backgroundModes, 'remote-notification'];
    }

    return config;
  });

  // Add the entitlement to allow time-sensitive notifications
  // See:
  // https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK,
  // step 3.5.3
  _config = withEntitlementsPlist(_config, (config) => {
    config.modResults['com.apple.developer.usernotifications.time-sensitive'] = true;
    config.modResults['aps-environment'] = props.mode || 'development';
    
    return config;
  });

  // SEE:
  // https://github.com/nikwebr/expo-notification-service-extension-plugin/blob/main/plugin/withServiceExtensionIos.ts
  // https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxFile.js
  // https://github.com/braze-inc/braze-expo-plugin/blob/main/plugin/src/withBrazeiOS.ts
  _config = withXcodeProject(_config, (config) => {
    const xcodeProject = config.modResults;

    if (!!xcodeProject.pbxTargetByName(NS_TARGET_NAME)) {
      console.log(`${NS_TARGET_NAME} already exists in project. Skipping...`);
      return config;
    }

    // console.log(` _config=withXcodeProject > config.modResults:`, config.modResults);

    // Initialize with an empty object if these top-level objects are non-existent.
    // This guarantees that the extension targets will have a destination.
    const objects = config.modResults.hash.project.objects;
    console.log(` _config=withXcodeProject > objects:`, Object.keys(objects));
    objects['PBXTargetDependency'] = objects['PBXTargetDependency'] || {};
    objects['PBXContainerItemProxy'] = objects['PBXContainerItemProxy'] || {};

    const groups = objects['PBXGroup'];
    const xcconfigs = objects['XCBuildConfiguration'];

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


    if (!config.modResults.pbxGroupByName(NS_TARGET_NAME)) {
      // Add the Notification Service Extension target.
      const richPushTarget = config.modResults.addTarget(
        NS_TARGET_NAME,
        'app_extension',
        NS_TARGET_NAME,
        `${config.ios?.bundleIdentifier}.${NS_TARGET_NAME}`,
      );


      // Add the relevant files to the PBX group.
      const itblNotificationServiceGroup = config.modResults.addPbxGroup(
        NS_FILES,
        NS_TARGET_NAME,
        NS_TARGET_NAME,
      );

      for (const groupUUID of Object.keys(groups)) {
        if (typeof groups[groupUUID] === 'object'
              && groups[groupUUID].name === undefined
              && groups[groupUUID].path === undefined) {
          config.modResults.addToPbxGroup(itblNotificationServiceGroup.uuid, groupUUID);
        }
      };

      for (const configUUID of Object.keys(xcconfigs)) {
        const buildSettings = xcconfigs[configUUID].buildSettings;
        if (buildSettings && buildSettings.PRODUCT_NAME === `"${NS_TARGET_NAME}"`) {
          buildSettings.SWIFT_VERSION = swiftVersion;
          buildSettings.CODE_SIGN_ENTITLEMENTS = `${NS_TARGET_NAME}/${NS_ENTITLEMENTS_FILENAME}`;
          if (codeSignStyle) { buildSettings.CODE_SIGN_STYLE = codeSignStyle; }
          if (codeSignIdentity) { buildSettings.CODE_SIGN_IDENTITY = codeSignIdentity; }
          if (otherCodeSigningFlags) { buildSettings.OTHER_CODE_SIGN_FLAGS = otherCodeSigningFlags; }
          if (developmentTeam) { buildSettings.DEVELOPMENT_TEAM = developmentTeam; }
          if (provisioningProfile) { buildSettings.PROVISIONING_PROFILE_SPECIFIER = provisioningProfile; }
        }
      }

      // Set up target build phase scripts.
      config.modResults.addBuildPhase(
        [
          'NotificationService.swift',
        ],
        'PBXSourcesBuildPhase',
        'Sources',
        richPushTarget.uuid
      );

      config.modResults.addBuildPhase(
        ['UserNotifications.framework'],
        'PBXFrameworksBuildPhase',
        'Frameworks',
        richPushTarget.uuid
      );
    }

    return config;
  });

  _config = withPodfile(_config, (config) => {
    const { contents } = config.modResults;
    if (!contents.includes(NS_POD)) {
      config.modResults.contents =
        contents +
        `
  target '${NS_TARGET_NAME}' do
    pod '${NS_POD}'
  end`;
    }

    return config;
  });

  _config = withDangerousMod(_config, [
    'ios',
    (config) => {
      // console.log(` config:`, config);
      const { projectRoot, platformProjectRoot } = config.modRequest;
      const srcPath = path.resolve(
        projectRoot,
        platformProjectRoot
      );
      const notificationServiceFileName = 'NotificationService.swift';
      const notificationServiceContent = `import UserNotifications
import IterableAppExtensions

class NotificationService: ITBNotificationServiceExtension {}`;
      const notificationServicePath = path.resolve(srcPath, NS_TARGET_NAME, notificationServiceFileName);

      // create a new folder
      const newFolderPath = path.resolve(srcPath, NS_TARGET_NAME);
      if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath)
      }

      // add the notification service file
      if (!fs.existsSync(notificationServicePath)) {
        fs.writeFileSync(notificationServicePath, notificationServiceContent);
      }

      const notificationPlistPath = path.resolve(srcPath, NS_TARGET_NAME, NS_PLIST_FILENAME);

      const notificationPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleDisplayName</key>
	<string>${NS_TARGET_NAME}</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>XPC!</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>NSExtension</key>
	<dict>
		<key>NSExtensionPointIdentifier</key>
		<string>com.apple.usernotifications.service</string>
		<key>NSExtensionPrincipalClass</key>
		<string>$(PRODUCT_MODULE_NAME).NotificationService</string>
	</dict>
</dict>
</plist>`;

      //       const notificationPlistContent = `
      // <?xml version="1.0" encoding="UTF-8"?>
      // <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
      // <plist version="1.0">
      // <dict>
// 	<key>CFBundleDevelopmentRegion</key>
// 	<string>$(DEVELOPMENT_LANGUAGE)</string>
// 	<key>CFBundleDisplayName</key>
// 	<string>${NS_TARGET_NAME}</string>
// 	<key>CFBundleExecutable</key>
// 	<string>$(EXECUTABLE_NAME)</string>
// 	<key>CFBundleIdentifier</key>
// 	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
// 	<key>CFBundleInfoDictionaryVersion</key>
// 	<string>6.0</string>
// 	<key>CFBundleName</key>
// 	<string>$(PRODUCT_NAME)</string>
// 	<key>CFBundlePackageType</key>
// 	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
// 	<key>CFBundleShortVersionString</key>
// 	<string>$(CURRENT_PROJECT_VERSION)</string>
// 	<key>CFBundleVersion</key>
// 	<string>1</string>
// 	<key>NSExtension</key>
// 	<dict>
// 		<key>NSExtensionPointIdentifier</key>
// 		<string>com.apple.usernotifications.service</string>
// 		<key>NSExtensionPrincipalClass</key>
// 		<string>$(PRODUCT_MODULE_NAME).NotificationService</string>
// 	</dict>
// </dict>
// </plist>
//       `;

      // add the notification plist file
      if (!fs.existsSync(notificationPlistPath)) {
        fs.writeFileSync(notificationPlistPath, notificationPlistContent);
      }

      const entitlementsFileName = NS_ENTITLEMENTS_FILENAME;
      const entitlementsPath = path.resolve(srcPath, NS_TARGET_NAME, entitlementsFileName);
      const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.app-sandbox</key>
	<true/>
	<key>com.apple.security.network.client</key>
	<true/>
</dict>
</plist>`;

      // add the entitlements file
      if (!fs.existsSync(entitlementsPath)) {
        fs.writeFileSync(entitlementsPath, entitlementsContent);
      }

      // const absoluteSource = require.resolve(
      //   '@iterable/expo-plugin/ios/ExpoAdapterIterable/Rich Notification Extension/NotificationService.swift',
      // );
      // const sourcePath = path.dirname(absoluteSource);
      // const destinationPath = `${projectRoot}/ios/${NS_TARGET_NAME}`;

      // if (!fs.existsSync(`${destinationPath}`)) {
      //   fs.mkdirSync(`${destinationPath}`);
      // }
      // for (const file of NS_FILES) {
      //   console.log(` file:`, file);
      //   fs.copyFileSync(`${sourcePath}/${file}`, `${destinationPath}/${file}`);
      // }

      // console.log(` absoluteSource:`, absoluteSource);
      // const sourcePath = path.dirname(absoluteSource);
      // const destinationPath = `${projectRoot}/ios/${NS_TARGET_NAME}`;
      // console.log(` sourcePath:`, sourcePath);
      // console.log(` destinationPath:`, destinationPath);

      return config;
    },
  ]);

  return _config;
};

export default withPushNotifications;
