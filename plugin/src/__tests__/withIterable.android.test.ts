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

// Type for the result of withIterable
type WithIterableResult = ConfigWithMods & {
  mods: {
    ios: {
      infoPlist: Mod<Record<string, any>>;
    };
    android: {
      manifest: Mod<Record<string, any>>;
    };
  };
};

// Helper function to create a mock ExportedConfigWithProps
const createMockConfigWithProps = (
  modResults: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults,
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName: 'manifest',
    platform: 'android',
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
    android: {
      googleServicesFile: './google-services.json',
      package: 'com.test.app',
      intentFilters: [
        {
          action: 'MAIN',
          category: ['LAUNCHER'],
          autoVerify: true,
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'links.example.com',
              pathPrefix: '/a/',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    _internal: { projectRoot: process.cwd() },
  });

  const createMockAndroidManifest = (): Record<string, any> => ({
    manifest: {
      application: [
        { $: { 'android:name': '.MainApplication' }, activity: [{ $: {} }] },
      ],
    },
  });

  it('should set the launch mode to singleTask', async () => {
    const config = createTestConfig();
    const props: ConfigPluginProps = {
      enableInAppMessages: true,
    };

    const result = withIterable(config, props) as WithIterableResult;
    const modifiedManifest = await result.mods.android.manifest(
      createMockConfigWithProps(createMockAndroidManifest())
    );
    const manifest = modifiedManifest.modResults.manifest;

    expect(manifest.application[0].activity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $: {
            'android:launchMode': 'singleTask',
          },
        }),
      ])
    );
  });

  describe('apiKey', () => {
    it('should add `ITERABLE_API_KEY` to Android Manifest', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        apiKey: 'test-api-key',
      };

      const result = withIterable(config, props) as WithIterableResult;
      const modifiedManifest = await result.mods.android.manifest(
        createMockConfigWithProps(createMockAndroidManifest())
      );
      const manifest = modifiedManifest.modResults.manifest;

      expect(manifest.application[0]['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'ITERABLE_API_KEY',
              'android:value': 'test-api-key',
            },
          }),
        ])
      );
    });
  });

  describe('appEnvironment', () => {});

  describe('autoConfigurePushNotifications', () => {});

  describe('enableTimeSensitivePush', () => {});

  describe('requestPermissionsForPushNotifications', () => {
    it('should add `ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS` to Android Manifest', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        requestPermissionsForPushNotifications: true,
      };

      const result = withIterable(config, props) as WithIterableResult;
      const modifiedManifest = await result.mods.android.manifest(
        createMockConfigWithProps(createMockAndroidManifest())
      );
      const manifest = modifiedManifest.modResults.manifest;

      expect(manifest.application[0]['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name':
                'ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS',
              'android:value': 'true',
            },
          }),
        ])
      );
    });
  });

  describe('enableInAppMessages', () => {
    it('should add `ITERABLE_ENABLE_IN_APP_MESSAGES` to Android Manifest', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        enableInAppMessages: true,
      };

      const result = withIterable(config, props) as WithIterableResult;
      const modifiedManifest = await result.mods.android.manifest(
        createMockConfigWithProps({
          manifest: {
            application: [
              {
                $: { 'android:name': '.MainApplication' },
                activity: [],
              },
            ],
          },
        })
      );
      const manifest = modifiedManifest.modResults.manifest;

      expect(manifest.application[0]['meta-data']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'ITERABLE_ENABLE_IN_APP_MESSAGES',
              'android:value': 'true',
            },
          }),
        ])
      );
    });
  });
});
