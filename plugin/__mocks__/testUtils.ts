import { ExpoConfig } from 'expo/config';
import {
  ExportedConfigWithProps,
  Mod,
  ModPlatform,
  ModProps,
} from 'expo/config-plugins';

// Extend ExpoConfig to include mods
export interface ConfigWithMods extends ExpoConfig {
  mods?: {
    [key in ModPlatform]?: {
      [key in string]?: Mod<any>;
    };
  };
}

// Type for the result of withIterable
export type WithIterableResult = ConfigWithMods & {
  mods: {
    ios: {
      infoPlist: Mod<Record<string, any>>;
      entitlements: Mod<Record<string, any>>;
      podfile: Mod<Record<string, any>>;
      dangerous: Mod<Record<string, any>>;
      xcodeproj: Mod<any>;
    };
    android: {
      manifest: Mod<Record<string, any>>;
      projectBuildGradle: Mod<Record<string, any>>;
      appBuildGradle: Mod<Record<string, any>>;
      dangerous: Mod<Record<string, any>>;
    };
  };
};

/**
 * Creates a function that generates mock config objects for a given platform.
 * @param platform - The platform to create the mock config for.
 * @returns A function that generates mock config objects for the given platform.
 */
const createConfigFunction =
  (platform: ModPlatform) =>
  (modName: string): ExportedConfigWithProps<Record<string, any>> => ({
    modResults: {},
    modRequest: {
      projectRoot: process.cwd(),
      platformProjectRoot: process.cwd(),
      modName,
      platform,
      introspect: true,
      severity: 'info',
    } as ModProps<Record<string, any>>,
    modRawConfig: { name: 'TestApp', slug: 'test-app' },
    name: 'TestApp',
    slug: 'test-app',
  });

/**
 * Creates a mock config object for the iOS platform.
 * @param modName - The name of the module to create the mock config for.
 * @returns A mock config object for the iOS platform.
 */
export const createMockIosConfig = createConfigFunction('ios');

/**
 * Creates a mock config object for the Android platform.
 * @param modName - The name of the module to create the mock config for.
 * @returns A mock config object for the Android platform.
 */
export const createMockConfig = (
  modName: string
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults: {},
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName,
    platform: 'android',
    introspect: true,
    severity: 'info',
  } as ModProps<Record<string, any>>,
  modRawConfig: { name: 'TestApp', slug: 'test-app' },
  name: 'TestApp',
  slug: 'test-app',
});

/**
 * Creates a mock config object for the Info.plist file.
 * @param modResults - The results of the module to create the mock config for.
 * @returns A mock config object for the Info.plist file.
 */
export const createMockPlistConfig = (
  modResults: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  ...createMockIosConfig('infoPlist'),
  modResults,
});

/**
 * Creates a mock config object for the Android manifest file.
 * @param modResults - The results of the module to create the mock config for.
 * @returns A mock config object for the Android manifest file.
 */
export const createMockManifestConfig = (
  modResults: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  ...createMockConfig('manifest'),
  modResults,
});

/**
 * Creates a mock Android manifest object.
 * @returns A mock Android manifest object.
 */
export const createMockAndroidManifest = (): Record<string, any> => ({
  manifest: {
    application: [
      { $: { 'android:name': '.MainApplication' }, activity: [{ $: {} }] },
    ],
  },
});

/**
 * Creates a test config object.  This should be passed as the first argument
 * to the config plugin functions.
 * @returns A test config object.
 */
export const createTestConfig = (): ConfigWithMods => ({
  name: 'TestApp',
  slug: 'test-app',
  ios: { infoPlist: {}, entitlements: {} },
  android: { googleServicesFile: './__mocks__/google-services.json' },
  _internal: { projectRoot: process.cwd() },
});
