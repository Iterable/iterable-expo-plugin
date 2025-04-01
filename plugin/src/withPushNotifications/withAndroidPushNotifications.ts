import {
  ConfigPlugin,
  WarningAggregator,
  withAppBuildGradle,
  withPlugins,
  withProjectBuildGradle,
} from 'expo/config-plugins';

import { ConfigPluginPropsWithDefaults } from '../withIterable.types';
import {
  GOOGLE_SERVICES_CLASS_PATH,
  GOOGLE_SERVICES_PLUGIN,
  GOOGLE_SERVICES_VERSION,
  FIREBASE_MESSAGING_CLASS_PATH,
  FIREBASE_MESSAGING_VERSION,
} from './withAndroidPushNotifications.constants';


/**
 * Add a dependency to the project build.gradle file.
 */
function addProjectDependency(buildGradle: string, classpath: string, version: string) {
  if (!buildGradle.includes(classpath)) {
    return buildGradle.replace(
      /dependencies\s?{/,
      `dependencies {
        classpath('${classpath}:${version}')`
    );
  } else {
    return buildGradle;
  }
}

/**
 * Add a dependency to the app build.gradle file.
 */
function addAppDependency(buildGradle: string, classpath: string, version: string) {
  if (!buildGradle.includes(classpath)) {
    return buildGradle.replace(
      /dependencies\s?{/,
      `dependencies {
        implementation '${classpath}:${version}'`
    );
  } else {
    return buildGradle;
  }
}

/**
 * Add the apply plugin line to the app build.gradle file if it doesn't exist.
 */
function addApplyPlugin(appBuildGradle: string, pluginName: string) {
  // Make sure the project does not have the plugin already
  const pattern = new RegExp(
    `apply\\s+plugin:\\s+['"]${pluginName}['"]`
  );
  if (!appBuildGradle.match(pattern)) {
    return appBuildGradle + `\napply plugin: '${pluginName}'`;
  }

  return appBuildGradle;
}

/**
 * Add the Google Services dependencies to the project and build.gradle file if
 * they don't exist.
 * @see Step 4.1 https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-4-1-set-up-firebase
 */
const withFirebase: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config) => {
  config = withProjectBuildGradle(config, async (newConfig) => {
    if (newConfig.modResults.language === 'groovy') {
      newConfig.modResults.contents = addProjectDependency(
        newConfig.modResults.contents, GOOGLE_SERVICES_CLASS_PATH, GOOGLE_SERVICES_VERSION
      );
    } else {
      WarningAggregator.addWarningAndroid(
        '@iterable/expo-plugin',
        `Cannot automatically configure project build.gradle if it's not groovy`
      );
    }

    return newConfig;
  });

  config = withAppBuildGradle(config, (newConfig) => {
    if (newConfig.modResults.language === 'groovy') {
      newConfig.modResults.contents = addApplyPlugin(
        newConfig.modResults.contents, GOOGLE_SERVICES_PLUGIN
      );
      newConfig.modResults.contents = addAppDependency(
        newConfig.modResults.contents, FIREBASE_MESSAGING_CLASS_PATH, FIREBASE_MESSAGING_VERSION
      );
    } else {
      WarningAggregator.addWarningAndroid(
        '@iterable/expo-plugin',
        `Cannot automatically configure app build.gradle if it's not groovy`
      );
    }
    return newConfig;
  });

  return config;
};

export const withAndroidPushNotifications: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  return withPlugins(config, [[withFirebase, props]]);
};

export default withAndroidPushNotifications;
