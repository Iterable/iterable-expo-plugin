import { ExpoConfig } from 'expo/config';
import {
  ExportedConfigWithProps,
  Mod,
  ModPlatform,
  ModProps,
} from 'expo/config-plugins';

import withIterable from '..';
import type { ConfigPluginProps } from '../withIterable.types';

// Extend ExpoConfig to include mods
interface ConfigWithMods extends ExpoConfig {
  mods?: {
    [key in ModPlatform]?: {
      [key in string]?: Mod<any>;
    };
  };
}

// Helper function to create a mock ExportedConfigWithProps
const createMockConfigWithPlist = (
  data: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults: data,
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

const createMockConfigWithEntitlements = (
  data: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults: data,
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName: 'entitlements',
    platform: 'ios',
    introspect: true,
    severity: 'info',
  } as ModProps<Record<string, any>>,
  modRawConfig: { name: 'TestApp', slug: 'test-app' },
  name: 'TestApp',
  slug: 'test-app',
});

const createTestConfig = (): ConfigWithMods => ({
  name: 'TestApp',
  slug: 'test-app',
  ios: { infoPlist: {}, entitlements: {} },
  android: { googleServicesFile: './__mocks__/google-services.json' },
  _internal: { projectRoot: process.cwd() },
});

describe('withIterable', () => {
  describe('apiKey', () => {
    it('should store API key in Info.plist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        apiKey: 'test-api-key',
      };
      const result = withIterable(config, props);
      // @ts-ignore
      const modifiedInfoPlist = await result.mods.ios.infoPlist({});
      expect(modifiedInfoPlist.modResults.ITERABLE_API_KEY).toBe(
        'test-api-key'
      );
    });
  });

  describe('appEnvironment', () => {
    it('should add the correct app environment to the entitlements', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        appEnvironment: 'development',
      };
      const result = withIterable(config, props);
      // @ts-ignore
      const modifiedEntitlements = await result.mods.ios.entitlements(
        createMockConfigWithEntitlements()
      );
      expect(modifiedEntitlements.modResults['aps-environment']).toBe(
        'development'
      );
    });
  });

  describe('autoConfigurePushNotifications', () => {});

  describe('enableTimeSensitivePush', () => {
    it('should add time sensitive push to the entitlements if not explicitly set to false', async () => {
      const result = withIterable(createTestConfig(), {});
      // @ts-ignore
      const modifiedEntitlements = await result.mods.ios.entitlements(
        createMockConfigWithEntitlements()
      );
      expect(
        modifiedEntitlements.modResults[
          'com.apple.developer.usernotifications.time-sensitive'
        ]
      ).toBe(true);
    });

    it('should not add time sensitive push to the entitlements if explicitly set to false', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        enableTimeSensitivePush: false,
      };
      const result = withIterable(config, props);
      // @ts-ignore
      const modifiedEntitlements = await result.mods.ios.entitlements(
        createMockConfigWithEntitlements()
      );
      expect(
        modifiedEntitlements.modResults[
          'com.apple.developer.usernotifications.time-sensitive'
        ]
      ).not.toBeDefined();
    });

    it('should not add time sensitive push to the entitlements if `autoConfigurePushNotifications` is false', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        enableTimeSensitivePush: true,
        autoConfigurePushNotifications: false,
      };
      const result = withIterable(config, props);
      // The below is not defined as entitlements are not added anywhere
      // @ts-ignore
      expect(result.mods?.ios?.entitlements).not.toBeDefined();
    });
  });

  describe('requestPermissionsForPushNotifications', () => {
    it('should store requestPermissionsForPushNotifications in Info.plist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        requestPermissionsForPushNotifications: true,
      };
      const result = withIterable(config, props);
      // @ts-ignore
      const modifiedInfoPlist = await result.mods.ios.infoPlist({});
      expect(
        modifiedInfoPlist.modResults
          .ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS
      ).toBe(true);
    });
  });
});
