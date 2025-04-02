import { type ConfigPlugin, withSettingsGradle } from 'expo/config-plugins';
import type { ConfigPluginPropsWithDefaults } from './withIterable.types';

/**
 * Adds the Iterable API dependencies to the app's settings.gradle file.
 
 * TODO [MOB-11159]: Add step for android iterable api dependency to docs
 */
export const withIterableApis: ConfigPlugin<ConfigPluginPropsWithDefaults> = (
  config
) => {
  return withSettingsGradle(config, (newConfig) => {
    const lines = newConfig.modResults.contents.split('\n');
    const includeFnPattern = new RegExp(
      `include\\s+['"]:`
    );
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(includeFnPattern)) {
        const line = lines[i];
        const newLineSegments = [line];

        // Add iterable dependencies to the include line if they are not already
        // present
        if (!line.includes(':react-native-iterable')) {
          newLineSegments.push("':react-native-iterable'");
        }
        if (!line.includes(':iterableapi')) {
          newLineSegments.push("':iterableapi'");
        }

        lines[i] = newLineSegments.join(', ');
      }
    }
    newConfig.modResults.contents = lines.join('\n');

    return newConfig;
  });
};

export default withIterableApis;
