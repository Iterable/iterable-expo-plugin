import {
  createMockPodfileConfig,
  createTestConfig,
  type WithIterableResult,
} from '../__mocks__';
import { DEPLOYMENT_TARGET_LIFT_MARKER } from '../src/withIosDeploymentTargetLift';
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

describe('withIosDeploymentTargetLift', () => {
  it('injects the deployment target lift after react_native_post_install', async () => {
    const result = withIterable(createTestConfig(), {}) as WithIterableResult;
    const modifiedPodfile = await result.mods.ios.podfile(
      createMockPodfileConfig({ contents: EXPO_PODFILE_SNIPPET })
    );

    expect(modifiedPodfile.modResults.contents).toContain(
      DEPLOYMENT_TARGET_LIFT_MARKER
    );
    expect(modifiedPodfile.modResults.contents).toContain(
      "config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'"
    );
  });

  it('does not inject the lift twice', async () => {
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
          DEPLOYMENT_TARGET_LIFT_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'g'
        )
      ) || []
    ).length;

    expect(markerCount).toBe(1);
  });
});
