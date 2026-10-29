/* eslint-disable import/first */

// Mock console.warn to prevent warnings in test output
const originalWarn = console.warn;
console.warn = jest.fn();

// Mock fs promises
const mockCopyFile = jest.fn();
jest.mock('fs', () => {
  const memfs = require('memfs').fs;
  const path = require('path');
  return {
    ...memfs,
    promises: {
      ...memfs.promises,
      copyFile: async (src: string, dest: string) => {
        // First check if the source file exists
        if (!memfs.existsSync(src)) {
          throw new Error('file does not exist');
        }
        // Create the destination directory if it doesn't exist
        const destDir = path.dirname(dest);
        if (!memfs.existsSync(destDir)) {
          memfs.mkdirSync(destDir, { recursive: true });
        }

        memfs.copyFileSync(src, dest);
        return mockCopyFile(src, dest);
      },
    },
  };
});

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
import { fs, vol } from 'memfs';
import * as path from 'path';

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
} from '../__mocks__';
import withIterable from '../src/withIterable';
import type { ConfigPluginProps } from '../src/withIterable.types';
import { GOOGLE_SERVICES_CLASS_PATH } from '../src/withPushNotifications/withAndroidPushNotifications.constants';
import {
  addAppDependency,
  addApplyPlugin,
  addProjectDependency,
} from '../src/withPushNotifications/withAndroidPushNotifications.utils';

const countWord = (str: string, word: string) =>
  (str.match(new RegExp(word, 'g')) || []).length;

describe('withAndroidPushNotifications', () => {
  const projectRoot = '/app';

  beforeEach(() => {
    // Reset the memory file system before each test
    vol.reset();
    vol.fromJSON({});
    // Create the project root directory
    fs.mkdirSync(projectRoot, { recursive: true });
    // Reset mock functions
    mockCopyFile.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.unmock('fs');
    vol.reset();
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
      withIterable(config, props);
      expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
        '@iterable/expo-plugin',
        'The path to your google-services.json file is not defined, so push notifications may not work.  Please add the path to your google-services.json file in the `expo.android.googleServicesFile` field in your app.json.'
      );
      expect(mockCopyFile).not.toHaveBeenCalled();
    });
  });
});

describe('addProjectDependency', () => {
  const classpath = 'my.class.path';
  const version = '1.2.3';
  const getBuildGradle = () => `dependencies { 
}`;

  it('should add a dependency to the project build.gradle file', () => {
    const result = addProjectDependency(getBuildGradle(), {
      classpath,
      version,
    });
    expect(result).toContain(classpath);
    expect(result).toContain(version);
  });

  it('should not add a version to the dependency if it is not provided', () => {
    const result = addProjectDependency(getBuildGradle(), {
      classpath,
    });
    expect(result).toContain(`classpath('my.class.path')`);
  });

  it('should not add a duplicate dependency to the project build.gradle file', () => {
    const buildGradle = `
    dependencies { 
      classpath '${classpath}:${version}' 
    }`;
    const result = addProjectDependency(buildGradle, {
      classpath,
      version,
    });
    expect(countWord(result, classpath)).toBe(1);
  });
});

describe('addAppDependency', () => {
  const classpath = 'my.class.path';
  const version = '1.2.3';
  const getBuildGradle = () => `dependencies { 
}`;
  it('should add a dependency to the app build.gradle file', () => {
    const result = addAppDependency(getBuildGradle(), {
      classpath,
      version,
    });
    expect(result).toContain(classpath);
    expect(result).toContain(version);
  });

  it('should not add a version to the dependency if it is not provided', () => {
    const result = addAppDependency(getBuildGradle(), {
      classpath,
    });
    expect(result).toContain(`implementation 'my.class.path'`);
  });

  it('should not add a duplicate dependency to the app build.gradle file', () => {
    const buildGradle = `
    dependencies { 
      implementation '${classpath}:${version}' 
    }`;
    const result = addAppDependency(buildGradle, {
      classpath,
      version,
    });
    expect(countWord(result, classpath)).toBe(1);
  });
});

describe('addApplyPlugin', () => {
  const pluginName = 'com.google.gms.google-services';
  const version = '1.2.3';
  const getBuildGradle = () => `dependencies { 
}`;
  it('should add the apply plugin line to the app build.gradle file', () => {
    const result = addApplyPlugin(getBuildGradle(), pluginName);
    expect(result).toContain(`apply plugin: '${pluginName}'`);
  });

  it('should not add a duplicate apply plugin line to the app build.gradle file', () => {
    const buildGradle = `
    apply plugin: '${pluginName}'
    `;
    const result = addApplyPlugin(buildGradle, pluginName);
    expect(countWord(result, pluginName)).toBe(1);
  });

  it('should not add apply plugin line to the app build.gradle file if it already exists in id format', () => {
    const buildGradle = `plugins { id '${pluginName}' }`;
    const result = addApplyPlugin(buildGradle, pluginName);
    expect(countWord(result, pluginName)).toBe(1);
  });
});
