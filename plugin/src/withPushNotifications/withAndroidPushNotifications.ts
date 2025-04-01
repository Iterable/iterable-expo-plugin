import {
  ConfigPlugin,
  WarningAggregator,
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
  GOOGLE_SERVICES_VERSION
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
        classpath('${options?.classpath}${options?.version ? `:${options?.version}` : ''}')`
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
    const implementationString = options?.implementation ?? `'${options?.classpath}${options?.version ? `:${options?.version}` : ''}'`;
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
  // Make sure the project does not have the plugin already
  const pattern = new RegExp(
    `apply\\s+plugin:\\s+['"]${pluginName}['"]`
  );
  if (!appBuildGradle.match(pattern)) {
    return appBuildGradle + `\napply plugin: '${pluginName}'`;
  }

  return appBuildGradle;
}

const withFirebaseInProjectBuildGradle: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config) => {
  return withProjectBuildGradle(config, async (newConfig) => {
    if (newConfig.modResults.language === 'groovy') {
      newConfig.modResults.contents = addProjectDependency(
        newConfig.modResults.contents, { classpath: GOOGLE_SERVICES_CLASS_PATH, version: GOOGLE_SERVICES_VERSION }
      );
    } else {
      WarningAggregator.addWarningAndroid(
        '@iterable/expo-plugin',
        `Cannot automatically configure project build.gradle if it's not groovy`
      );
    }

    return newConfig;
  });
}

const withFirebaseInAppBuildGradle: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config) => {
  return withAppBuildGradle(config, (newConfig) => {
    if (newConfig.modResults.language === 'groovy') {
      newConfig.modResults.contents = addApplyPlugin(
        newConfig.modResults.contents, GOOGLE_SERVICES_PLUGIN
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
          implementation: `platform('${FIREBASE_BOM_CLASS_PATH}:${FIREBASE_BOM_VERSION}')`
        }
      );

    } else {
      WarningAggregator.addWarningAndroid(
        '@iterable/expo-plugin',
        `Cannot automatically configure app build.gradle if it's not groovy`
      );
    }
    return newConfig;
  });
}

/**
 * Add the Google Services dependencies to the project and build.gradle file if
 * they don't exist.
 * @see Step 4.1 https://support.iterable.com/hc/en-us/articles/360045714132-Installing-Iterable-s-React-Native-SDK#step-4-1-set-up-firebase
 */
const withFirebase: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config, props) => {
  return withPlugins(config, [
    [withFirebaseInProjectBuildGradle, props],
    [withFirebaseInAppBuildGradle, props],
  ]);
};

export const withAndroidPushNotifications: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  return withPlugins(config, [[withFirebase, props]]);
};

export default withAndroidPushNotifications;
