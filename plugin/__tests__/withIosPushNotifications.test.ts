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

import {
  createTestConfig,
  type WithIterableResult,
  createMockPlistConfig,
  createMockPodfileConfig,
  createMockXcodeConfig,
  createMockIosDangerousModConfig,
  createMockEntitlementsConfig,
} from '../__mocks__/testUtils';
import withIterable from '../src/withIterable';
import type { ConfigPluginProps } from '../src/withIterable.types';
import {
  NS_ENTITLEMENTS_FILE_NAME,
  NS_MAIN_FILE_NAME,
  NS_POD,
  NS_TARGET_NAME,
  NS_PLIST_FILE_NAME,
} from '../src/withPushNotifications/withIosPushNotifications.constants';

describe('withIosPushNotifications', () => {
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
      // The below is not defined as entitlements are not added anywhere
      expect(result.mods?.ios?.entitlements).not.toBeDefined();
    });
  });
});
