import {
  ConfigPlugin,
  WarningAggregator,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withPlugins,
  withProjectBuildGradle,
} from 'expo/config-plugins';
import fs from 'fs';
import path from 'path';

import { ConfigPluginPropsWithDefaults } from '../withIterable.types';
import {
  DEFAULT_GOOGLE_SERVICES_PATH,
  FIREBASE_BOM_CLASS_PATH,
  FIREBASE_BOM_VERSION,
  FIREBASE_MESSAGING_CLASS_PATH,
  GOOGLE_SERVICES_CLASS_PATH,
  GOOGLE_SERVICES_PLUGIN,
  GOOGLE_SERVICES_VERSION,
} from './withAndroidPushNotifications.constants';

interface GradleDependency {
  classpath: string;
  version?: string;
}

/**
 * Add a dependency to the project build.gradle file.
 */
function addProjectDependency(buildGradle: string, options: GradleDependency) {
  if (!buildGradle.includes(options?.classpath)) {
    return buildGradle.replace(
      /dependencies\s?{/,
      `dependencies {
        classpath('${options?.classpath}${
          options?.version ? `:${options?.version}` : ''
        }')`
    );
  } else {
    return buildGradle;
  }
}

interface AppGradleDependency extends GradleDependency {
  /**
   * The string to add to the dependencies block.
   *
   * If this is not provided, ${classpath}:${version} will be used.
   */
  implementation?: string;
}

/**
 * Add a dependency to the app build.gradle file.
 */
function addAppDependency(buildGradle: string, options: AppGradleDependency) {
  if (!buildGradle.includes(options?.classpath)) {
    const implementationString =
      options?.implementation ??
      `'${options?.classpath}${
        options?.version ? `:${options?.version}` : ''
      }'`;
    return buildGradle.replace(
      /dependencies\s?{/,
      // NOTE: awkard spacing is intentional -- it ensure correct alignment in
      // the output build.gradle file
      `dependencies {
    implementation ${implementationString}`
    );
  } else {
    return buildGradle;
  }
}

/**
 * Add the apply plugin line to the app build.gradle file if it doesn't exist.
 */
function addApplyPlugin(appBuildGradle: string, pluginName: string) {
  // Check for `apply plugin: 'com.google.gms.google-services'`
  const applyPluginPattern = new RegExp(
    `apply\\s+plugin:\\s+['"]${pluginName}['"]`
  );
  // Check for `plugins { id 'com.google.gms.google-services' }`
  const pluginIdPattern = new RegExp(`id\\s+['"]${pluginName}['"]`);

  // Make sure the project does not have the plugin already
  if (
    !appBuildGradle.match(applyPluginPattern) &&
    !appBuildGradle.match(pluginIdPattern)
  ) {
    return appBuildGradle + `\napply plugin: '${pluginName}'`;
  }

  return appBuildGradle;
}

const withFirebaseInProjectBuildGradle: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config) => {
  return withProjectBuildGradle(config, async (newConfig) => {
    if (newConfig.modResults.language === 'groovy') {
      newConfig.modResults.contents = addProjectDependency(
        newConfig.modResults.contents,
        {
          classpath: GOOGLE_SERVICES_CLASS_PATH,
          version: GOOGLE_SERVICES_VERSION,
        }
      );
    } else {
      WarningAggregator.addWarningAndroid(
        '@iterable/expo-plugin',
        "Cannot automatically configure project build.gradle if it's not groovy"
      );
    }

    return newConfig;
  });
};

const withFirebaseInAppBuildGradle: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config) => {
  return withAppBuildGradle(config, (newConfig) => {
    if (newConfig.modResults.language === 'groovy') {
      newConfig.modResults.contents = addApplyPlugin(
        newConfig.modResults.contents,
        GOOGLE_SERVICES_PLUGIN
      );
      newConfig.modResults.contents = addAppDependency(
        newConfig.modResults.contents,
        {
          classpath: FIREBASE_MESSAGING_CLASS_PATH,
        }
      );
      newConfig.modResults.contents = addAppDependency(
        newConfig.modResults.contents,
        {
          classpath: FIREBASE_BOM_CLASS_PATH,
          version: FIREBASE_BOM_VERSION,
          implementation: `platform('${FIREBASE_BOM_CLASS_PATH}:${FIREBASE_BOM_VERSION}')`,
        }
      );
    } else {
      WarningAggregator.addWarningAndroid(
        '@iterable/expo-plugin',
        "Cannot automatically configure app build.gradle if it's not groovy"
      );
    }
    return newConfig;
  });
};

/**
 * Add the Google Services dependencies to the project and build.gradle file if
 * they don't exist.
 * @see Step 4.1 https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-4-1-set-up-firebase
 */
const withFirebase: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config,
  props
) => {
  return withPlugins(config, [
    [withFirebaseInProjectBuildGradle, props],
    [withFirebaseInAppBuildGradle, props],
  ]);
};

/**
 * Add the POST_NOTIFICATIONS permission to the AndroidManifest.xml file if it
 * doesn't exist.
 */
const withAppPermissions: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config
) => {
  return withAndroidManifest(config, (newConfig) => {
    const androidManifest = newConfig.modResults.manifest;
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }
    const postPermission = 'android.permission.POST_NOTIFICATIONS';
    const currPostPermission = androidManifest['uses-permission'].find(
      (p) => p.$['android:name'] === postPermission
    );

    // Only add the permission if it doesn't exist
    if (!currPostPermission) {
      androidManifest['uses-permission'].push({
        $: { 'android:name': postPermission },
      });
    }
    return newConfig;
  });
};

/**
 * Copy `google-services.json`
 * TODO: Add this step to the docs
 */
const withCopyAndroidGoogleServices: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'android',
    async (newConfig) => {
      if (!newConfig.android?.googleServicesFile) {
        WarningAggregator.addWarningAndroid(
          '@iterable/expo-plugin',
          'Path to google-services.json is not defined, so push notifications will not be enabled.  To enable push notifications, please specify the `expo.android.googleServicesFile` field in app.json.'
        );
        return newConfig;
      }

      const srcPath = path.resolve(
        newConfig.modRequest.projectRoot,
        newConfig.android.googleServicesFile
      );
      const destPath = path.resolve(
        newConfig.modRequest.platformProjectRoot,
        DEFAULT_GOOGLE_SERVICES_PATH
      );

      try {
        await fs.promises.copyFile(srcPath, destPath);
      } catch {
        throw new Error(
          `Cannot copy google-services.json, because the file ${srcPath} doesn't exist. Please provide a valid path in \`app.json\`.`
        );
      }
      return newConfig;
    },
  ]);
};

export const withAndroidPushNotifications: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  return withPlugins(config, [
    [withAppPermissions, props],
    [withFirebase, props],
    [withCopyAndroidGoogleServices, props],
  ]);
};

export default withAndroidPushNotifications;
