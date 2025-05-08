/* eslint-disable import/first */
jest.mock('fs', () => require('memfs').fs);

import { Mod, XcodeProject } from 'expo/config-plugins';
import { fs, vol } from 'memfs';
import path from 'path';

import {
  createMockEntitlementsConfig,
  createMockIosDangerousModConfig,
  createMockPlistConfig,
  createMockPodfileConfig,
  createMockXcodeConfig,
  createTestConfig,
  type WithIterableResult,
} from '../__mocks__/testUtils';
import withIterable from '../src/withIterable';
import type { ConfigPluginProps } from '../src/withIterable.types';
import {
  NS_ENTITLEMENTS_FILE_NAME,
  NS_MAIN_FILE_NAME,
  NS_PLIST_FILE_NAME,
  NS_POD,
  NS_TARGET_NAME,
} from '../src/withPushNotifications/withIosPushNotifications.constants';

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

describe('withIosPushNotifications', () => {
  beforeEach(() => {
    // Reset the memory file system before each test
    vol.reset();
    vol.fromJSON({});
    // Create the project root directory
    fs.mkdirSync(process.cwd(), { recursive: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.unmock('fs');
    vol.reset();
  });

  describe('appEnvironment', () => {
    it('should add the correct app environment to the entitlements', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = { appEnvironment: 'development' };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedEntitlements = await result.mods.ios.entitlements(
        createMockEntitlementsConfig()
      );
      expect(modifiedEntitlements.modResults['aps-environment']).toBe(
        'development'
      );
    });
  });

  describe('enableTimeSensitivePush', () => {
    it('should add time sensitive push to the entitlements if not explicitly set to false', async () => {
      const result = withIterable(createTestConfig(), {}) as WithIterableResult;
      const modifiedEntitlements = await result.mods.ios.entitlements(
        createMockEntitlementsConfig()
      );
      expect(
        modifiedEntitlements.modResults[
          'com.apple.developer.usernotifications.time-sensitive'
        ]
      ).toBe(true);
    });

    it('should not add time sensitive push to the entitlements if explicitly set to false', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = { enableTimeSensitivePush: false };
      const result = withIterable(config, props) as WithIterableResult;
      const modifiedEntitlements = await result.mods.ios.entitlements(
        createMockEntitlementsConfig()
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
      expect(result.mods?.ios?.entitlements).not.toBeDefined();
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
        createMockPlistConfig()
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
        createMockPlistConfig(config.ios.infoPlist)
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
        createMockPodfileConfig()
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
        createMockPodfileConfig({
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
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.ios.dangerous as Mod<any>;
      await dangerousMod(createMockIosDangerousModConfig());

      expect(fs.existsSync(path.resolve(process.cwd(), NS_TARGET_NAME))).toBe(
        true
      );
    });

    it('should not create the notification service folder if it already exists', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      // Create the directory first
      fs.mkdirSync(path.resolve(process.cwd(), NS_TARGET_NAME), {
        recursive: true,
      });
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.ios.dangerous as Mod<any>;
      await dangerousMod(createMockIosDangerousModConfig());

      // Verify the directory still exists
      expect(fs.existsSync(path.resolve(process.cwd(), NS_TARGET_NAME))).toBe(
        true
      );
    });

    it('should create all required files if they do not exist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.ios.dangerous as Mod<any>;
      await dangerousMod(createMockIosDangerousModConfig());

      const mainFilePath = path.resolve(
        process.cwd(),
        NS_TARGET_NAME,
        NS_MAIN_FILE_NAME
      );
      const plistFilePath = path.resolve(
        process.cwd(),
        NS_TARGET_NAME,
        NS_PLIST_FILE_NAME
      );
      const entitlementsFilePath = path.resolve(
        process.cwd(),
        NS_TARGET_NAME,
        NS_ENTITLEMENTS_FILE_NAME
      );

      expect(fs.existsSync(mainFilePath)).toBe(true);
      expect(fs.existsSync(plistFilePath)).toBe(true);
      expect(fs.existsSync(entitlementsFilePath)).toBe(true);
    });

    it('should not create files if they already exist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      // Create the directory and files first
      const dirPath = path.resolve(process.cwd(), NS_TARGET_NAME);
      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(path.resolve(dirPath, NS_MAIN_FILE_NAME), '');
      fs.writeFileSync(path.resolve(dirPath, NS_PLIST_FILE_NAME), '');
      fs.writeFileSync(path.resolve(dirPath, NS_ENTITLEMENTS_FILE_NAME), '');

      const result = withIterable(config, props) as WithIterableResult;
      const dangerousMod = result.mods.ios.dangerous as Mod<any>;
      await dangerousMod(createMockIosDangerousModConfig());

      // Verify the files still exist and haven't been modified
      expect(
        fs.readFileSync(path.resolve(dirPath, NS_MAIN_FILE_NAME), 'utf8')
      ).toBe('');
      expect(
        fs.readFileSync(path.resolve(dirPath, NS_PLIST_FILE_NAME), 'utf8')
      ).toBe('');
      expect(
        fs.readFileSync(
          path.resolve(dirPath, NS_ENTITLEMENTS_FILE_NAME),
          'utf8'
        )
      ).toBe('');
    });

    it('should skip adding xcode project target if target already exists', async () => {
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

      await xcodeMod(createMockXcodeConfig(mockXcodeProject));

      expect(mockXcodeProject.addTarget).not.toHaveBeenCalled();
      expect(mockXcodeProject.addPbxGroup).not.toHaveBeenCalled();
      expect(mockXcodeProject.addBuildPhase).not.toHaveBeenCalled();
    });

    it('should create new xcode project target and group if they do not exist', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const xcodeMod = result.mods.ios.xcodeproj as Mod<any>;
      const mockXcodeProject = new XcodeProject();
      (mockXcodeProject.pbxTargetByName as jest.Mock).mockReturnValue(null);
      (mockXcodeProject.pbxGroupByName as jest.Mock).mockReturnValue(null);

      await xcodeMod(createMockXcodeConfig(mockXcodeProject));

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

    it('should copy xcode project build settings from main target', async () => {
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

      await xcodeMod(createMockXcodeConfig(mockXcodeProject));

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

    it('should add build phases for xcode project sources and frameworks', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const xcodeMod = result.mods.ios.xcodeproj as Mod<any>;
      const mockXcodeProject = new XcodeProject();
      (mockXcodeProject.pbxTargetByName as jest.Mock).mockReturnValue(null);
      (mockXcodeProject.pbxGroupByName as jest.Mock).mockReturnValue(null);

      await xcodeMod(createMockXcodeConfig(mockXcodeProject));

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

    it('should add groups to the xcode project notification service group if they have no name or path', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const xcodeMod = result.mods.ios.xcodeproj as Mod<any>;
      const mockXcodeProject = new XcodeProject();
      (mockXcodeProject.pbxTargetByName as jest.Mock).mockReturnValue(null);
      (mockXcodeProject.pbxGroupByName as jest.Mock).mockReturnValue(null);

      // Mock groups with different properties
      mockXcodeProject.hash.project.objects.PBXGroup = {
        group1: { name: undefined, path: undefined }, // Should be added
        group2: { name: 'Test', path: undefined }, // Should not be added (has name)
        group3: { name: undefined, path: 'test/path' }, // Should not be added (has path)
        group4: { name: undefined, path: undefined }, // Should be added
      };

      await xcodeMod(createMockXcodeConfig(mockXcodeProject));

      // Verify addToPbxGroup was called only for groups without name and path
      expect(mockXcodeProject.addToPbxGroup).toHaveBeenCalledTimes(2);
      expect(mockXcodeProject.addToPbxGroup).toHaveBeenCalledWith(
        'test-group-uuid',
        'group1'
      );
      expect(mockXcodeProject.addToPbxGroup).toHaveBeenCalledWith(
        'test-group-uuid',
        'group4'
      );
    });

    it('should not add groups to the xcode project notification service group if they have name or path', async () => {
      const config = createTestConfig();
      const props: ConfigPluginProps = {
        autoConfigurePushNotifications: true,
      };
      const result = withIterable(config, props) as WithIterableResult;
      const xcodeMod = result.mods.ios.xcodeproj as Mod<any>;
      const mockXcodeProject = new XcodeProject();
      (mockXcodeProject.pbxTargetByName as jest.Mock).mockReturnValue(null);
      (mockXcodeProject.pbxGroupByName as jest.Mock).mockReturnValue(null);

      // Mock groups that should not be added
      mockXcodeProject.hash.project.objects.PBXGroup = {
        group1: { name: 'Test', path: undefined },
        group2: { name: undefined, path: 'test/path' },
        group3: { name: 'Test', path: 'test/path' },
      };

      await xcodeMod(createMockXcodeConfig(mockXcodeProject));

      // Verify addToPbxGroup was not called
      expect(mockXcodeProject.addToPbxGroup).not.toHaveBeenCalled();
    });
  });
});
