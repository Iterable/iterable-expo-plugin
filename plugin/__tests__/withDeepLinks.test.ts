import {
  createMockAndroidManifest,
  createMockManifestConfig,
  createTestConfig,
  type ConfigWithMods,
  type WithIterableResult,
} from '../__mocks__/testUtils';
import withIterable from '../src/withIterable';
import { type ConfigPluginProps } from '../src/withIterable.types';

describe('withDeepLinks', () => {
  it('should set the launch mode to singleTask if activities exist', async () => {
    const config = createTestConfig();
    const props: ConfigPluginProps = {};
    const result = withIterable(config, props) as WithIterableResult;
    const modifiedManifest = await result.mods.android.manifest(
      createMockManifestConfig(createMockAndroidManifest())
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
      createMockManifestConfig({
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
});
