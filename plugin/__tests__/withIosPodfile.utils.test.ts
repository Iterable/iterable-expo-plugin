import { getDefaultPodfileContents } from '../__mocks__';
import { injectAfterReactNativePostInstall } from '../src/withIosPodfile.utils';

const MARKER = '# test marker';
const SNIPPET = `\n    ${MARKER}\n    puts 'injected'`;

describe('injectAfterReactNativePostInstall', () => {
  it('inserts the snippet right after react_native_post_install', () => {
    const contents = injectAfterReactNativePostInstall(
      getDefaultPodfileContents(),
      MARKER,
      SNIPPET,
      'test snippet'
    );

    expect(contents).toContain(`    )${SNIPPET}\n  end`);
  });

  it('returns the contents unchanged when the marker is already present', () => {
    const once = injectAfterReactNativePostInstall(
      getDefaultPodfileContents(),
      MARKER,
      SNIPPET,
      'test snippet'
    );

    expect(
      injectAfterReactNativePostInstall(once, MARKER, SNIPPET, 'test snippet')
    ).toBe(once);
  });

  it('warns and returns the contents unchanged when the call is missing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const contents = 'post_install do |installer|\nend\n';

    expect(
      injectAfterReactNativePostInstall(
        contents,
        MARKER,
        SNIPPET,
        'test snippet'
      )
    ).toBe(contents);
    expect(warn).toHaveBeenCalledWith(
      '@iterable/expo-plugin: Could not inject test snippet into Podfile — react_native_post_install block not found'
    );

    warn.mockRestore();
  });
});
