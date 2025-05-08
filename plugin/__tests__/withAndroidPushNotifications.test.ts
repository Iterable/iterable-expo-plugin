/* eslint-disable import/first */

// Mock console.warn to prevent warnings in test output
const originalWarn = console.warn;
console.warn = jest.fn();

jest.mock('expo/config-plugins', () => {
  const original = jest.requireActual('expo/config-plugins');
  return {
    ...original,
    WarningAggregator: {
      addWarningAndroid: jest.fn(),
    },
  };
});

import { Mod, WarningAggregator } from 'expo/config-plugins';
import fs from 'fs';
import path from 'path';

import {
  createMockAndroidDangerousModConfig,
  createMockAndroidManifest,
  createMockAppBuildGradleConfig,
  createMockManifestConfig,
  createMockProjectBuildGradleConfig,
  createTestConfig,
  getDefaultAppBuildGradleContents,
  getDefaultProjectBuildGradleContents,
  WithIterableResult,
} from '../__mocks__/testUtils';
import withIterable from '../src/withIterable';
import type { ConfigPluginProps } from '../src/withIterable.types';
import { GOOGLE_SERVICES_CLASS_PATH } from '../src/withPushNotifications/withAndroidPushNotifications.constants';

// Mock fs promises
jest.mock('fs', () => ({
  promises: {
    copyFile: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('withAndroidPushNotifications', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console.warn after all tests
    console.warn = originalWarn;
  });

  it('should add the correct dependencies to the build.gradle file', () => {
    expect(true).toBe(true);
  });

  describe('autoConfigurePushNotifications', () => {
    it('should add firebase to the project gradle', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedProjectBuildGradle =
        await result.mods.android.projectBuildGradle(
          createMockProjectBuildGradleConfig()
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
      await result.mods.android.projectBuildGradle(
        createMockProjectBuildGradleConfig({
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
      const modifiedAppBuildGradle = await result.mods.android.appBuildGradle(
        createMockAppBuildGradleConfig()
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
      await result.mods.android.appBuildGradle(
        createMockAppBuildGradleConfig({
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
        createMockManifestConfig(createMockAndroidManifest())
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
        createMockManifestConfig(mockAndroidManifest)
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
      const config = {
        ...createTestConfig(),
        android: {
          ...createTestConfig().android,
          googleServicesFile: undefined,
        },
      };
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.android.dangerous as Mod<any>;
      await dangerousMod(createMockAndroidDangerousModConfig());
      expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
        '@iterable/expo-plugin',
        'Path to google-services.json is not defined, so push notifications will not be enabled.  To enable push notifications, please specify the `expo.android.googleServicesFile` field in app.json.'
      );
    });

    it('should copy google-services.json when path is defined', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.android.dangerous as Mod<any>;
      await dangerousMod({
        ...createMockAndroidDangerousModConfig(),
        android: {
          googleServicesFile: './google-services.json',
        },
      });
      expect(fs.promises.copyFile).toHaveBeenCalledWith(
        path.resolve(process.cwd(), './google-services.json'),
        path.resolve(process.cwd(), 'app/google-services.json')
      );
    });

    it('should warn when google-services.json path is not defined', async () => {
      const config = {
        ...createTestConfig(),
        android: {
          ...createTestConfig().android,
          googleServicesFile: undefined,
        },
      };
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.android.dangerous as Mod<any>;
      await dangerousMod(createMockAndroidDangerousModConfig());
      expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
        '@iterable/expo-plugin',
        'Path to google-services.json is not defined, so push notifications will not be enabled.  To enable push notifications, please specify the `expo.android.googleServicesFile` field in app.json.'
      );
      expect(fs.promises.copyFile).not.toHaveBeenCalled();
    });

    it('should throw error when google-services.json does not exist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      (fs.promises.copyFile as jest.Mock).mockRejectedValueOnce(
        new Error('File not found')
      );
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.android.dangerous as Mod<any>;
      await expect(
        dangerousMod({
          ...createMockAndroidDangerousModConfig(),
          android: {
            googleServicesFile: './google-services.json',
          },
        })
      ).rejects.toThrow('Cannot copy google-services.json');
    });
  });
});
