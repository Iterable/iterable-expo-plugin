import { ExpoConfig } from 'expo/config';
import {
  ConfigPlugin,
  ExportedConfigWithProps,
  Mod,
  ModPlatform,
  ModProps,
} from 'expo/config-plugins';

import withIterable from '../withIterable';
import type {
  ConfigPluginProps,
  ConfigPluginPropsWithDefaults,
} from '../withIterable.types';

// Extend ExpoConfig to include mods
interface ConfigWithMods extends ExpoConfig {
  mods?: {
    [key in ModPlatform]?: {
      [key in string]?: Mod<any>;
    };
  };
}

// Type for the result of withStoreValuesOnIos
type WithIterableResult = ConfigWithMods & {
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
  const createTestConfig = (): ConfigWithMods => ({
    name: 'TestApp',
    slug: 'test-app',
    ios: { infoPlist: {} },
    _internal: { projectRoot: process.cwd() },
  });

  it('should render the correct defaults if no config is provided', async () => {
    const config = createTestConfig();
    const props: ConfigPluginPropsWithDefaults = {
      apiKey: 'test-api-key',
      appEnvironment: 'development',
      autoConfigurePushNotifications: false,
      enableTimeSensitivePush: false,
      requestPermissionsForPushNotifications: false,
      enableInAppMessages: false,
    };
    // @ts-expect-error
    const result = withIterable(config) as WithIterableResult;
    const modifiedInfoPlist = await result.mods.ios.infoPlist(
      createMockConfigWithProps()
    );
    const infoPlist = modifiedInfoPlist.modResults;
  });

  describe('apiKey', () => {
    it('should add `ITERABLE_API_KEY` to Info.plist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        apiKey: 'test-api-key',
      };
      const result = withIterable(config, props) as WithIterableResult;
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
  });

  describe('appEnvironment', () => {});

  describe('autoConfigurePushNotifications', () => {
    it('should add `ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS` to Info.plist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: false,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedInfoPlist = await result.mods.ios.infoPlist(
        createMockConfigWithProps()
      );
      const infoPlist = modifiedInfoPlist.modResults;
      expect(infoPlist).toEqual(
        expect.objectContaining({
          ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS: false,
        })
      );
    });
  });

  describe('enableTimeSensitivePush', () => {});

  describe('requestPermissionsForPushNotifications', () => {});

  describe('enableInAppMessages', () => {
    it('should add `ITERABLE_ENABLE_IN_APP_MESSAGES` to Info.plist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        enableInAppMessages: false,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedInfoPlist = await result.mods.ios.infoPlist(
        createMockConfigWithProps()
      );
      const infoPlist = modifiedInfoPlist.modResults;
      expect(infoPlist).toEqual(
        expect.objectContaining({
          ITERABLE_ENABLE_IN_APP_MESSAGES: false,
        })
      );
    });
  });
});
