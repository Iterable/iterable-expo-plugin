// Mock console.warn to prevent warnings in test output
const originalWarn = console.warn;
console.warn = jest.fn();

// Mock WarningAggregator before any imports
/* eslint-disable import/first */
jest.mock('expo/config-plugins', () => {
  const original = jest.requireActual('expo/config-plugins');
  return {
    ...original,
    WarningAggregator: {
      addWarningAndroid: jest.fn(),
    },
  };
});

import { ExpoConfig } from 'expo/config';
import {
  ExportedConfigWithProps,
  Mod,
  ModPlatform,
  ModProps,
  WarningAggregator,
} from 'expo/config-plugins';

import withIterable from '..';
import type { ConfigPluginProps } from '../withIterable.types';
import { GOOGLE_SERVICES_CLASS_PATH } from '../withPushNotifications/withAndroidPushNotifications.constants';

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
const createMockManifestConfigWithProps = (
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

const getDefaultProjectBuildGradleContents = () => `
  dependencies { 
  }
  `;

const createMockProjectBuildGradleConfigWithProps = (
  modResults: Record<string, any> = {
    contents: getDefaultProjectBuildGradleContents(),
    language: 'groovy',
  }
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults,
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName: 'projectBuildGradle',
    platform: 'android',
    introspect: true,
    severity: 'info',
  } as ModProps<Record<string, any>>,
  modRawConfig: { name: 'TestApp', slug: 'test-app' },
  name: 'TestApp',
  slug: 'test-app',
});

const getDefaultAppBuildGradleContents = () => `
dependencies { 
}
`;

const createMockAppBuildGradleConfigWithProps = (
  modResults: Record<string, any> = {
    contents: getDefaultAppBuildGradleContents(),
    language: 'groovy',
  }
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults,
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName: 'appBuildGradle',
    platform: 'android',
    introspect: true,
    severity: 'info',
  } as ModProps<Record<string, any>>,
  modRawConfig: { name: 'TestApp', slug: 'test-app' },
  name: 'TestApp',
  slug: 'test-app',
});

describe('withIterable', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console.warn after all tests
    console.warn = originalWarn;
  });

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

  it('should set the launch mode to singleTask if activities exist', async () => {
    const config = createTestConfig();
    const props: ConfigPluginProps = {};

    const result = withIterable(config, props) as WithIterableResult;
    const modifiedManifest = await result.mods.android.manifest(
      createMockManifestConfigWithProps(createMockAndroidManifest())
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

  it('should not set the launch mode to singleTask if activities do not exist', async () => {
    const config = createTestConfig();
    const props: ConfigPluginProps = {};

    const result = withIterable(config, props) as WithIterableResult;
    const modifiedManifest = await result.mods.android.manifest(
      createMockManifestConfigWithProps({
        manifest: {
          application: [
            { $: { 'android:name': '.MainApplication' }, activity: [] },
          ],
        },
      })
    );
    const manifest = modifiedManifest.modResults.manifest;

    expect(manifest.application[0].activity).not.toEqual(
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
        createMockManifestConfigWithProps(createMockAndroidManifest())
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

  describe('autoConfigurePushNotifications', () => {
    it('should add firebase to the project gradle', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedProjectBuildGradle =
        // @ts-ignore
        await result.mods.android.projectBuildGradle(
          createMockProjectBuildGradleConfigWithProps()
        );
      const projectBuildGradle = modifiedProjectBuildGradle.modResults.contents;

      expect(projectBuildGradle).toContain(GOOGLE_SERVICES_CLASS_PATH);
    });

    it('should warn the user if the project gradle is not groovy', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };

      const result = withIterable(config, props) as WithIterableResult;
      // @ts-ignore
      await result.mods.android.projectBuildGradle(
        createMockProjectBuildGradleConfigWithProps({
          contents: getDefaultProjectBuildGradleContents(),
          language: 'kotlin',
        })
      );

      expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
        '@iterable/expo-plugin',
        "Cannot automatically configure project build.gradle if it's not groovy"
      );
    });

    it('should add dependencies to the app gradle', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedAppBuildGradle =
        // @ts-ignore
        await result.mods.android.appBuildGradle(
          createMockAppBuildGradleConfigWithProps()
        );
      const { contents } = modifiedAppBuildGradle.modResults;
      expect(contents).toContain(
        `implementation platform('com.google.firebase:firebase-bom`
      );
      expect(contents).toContain(
        `implementation 'com.google.firebase:firebase-messaging'`
      );
      expect(contents).toContain(
        `apply plugin: 'com.google.gms.google-services'`
      );
    });

    it('should warn the user if the app gradle is not groovy', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };

      const result = withIterable(config, props) as WithIterableResult;
      // @ts-ignore
      await result.mods.android.appBuildGradle(
        createMockAppBuildGradleConfigWithProps({
          contents: getDefaultAppBuildGradleContents(),
          language: 'kotlin',
        })
      );

      expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
        '@iterable/expo-plugin',
        "Cannot automatically configure app build.gradle if it's not groovy"
      );
    });

    it('should add the POST_NOTIFICATIONS permission to the manifest', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };

      const result = withIterable(config, props) as WithIterableResult;
      const modifiedManifest = await result.mods.android.manifest(
        createMockManifestConfigWithProps(createMockAndroidManifest())
      );
      const manifest = modifiedManifest.modResults.manifest;
      expect(manifest['uses-permission']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $: {
              'android:name': 'android.permission.POST_NOTIFICATIONS',
            },
          }),
        ])
      );
    });

    it('should not add a duplicate POST_NOTIFICATIONS permission to the manifest', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const mockAndroidManifest = createMockAndroidManifest();
      mockAndroidManifest.manifest['uses-permission'] = [
        {
          $: { 'android:name': 'android.permission.POST_NOTIFICATIONS' },
        },
      ];
      const modifiedManifest = await result.mods.android.manifest(
        createMockManifestConfigWithProps(mockAndroidManifest)
      );
      const manifest = modifiedManifest.modResults.manifest;
      const num = manifest['uses-permission'].reduce((previous, current) => {
        if (
          current['$']['android:name'] ===
          'android.permission.POST_NOTIFICATIONS'
        ) {
          return previous + 1;
        }
        return previous;
      }, 0);
      expect(num).toBe(1);
    });

    it('should warn the user if the google-services.json file is not found', async () => {
      const config = createTestConfig();
      // @ts-ignore
      delete config.android.googleServicesFile;
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      await result.mods.android.manifest(
        createMockManifestConfigWithProps(createMockAndroidManifest())
      );
      expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
        '@iterable/expo-plugin',
        'Path to google-services.json is not defined, so push notifications will not be enabled.  To enable push notifications, please specify the `expo.android.googleServicesFile` field in app.json.'
      );
    });
  });

  describe('requestPermissionsForPushNotifications', () => {
    it('should add `ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS` to Android Manifest', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        requestPermissionsForPushNotifications: true,
      };

      const result = withIterable(config, props) as WithIterableResult;
      const modifiedManifest = await result.mods.android.manifest(
        createMockManifestConfigWithProps(createMockAndroidManifest())
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
});
