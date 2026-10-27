import {
  createMockPodfileConfig,
  createTestConfig,
  getDefaultPodfileContents,
  type WithIterableResult,
} from '../__mocks__';
import { DEPLOYMENT_TARGET_LIFT_MARKER } from '../src/withIosDeploymentTargetLift';
import { FMT_WORKAROUND_MARKER } from '../src/withIosFmtWorkaround';
import withIterable from '../src/withIterable';

describe('withIosDeploymentTargetLift', () => {
  it('injects the lift once, even when prebuild runs twice', async () => {
    const result = withIterable(createTestConfig(), {}) as WithIterableResult;
    const firstPass = await result.mods.ios.podfile(
      createMockPodfileConfig({ contents: getDefaultPodfileContents() })
    );
    const secondPass = await result.mods.ios.podfile(
      createMockPodfileConfig({ contents: firstPass.modResults.contents })
    );
    const { contents } = secondPass.modResults;

    expect(contents.split(DEPLOYMENT_TARGET_LIFT_MARKER)).toHaveLength(2);
    expect(contents).toContain(
      "config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'"
    );
    expect(contents).toContain('if current.nil? || current.to_f < 15.1');
  });

  it('keeps the fmt workaround, which ends up before the lift', async () => {
    const result = withIterable(createTestConfig(), {}) as WithIterableResult;
    const { contents } = (
      await result.mods.ios.podfile(
        createMockPodfileConfig({ contents: getDefaultPodfileContents() })
      )
    ).modResults;

    expect(contents.indexOf(FMT_WORKAROUND_MARKER)).toBeGreaterThan(-1);
    expect(contents.indexOf(FMT_WORKAROUND_MARKER)).toBeLessThan(
      contents.indexOf(DEPLOYMENT_TARGET_LIFT_MARKER)
    );
  });
});
