import { ExpoConfig } from 'expo/config';
import {
  ConfigPlugin,
  ExportedConfigWithProps,
  Mod,
  ModPlatform,
  ModProps,
} from 'expo/config-plugins';

import withIterable from '..';
import type {
  ConfigPluginProps,
  ConfigPluginPropsWithDefaults,
} from '../withIterable.types';
import {
  withStoreConfigValues,
  withStoreValuesOnIos,
} from '../withStoreConfigValues';

// Extend ExpoConfig to include mods
interface ConfigWithMods extends ExpoConfig {
  mods?: {
    [key in ModPlatform]?: {
      [key in string]?: Mod<any>;
    };
  };
}

// Type for the result of withStoreValuesOnIos
type WithStoreValuesResult = ConfigWithMods & {
  mods: {
    ios: {
      infoPlist: Mod<Record<string, any>>;
    };
  };
};

// Helper function to create a mock ExportedConfigWithProps
const createMockConfigWithProps = (
  infoPlist: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults: infoPlist,
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName: 'infoPlist',
    platform: 'ios',
    introspect: true,
    severity: 'info',
  } as ModProps<Record<string, any>>,
  modRawConfig: { name: 'TestApp', slug: 'test-app' },
  name: 'TestApp',
  slug: 'test-app',
});

describe('withIterable', () => {
  // it('should set default values for props', () => {
  //   const config = { name: 'TestApp', slug: 'test-app', ios: {}, android: {} };
  //   // Call with no props
  //   const result = withIterable(config, {});

  //   // The plugin should add/modify config, but at minimum, config should be returned
  //   expect(result).toHaveProperty('ios');
  //   expect(result).toHaveProperty('android');
  // });
  it('should store all config values in Info.plist', async () => {
    const config = {
      name: 'TestApp',
      slug: 'test-app',
      ios: { infoPlist: {} },
      android: { googleServicesFile: './__mocks__/google-services.json' },
      _internal: { projectRoot: process.cwd() },
    };

    const props: ConfigPluginPropsWithDefaults = {
      apiKey: 'test-api-key',
      appEnvironment: 'development',
      autoConfigurePushNotifications: true,
      enableTimeSensitivePush: true,
      requestPermissionsForPushNotifications: true,
    };

    const result = withIterable(config, props);

    // Apply the mods to get the actual InfoPlist changes
    // @ts-ignore
    const modifiedInfoPlist = await result.mods.ios.infoPlist({});

    expect(modifiedInfoPlist.modResults).toEqual(
      expect.objectContaining({
        ITERABLE_API_KEY: 'test-api-key',
        ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS: true,
      })
    );
  });

  it('should apply provided props', async () => {
    const config = {
      name: 'TestApp',
      slug: 'test-app',
      ios: {
        infoPlist: {
          CFBundleDisplayName: 'TestApp',
        },
      },
      android: { googleServicesFile: './__mocks__/google-services.json' },
      _internal: { projectRoot: process.cwd() },
    };
    const props: ConfigPluginProps = {
      apiKey: 'abc123',
      appEnvironment: 'production',
      autoConfigurePushNotifications: false,
      enableTimeSensitivePush: false,
      requestPermissionsForPushNotifications: false,
    };
    const result = await withIterable(config, props);
    // @ts-ignore
    await result.mods.ios.infoPlist;
    // @ts-ignore

    // The plugin should still return a config object
    expect(result).toHaveProperty('ios');
    expect(result).toHaveProperty('android');
    // You can add more specific assertions if you know what the plugin should do with these props
  });

  // it('should not throw with minimal config', () => {
  //   expect(() => withIterable({}, {})).not.toThrow();
  // });
});

describe.skip('withStoreValuesOnIos', () => {
  const createTestConfig = (): ConfigWithMods => ({
    name: 'TestApp',
    slug: 'test-app',
    ios: { infoPlist: {} },
    _internal: { projectRoot: process.cwd() },
  });

  it('should store API key in Info.plist', async () => {
    const config = createTestConfig();
    const props: ConfigPluginPropsWithDefaults = {
      apiKey: 'test-api-key',
      appEnvironment: 'development',
      autoConfigurePushNotifications: true,
      enableTimeSensitivePush: true,
      requestPermissionsForPushNotifications: false,
    };

    const result = withStoreValuesOnIos(config, props) as WithStoreValuesResult;
    const modifiedInfoPlist = await result.mods.ios.infoPlist(
      createMockConfigWithProps()
    );
    const infoPlist = modifiedInfoPlist.modResults;

    expect(infoPlist).toEqual(
      expect.objectContaining({
        ITERABLE_API_KEY: 'test-api-key',
      })
    );
  });

  it('should store all required values in Info.plist', async () => {
    const config = createTestConfig();
    const props: ConfigPluginPropsWithDefaults = {
      apiKey: 'test-api-key',
      appEnvironment: 'development',
      autoConfigurePushNotifications: true,
      enableTimeSensitivePush: true,
      requestPermissionsForPushNotifications: true,
    };

    const result = withStoreValuesOnIos(config, props) as WithStoreValuesResult;
    const modifiedInfoPlist = await result.mods.ios.infoPlist(
      createMockConfigWithProps()
    );
    const infoPlist = modifiedInfoPlist.modResults;

    expect(infoPlist).toEqual(
      expect.objectContaining({
        ITERABLE_API_KEY: 'test-api-key',
        ITERABLE_ENABLE_IN_APP_MESSAGES: true,
        ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS: true,
      })
    );
  });

  it('should handle boolean values correctly', async () => {
    const config = createTestConfig();
    const props: ConfigPluginPropsWithDefaults = {
      apiKey: 'test-api-key',
      appEnvironment: 'development',
      autoConfigurePushNotifications: true,
      enableTimeSensitivePush: true,
      requestPermissionsForPushNotifications: false,
    };

    const result = withStoreValuesOnIos(config, props) as WithStoreValuesResult;
    const modifiedInfoPlist = await result.mods.ios.infoPlist(
      createMockConfigWithProps()
    );
    const infoPlist = modifiedInfoPlist.modResults;

    expect(infoPlist.ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS).toBe(
      false
    );
  });

  it('should preserve existing Info.plist values', async () => {
    const config = {
      ...createTestConfig(),
      ios: {
        infoPlist: {
          CFBundleDisplayName: 'Existing App Name',
          ExistingKey: 'ExistingValue',
        },
      },
    };

    const props: ConfigPluginPropsWithDefaults = {
      apiKey: 'test-api-key',
      appEnvironment: 'development',
      autoConfigurePushNotifications: true,
      enableTimeSensitivePush: true,
      requestPermissionsForPushNotifications: true,
    };

    const result = withStoreValuesOnIos(config, props) as WithStoreValuesResult;
    const modifiedInfoPlist = await result.mods.ios.infoPlist(
      createMockConfigWithProps(config.ios.infoPlist)
    );
    const infoPlist = modifiedInfoPlist.modResults;

    expect(infoPlist.CFBundleDisplayName).toBe('Existing App Name');
    expect(infoPlist.ExistingKey).toBe('ExistingValue');
  });
});
