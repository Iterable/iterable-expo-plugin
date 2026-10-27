import {
  createMockPodfileConfig,
  createTestConfig,
  getDefaultPodfileContents,
  type WithIterableResult,
} from '../__mocks__';
import { FMT_WORKAROUND_MARKER } from '../src/withIosFmtWorkaround';
import withIterable from '../src/withIterable';

describe('withIosFmtWorkaround', () => {
  it('injects the fmt workaround once, even when prebuild runs twice', async () => {
    const result = withIterable(createTestConfig(), {}) as WithIterableResult;
    const firstPass = await result.mods.ios.podfile(
      createMockPodfileConfig({ contents: getDefaultPodfileContents() })
    );
    const secondPass = await result.mods.ios.podfile(
      createMockPodfileConfig({ contents: firstPass.modResults.contents })
    );
    const { contents } = secondPass.modResults;

    expect(contents.split(FMT_WORKAROUND_MARKER)).toHaveLength(2);
    expect(contents).toContain(
      "config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'"
    );
  });
});
