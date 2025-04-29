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
import { NS_TARGET_NAME } from '../withPushNotifications/withIosPushNotifications.constants';

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
  modRequest: {
    platform: 'ios',
    projectRoot: '/test',
    modName: 'test',
    platformProjectRoot: '/test/ios',
    introspect: true,
  },
  modResults: {
    contents: '# Podfile contents',
  },
  modRawConfig: { name: 'TestApp', slug: 'test-app' },
  name: 'TestApp',
  slug: 'test-app',
});

describe('withIterable', () => {
  const createTestConfig = (): ConfigWithMods => ({
    name: 'TestApp',
    slug: 'test-app',
    ios: { infoPlist: {} },
    android: { googleServicesFile: 'test-google-services.json' },
    _internal: { projectRoot: process.cwd() },
  });

  it('should not throw an error if there are no existing mod results', async () => {
    async function runTest() {
      // @ts-ignore
      const result = withIterable(createTestConfig()) as WithIterableResult;
      const mockConfigWithProps = createMockConfigWithProps();
      // @ts-ignore
      delete mockConfigWithProps.modResults;
      return result.mods.ios.infoPlist(mockConfigWithProps);
    }
    await expect(runTest()).resolves.not.toThrow();
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
    // @ts-ignore
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
    describe('true', () => {
      it('should add remote notifications background mode', async () => {
        const config = createTestConfig();
        const props: ConfigPluginProps = {
          autoConfigurePushNotifications: true,
        };
        const result = withIterable(config, props) as WithIterableResult;
        const modifiedInfoPlist = await result.mods.ios.infoPlist(
          createMockConfigWithProps()
        );
        const infoPlist = modifiedInfoPlist.modResults;
        expect(infoPlist).toEqual(
          expect.objectContaining({
            UIBackgroundModes: ['remote-notification'],
          })
        );
      });

      it('should add a reference to the notification service extension in the pod file if it is not already present', async () => {
        const config = createTestConfig();
        const props: ConfigPluginProps = {
          autoConfigurePushNotifications: true,
        };
        const result = withIterable(config, props) as WithIterableResult;
        const modifiedPodfile = await result.mods.ios?.podfile?.(
          createMockConfigWithProps()
        );
        expect(modifiedPodfile?.modResults.contents).toContain(NS_TARGET_NAME);
        expect(modifiedPodfile?.modResults.contents).toContain(
          `pod 'Iterable-iOS-AppExtensions'`
        );
      });

      it('should not add the notification service extension target if it is already present', async () => {
        const config = createTestConfig();
        const props: ConfigPluginProps = {
          autoConfigurePushNotifications: true,
        };
        const result = withIterable(config, props) as WithIterableResult;
        const mockConfig = createMockConfigWithProps();
        mockConfig.modResults.contents = `
          ${mockConfig.modResults.contents}

          target '${NS_TARGET_NAME}' do
            pod 'Iterable-iOS-AppExtensions'
          end
        `;
        const modifiedPodfile = await result.mods.ios?.podfile?.(mockConfig);

        const countOccurrences = (str, word) => {
          const regex = new RegExp(word, 'g');
          const matches = str.match(regex);
          return matches ? matches.length : 0;
        };

        expect(modifiedPodfile?.modResults.contents).toContain(NS_TARGET_NAME);
        expect(
          countOccurrences(modifiedPodfile?.modResults.contents, NS_TARGET_NAME)
        ).toBe(1);
      });
    });

    describe('false', () => {
      it('should not add remote notifications background mode', async () => {
        const config = createTestConfig();
        const props: ConfigPluginProps = {
          autoConfigurePushNotifications: false,
        };
        const result = withIterable(config, props) as WithIterableResult;
        const modifiedInfoPlist = await result.mods.ios.infoPlist(
          createMockConfigWithProps()
        );
        const infoPlist = modifiedInfoPlist.modResults;
        expect(infoPlist).not.toEqual(
          expect.objectContaining({
            UIBackgroundModes: ['remote-notification'],
          })
        );
      });
    });
  });

  describe('enableTimeSensitivePush', () => {});

  describe('requestPermissionsForPushNotifications', () => {
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
