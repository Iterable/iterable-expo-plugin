import {
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
  ConfigPlugin,
} from 'expo/config-plugins';
import { ConfigPluginProps } from './withIterable.types';

export const withApiKey: ConfigPlugin<ConfigPluginProps> = (config, { apiKey }) => {
  // config = withInfoPlist(config, (config) => {
  //   config.modResults['MY_CUSTOM_API_KEY'] = apiKey;
  //   return config;
  // });

  // config = withAndroidManifest(config, (config) => {
  //   const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

  //   AndroidConfig.Manifest.addMetaDataItemToMainApplication(
  //     mainApplication,
  //     'MY_CUSTOM_API_KEY',
  //     apiKey,
  //   );
  //   return config;
  // });

  return config;
};

export default withApiKey;
