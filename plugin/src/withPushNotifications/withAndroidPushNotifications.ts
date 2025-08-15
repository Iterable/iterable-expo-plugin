import {
  ConfigPlugin,
  WarningAggregator,
  withAndroidManifest,
  withAppBuildGradle,
  withPlugins,
  withProjectBuildGradle,
} from 'expo/config-plugins';

import { ConfigPluginPropsWithDefaults } from '../withIterable.types';
import {
  FIREBASE_BOM_CLASS_PATH,
  FIREBASE_BOM_VERSION,
  FIREBASE_MESSAGING_CLASS_PATH,
  GOOGLE_SERVICES_CLASS_PATH,
  GOOGLE_SERVICES_PLUGIN,
  GOOGLE_SERVICES_VERSION,
} from './withAndroidPushNotifications.constants';
import {
  addProjectDependency,
  addApplyPlugin,
  addAppDependency,
} from './withAndroidPushNotifications.utils';

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

export const withAndroidPushNotifications: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  if (!config.android?.googleServicesFile) {
    WarningAggregator.addWarningAndroid(
      '@iterable/expo-plugin',
      'The path to your google-services.json file is not defined, so push notifications may not work.  Please add the path to your google-services.json file in the `expo.android.googleServicesFile` field in your app.json.'
    );
    return config;
  }

  return withPlugins(config, [
    [withAppPermissions, props],
    [withFirebase, props],
  ]);
};

export default withAndroidPushNotifications;
