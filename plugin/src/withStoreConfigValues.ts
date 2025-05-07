import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
  withPlugins,
} from 'expo/config-plugins';

import { type ConfigPluginPropsWithDefaults } from './withIterable.types';

/**
 * The keys of the props object that are passed to the plugin.
 *
 * These keys are used to configure the plugin in the apps app.json file.
 */
type JsKey = keyof Pick<
  ConfigPluginPropsWithDefaults,
  'requestPermissionsForPushNotifications'
>;

/**
 * Natively stored keys associated with the plugin options.
 *
 * These keys are added to the Info.plist file or the AndroidManifest.xml file,
 * and are associated with the values found in the plugin options of the users
 * app.json file.
 */
type NativeKey = string;

/**
 * A map of the plugin options keys to the native keys that are added to the
 * Info.plist file or the AndroidManifest.xml file.
 */
const nativeKeyMap: Record<JsKey, NativeKey> = {
  requestPermissionsForPushNotifications:
    'ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS',
};

const withStoreValuesOnIos: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config,
  props
) => {
  return withInfoPlist(config, (newConfig) => {
    Object.entries(nativeKeyMap).forEach(([configKey, nativeKey]) => {
      newConfig.modResults[nativeKey] = props[configKey as keyof typeof props];
    });
    return newConfig;
  });
};

const withStoreValuesOnAndroid: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config,
  props
) => {
  return withAndroidManifest(config, (newConfig) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      newConfig.modResults
    );

    Object.entries(nativeKeyMap).forEach(([configKey, nativeKey]) => {
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        nativeKey,
        String(props[configKey as keyof typeof props])
      );
    });

    return newConfig;
  });
};

export const withStoreConfigValues: ConfigPlugin<
  ConfigPluginPropsWithDefaults
> = (config, props) => {
  return withPlugins(config, [
    [withStoreValuesOnIos, props],
    [withStoreValuesOnAndroid, props],
  ]);
};

export default withStoreConfigValues;
