import {
  createMockPodfileConfig,
  createTestConfig,
  type WithIterableResult,
} from '../__mocks__';
import { FMT_WORKAROUND_MARKER } from '../src/withIosFmtWorkaround';
import withIterable from '../src/withIterable';

const EXPO_PODFILE_SNIPPET = `
  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => podfile_properties['apple.ccacheEnabled'] == 'true',
    )
  end
`;

describe('withIosFmtWorkaround', () => {
  it('injects the fmt workaround after react_native_post_install', async () => {
    const result = withIterable(createTestConfig(), {}) as WithIterableResult;
    const modifiedPodfile = await result.mods.ios.podfile(
      createMockPodfileConfig({ contents: EXPO_PODFILE_SNIPPET })
    );

    expect(modifiedPodfile.modResults.contents).toContain(
      FMT_WORKAROUND_MARKER
    );
    expect(modifiedPodfile.modResults.contents).toContain(
      "config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'"
    );
  });

  it('does not inject the workaround twice', async () => {
    const result = withIterable(createTestConfig(), {}) as WithIterableResult;
    const firstPass = await result.mods.ios.podfile(
      createMockPodfileConfig({ contents: EXPO_PODFILE_SNIPPET })
    );
    const secondPass = await result.mods.ios.podfile(
      createMockPodfileConfig({ contents: firstPass.modResults.contents })
    );

    const markerCount = (
      secondPass.modResults.contents.match(
        new RegExp(
          FMT_WORKAROUND_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'g'
        )
      ) || []
    ).length;

    expect(markerCount).toBe(1);
  });
});
