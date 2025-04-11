import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
  withPlugins,
} from 'expo/config-plugins';

import { type ConfigPluginPropsWithDefaults } from './withIterable.types';

const nativeKeyMap = {
  apiKey: 'ITERABLE_API_KEY',
  requestPermissionsForPushNotifications: 'ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS',
};

const withStoreValuesOnIos: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config, props) => {
  return withInfoPlist(config, (newConfig) => {
    Object.entries(nativeKeyMap).forEach(([configKey, nativeKey]) => {
      newConfig.modResults[nativeKey] = props[configKey as keyof typeof props];
    });
    return newConfig;
  });
};

const withStoreValuesOnAndroid: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config, props) => {
  return withAndroidManifest(config, (newConfig) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(newConfig.modResults);

    Object.entries(nativeKeyMap).forEach(([configKey, nativeKey]) => {
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        nativeKey,
        String(props[configKey as keyof typeof props]),
      );
    });

    return newConfig;
  });
};  

export const withStoreConfigValues: ConfigPlugin<ConfigPluginPropsWithDefaults> = (config, props) => {
  return withPlugins(config, [
    [withStoreValuesOnIos, props],
    [withStoreValuesOnAndroid, props],
  ]);
};

export default withStoreConfigValues;
