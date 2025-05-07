// Mock fs before any imports
// Mock console.warn to prevent warnings in test output
import { ExpoConfig } from 'expo/config';
import {
  ExportedConfigWithProps,
  Mod,
  ModPlatform,
  ModProps,
} from 'expo/config-plugins';
import fs from 'fs';
import path from 'path';
import { XcodeProject } from 'xcode';

import withIterable from '..';
import type { ConfigPluginProps } from '../withIterable.types';
import {
  NS_POD,
  NS_TARGET_NAME,
  NS_MAIN_FILE_NAME,
  NS_PLIST_FILE_NAME,
  NS_ENTITLEMENTS_FILE_NAME,
} from '../withPushNotifications/withIosPushNotifications.constants';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFile: jest.fn(),
  promises: {
    readFile: jest.fn(),
  },
}));

jest.mock('xcode', () => ({
  XcodeProject: jest.fn().mockImplementation(() => ({
    pbxTargetByName: jest.fn(),
    pbxGroupByName: jest.fn(),
    hash: {
      project: {
        objects: {
          PBXTargetDependency: {},
          PBXContainerItemProxy: {},
          PBXGroup: {},
          XCBuildConfiguration: {},
        },
      },
    },
    addTarget: jest.fn().mockReturnValue({ uuid: 'test-target-uuid' }),
    addPbxGroup: jest.fn().mockReturnValue({ uuid: 'test-group-uuid' }),
    addToPbxGroup: jest.fn(),
    addBuildPhase: jest.fn(),
  })),
}));

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
      xcodeproj: Mod<any>;
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

const createMockConfigWithDangerousMod = (
  modResults: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults,
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName: 'dangerous',
    platform: 'ios',
    introspect: true,
    severity: 'info',
  } as ModProps<Record<string, any>>,
  modRawConfig: { name: 'TestApp', slug: 'test-app' },
  name: 'TestApp',
  slug: 'test-app',
});

