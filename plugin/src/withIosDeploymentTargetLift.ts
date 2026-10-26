import { ConfigPlugin, withPodfile } from 'expo/config-plugins';

import { injectAfterReactNativePostInstall } from './withIosPodfile.utils';

/** Marker comment used to avoid injecting the lift more than once. */
export const DEPLOYMENT_TARGET_LIFT_MARKER =
  '# @iterable/expo-plugin: IPHONEOS deployment target lift for Xcode 27';

/**
 * Lifts Pods targets below iOS 15.1 so Xcode 27 accepts resource bundles such as
 * IterableSDKResources (Iterable-iOS-SDK still declares 12.0).
 *
 * @see https://github.com/Iterable/react-native-sdk/blob/3.2.1/example/ios/Podfile
 */
const DEPLOYMENT_TARGET_LIFT_RUBY = `
    ${DEPLOYMENT_TARGET_LIFT_MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || current.to_f < 15.1
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
      end
    end`;

export const withIosDeploymentTargetLift: ConfigPlugin = (config) => {
  return withPodfile(config, (newConfig) => {
    newConfig.modResults.contents = injectAfterReactNativePostInstall(
      newConfig.modResults.contents,
      DEPLOYMENT_TARGET_LIFT_MARKER,
      DEPLOYMENT_TARGET_LIFT_RUBY,
      'IPHONEOS deployment target lift'
    );

    return newConfig;
  });
};

export default withIosDeploymentTargetLift;
