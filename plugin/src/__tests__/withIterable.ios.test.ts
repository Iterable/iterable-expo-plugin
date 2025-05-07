// Mock console.warn to prevent warnings in test output
import { ExpoConfig } from 'expo/config';
import {
  ExportedConfigWithProps,
  Mod,
  ModPlatform,
  ModProps,
} from 'expo/config-plugins';

import withIterable from '..';
import type { ConfigPluginProps } from '../withIterable.types';
import {
  NS_POD,
  NS_TARGET_NAME,
} from '../withPushNotifications/withIosPushNotifications.constants';

const originalWarn = console.warn;
console.warn = jest.fn();

// Extend ExpoConfig to include mods
interface ConfigWithMods extends ExpoConfig {
  mods?: {
    [key in ModPlatform]?: {
      [key in string]?: Mod<any>;
    };
  };
}

// Type for the result of withIterable
type WithIterableResult = ConfigWithMods & {
  mods: {
    ios: {
      infoPlist: Mod<Record<string, any>>;
      entitlements: Mod<Record<string, any>>;
      podfile: Mod<Record<string, any>>;
      dangerous: Mod<Record<string, any>>;
    };
  };
};

// Helper function to create a mock ExportedConfigWithProps
const createMockConfigWithPlist = (
  modResults: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults,
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
  modResults: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults,
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

const createMockConfigWithPodfile = (
  modResults: Record<string, any> = { contents: '' }
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults,
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName: 'podfile',
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console.warn after all tests
    console.warn = originalWarn;
  });

  describe('apiKey', () => {
    it('should store API key in Info.plist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        apiKey: 'test-api-key',
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedInfoPlist = await result.mods.ios.infoPlist(
        createMockConfigWithPlist()
      );
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
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedEntitlements = await result.mods.ios.entitlements(
        createMockConfigWithEntitlements()
      );
      expect(modifiedEntitlements.modResults['aps-environment']).toBe(
        'development'
      );
    });
  });

  describe('autoConfigurePushNotifications', () => {
    it('should add `remote-notification` to the UIBackgroundModes', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedInfoPlist = await result.mods.ios.infoPlist(
        createMockConfigWithPlist()
      );
      expect(modifiedInfoPlist.modResults.UIBackgroundModes).toEqual(
        expect.arrayContaining(['remote-notification'])
      );
    });

    it('should not add `remote-notification` to the UIBackgroundModes if it already exists', async () => {
      const config = createTestConfig();
      // @ts-ignore
      config.ios.infoPlist.UIBackgroundModes = ['remote-notification'];
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedInfoPlist = await result.mods.ios.infoPlist(
        // @ts-ignore
        createMockConfigWithPlist(config.ios.infoPlist)
      );
      expect(
        modifiedInfoPlist.modResults.UIBackgroundModes.filter(
          (x: string) => x === 'remote-notification'
        ).length
      ).toEqual(1);
    });

    it('should add the notification to the podfile', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedPodfile = await result.mods.ios.podfile(
        createMockConfigWithPodfile()
      );
      expect(modifiedPodfile.modResults.contents).toContain(NS_TARGET_NAME);
      expect(modifiedPodfile.modResults.contents).toContain(NS_POD);
    });

    it('should not add the notification to the podfile if it already exists', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedPodfile = await result.mods.ios.podfile(
        createMockConfigWithPodfile({
          contents: `
          target '${NS_TARGET_NAME}' do
            use_frameworks!
            pod '${NS_POD}'
          end
          `,
        })
      );
      const { contents } = modifiedPodfile.modResults;
      const count = (str: string, word: string) =>
        (str.match(new RegExp(word, 'g')) || []).length;
      expect(count(contents, NS_TARGET_NAME)).toBe(1);
      expect(count(contents, NS_POD)).toBe(1);
    });
  });

  describe('enableTimeSensitivePush', () => {
    it('should add time sensitive push to the entitlements if not explicitly set to false', async () => {
      const result = withIterable(createTestConfig(), {}) as WithIterableResult;
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
      const result = withIterable(config, props) as WithIterableResult;
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
      const result = withIterable(config, props) as WithIterableResult;
      // The below is not defined as entitlements are not added anywhere
      expect(result.mods?.ios?.entitlements).not.toBeDefined();
    });
  });

  describe('requestPermissionsForPushNotifications', () => {
    it('should store requestPermissionsForPushNotifications in Info.plist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        requestPermissionsForPushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedInfoPlist = await result.mods.ios.infoPlist(
        createMockConfigWithPlist()
      );
      expect(
        modifiedInfoPlist.modResults
          .ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS
      ).toBe(true);
    });
  });
});