const createMockConfigWithXcodeMod = (
  modResults: Record<string, any> = {}
): ExportedConfigWithProps<Record<string, any>> => ({
  modResults,
  modRequest: {
    projectRoot: process.cwd(),
    platformProjectRoot: process.cwd(),
    modName: 'xcodeproj',
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

    it('should create the notification service folder if it does not exist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.ios.dangerous as Mod<any>;
      await dangerousMod({
        modResults: {},
        modRequest: {
          projectRoot: process.cwd(),
          platformProjectRoot: process.cwd(),
          modName: 'dangerous',
          platform: 'ios',
          introspect: true,
        },
        modRawConfig: { name: 'TestApp', slug: 'test-app' },
        name: 'TestApp',
        slug: 'test-app',
      });

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.resolve(process.cwd(), NS_TARGET_NAME)
      );
    });

    it('should not create the notification service folder if it already exists', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.ios.dangerous as Mod<any>;
      await dangerousMod(createMockConfigWithDangerousMod());

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should create all required files if they do not exist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.ios.dangerous as Mod<any>;
      await dangerousMod(createMockConfigWithDangerousMod());

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.resolve(process.cwd(), NS_TARGET_NAME, NS_MAIN_FILE_NAME),
        expect.any(String)
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.resolve(process.cwd(), NS_TARGET_NAME, NS_PLIST_FILE_NAME),
        expect.any(String)
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.resolve(process.cwd(), NS_TARGET_NAME, NS_ENTITLEMENTS_FILE_NAME),
        expect.any(String)
      );
    });

    it('should not create files if they already exist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.ios.dangerous as Mod<any>;
      await dangerousMod(createMockConfigWithDangerousMod());

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should skip if target already exists', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const xcodeMod = result.mods.ios.xcodeproj as Mod<any>;
      const mockXcodeProject = new XcodeProject();
      (mockXcodeProject.pbxTargetByName as jest.Mock).mockReturnValue({
        uuid: 'existing-target',
      });

      await xcodeMod({
        modResults: mockXcodeProject,
        modRequest: {
          projectRoot: process.cwd(),
          platformProjectRoot: process.cwd(),
          modName: 'xcodeproj',
          platform: 'ios',
          introspect: true,
        },
        modRawConfig: { name: 'TestApp', slug: 'test-app' },
        name: 'TestApp',
        slug: 'test-app',
      });

      expect(mockXcodeProject.addTarget).not.toHaveBeenCalled();
      expect(mockXcodeProject.addPbxGroup).not.toHaveBeenCalled();
      expect(mockXcodeProject.addBuildPhase).not.toHaveBeenCalled();
    });

    it('should create new target and group if they do not exist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const xcodeMod = result.mods.ios.xcodeproj as Mod<any>;
      const mockXcodeProject = new XcodeProject();
      (mockXcodeProject.pbxTargetByName as jest.Mock).mockReturnValue(null);
      (mockXcodeProject.pbxGroupByName as jest.Mock).mockReturnValue(null);

      await xcodeMod(createMockConfigWithXcodeMod(mockXcodeProject));

      expect(mockXcodeProject.addTarget).toHaveBeenCalledWith(
        NS_TARGET_NAME,
        'app_extension',
        NS_TARGET_NAME,
        expect.any(String)
      );
      expect(mockXcodeProject.addPbxGroup).toHaveBeenCalledWith(
        expect.any(Array),
        NS_TARGET_NAME,
        NS_TARGET_NAME
      );
    });

    it('should copy build settings from main target', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const xcodeMod = result.mods.ios.xcodeproj as Mod<any>;
      const mockXcodeProject = new XcodeProject();
      (mockXcodeProject.pbxTargetByName as jest.Mock).mockReturnValue(null);
      (mockXcodeProject.pbxGroupByName as jest.Mock).mockReturnValue(null);

      // Mock build settings
      const mockBuildSettings = {
        SWIFT_VERSION: '5.0',
        CODE_SIGN_STYLE: 'Automatic',
        CODE_SIGN_IDENTITY: 'Apple Development',
        OTHER_CODE_SIGN_FLAGS: '--keychain=login.keychain',
        DEVELOPMENT_TEAM: 'TEAM123',
        PROVISIONING_PROFILE_SPECIFIER: 'Profile 1',
      };

      mockXcodeProject.hash.project.objects.XCBuildConfiguration = {
        config1: { buildSettings: mockBuildSettings },
        config2: { buildSettings: { PRODUCT_NAME: `"${NS_TARGET_NAME}"` } },
      };

      await xcodeMod(createMockConfigWithXcodeMod(mockXcodeProject));

      const targetConfig =
        mockXcodeProject.hash.project.objects.XCBuildConfiguration['config2']
          .buildSettings;
      expect(targetConfig.SWIFT_VERSION).toBe('5.0');
      expect(targetConfig.CODE_SIGN_STYLE).toBe('Automatic');
      expect(targetConfig.CODE_SIGN_IDENTITY).toBe('Apple Development');
      expect(targetConfig.OTHER_CODE_SIGN_FLAGS).toBe(
        '--keychain=login.keychain'
      );
      expect(targetConfig.DEVELOPMENT_TEAM).toBe('TEAM123');
      expect(targetConfig.PROVISIONING_PROFILE_SPECIFIER).toBe('Profile 1');
      expect(targetConfig.CODE_SIGN_ENTITLEMENTS).toBe(
        `${NS_TARGET_NAME}/${NS_ENTITLEMENTS_FILE_NAME}`
      );
    });

    it('should add build phases for sources and frameworks', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const xcodeMod = result.mods.ios.xcodeproj as Mod<any>;
      const mockXcodeProject = new XcodeProject();
      (mockXcodeProject.pbxTargetByName as jest.Mock).mockReturnValue(null);
      (mockXcodeProject.pbxGroupByName as jest.Mock).mockReturnValue(null);

      await xcodeMod(createMockConfigWithXcodeMod(mockXcodeProject));

      expect(mockXcodeProject.addBuildPhase).toHaveBeenCalledWith(
        [NS_MAIN_FILE_NAME],
        'PBXSourcesBuildPhase',
        'Sources',
        'test-target-uuid'
      );
      expect(mockXcodeProject.addBuildPhase).toHaveBeenCalledWith(
        ['UserNotifications.framework'],
        'PBXFrameworksBuildPhase',
        'Frameworks',
        'test-target-uuid'
      );
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
