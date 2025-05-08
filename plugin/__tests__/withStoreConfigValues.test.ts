import { type Mod } from 'expo/config-plugins';

import {
  createMockAndroidManifest,
  createMockManifestConfig,
  createMockPlistConfig,
  createTestConfig,
  type WithIterableResult,
} from '../__mocks__';
import withIterable from '../src/withIterable';
import { type ConfigPluginProps } from '../src/withIterable.types';

describe('withStoreConfigValues', () => {
  it('should store `ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS` in Info.plist', async () => {
    const config = createTestConfig();
    const props: ConfigPluginProps = {
      requestPermissionsForPushNotifications: true,
    };
    const result = withIterable(config, props) as WithIterableResult;
    const modifiedInfoPlist = await result.mods.ios.infoPlist(
      createMockPlistConfig()
    );
    expect(
      modifiedInfoPlist.modResults
        .ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS
    ).toBe(true);
  });

  it('should add `ITERABLE_REQUEST_PERMISSIONS_FOR_PUSH_NOTIFICATIONS` to Android Manifest', async () => {
    const config = createTestConfig();
    const props: ConfigPluginProps = {
      requestPermissionsForPushNotifications: true,
    };
    const result = withIterable(config, props) as WithIterableResult;
    const manifestMod = result.mods.android.manifest as Mod<any>;
    const modifiedManifest = await manifestMod(
      createMockManifestConfig(createMockAndroidManifest())
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
