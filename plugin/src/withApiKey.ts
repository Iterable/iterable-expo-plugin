import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
} from 'expo/config-plugins';

import { ConfigPluginProps } from './withIterable.types';

export const withApiKey: ConfigPlugin<ConfigPluginProps> = (config, { apiKey } = {}) => {
  if (!apiKey) {
    return config;
  }

  config = withInfoPlist(config, (config) => {
    config.modResults['ITERABLE_API_KEY'] = apiKey;
    return config;
  });

  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'ITERABLE_API_KEY',
      apiKey,
    );
    return config;
  });

  return config;
};

export default withApiKey;
