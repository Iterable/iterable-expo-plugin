import { ConfigPlugin, withPodfile } from 'expo/config-plugins';

/** Marker comment used to avoid injecting the workaround more than once. */
export const FMT_WORKAROUND_MARKER =
  '# @iterable/expo-plugin: fmt workaround for Xcode 26.4';

/**
 * Compiles the fmt pod in C++17 mode so FMT_USE_CONSTEVAL stays disabled.
 * Required for Xcode 26.4+ when building React Native 0.79+.
 *
 * @see https://github.com/Iterable/react-native-sdk/blob/main/example/ios/Podfile
 */
const FMT_WORKAROUND_RUBY = `
    ${FMT_WORKAROUND_MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # fmt/base.h unconditionally redefines FMT_USE_CONSTEVAL based on __cplusplus,
        # so preprocessor defines are overwritten. The reliable fix is to compile fmt
        # in C++17 mode: FMT_CPLUSPLUS (201703L) < 201709L → FMT_USE_CONSTEVAL = 0.
        # All other pods stay in C++20 (React-perflogger needs std::unordered_map::contains).
        if target.name == 'fmt'
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end`;

export const withIosFmtWorkaround: ConfigPlugin = (config) => {
  return withPodfile(config, (newConfig) => {
    const { contents } = newConfig.modResults;

    if (contents.includes(FMT_WORKAROUND_MARKER)) {
      return newConfig;
    }

    const postInstallMatch = contents.match(
      /(react_native_post_install\([\s\S]*?\n\s*\))/
    );

    if (!postInstallMatch) {
      console.warn(
        '@iterable/expo-plugin: Could not inject fmt workaround into Podfile — react_native_post_install block not found'
      );
      return newConfig;
    }

    newConfig.modResults.contents = contents.replace(
      postInstallMatch[0],
      `${postInstallMatch[0]}${FMT_WORKAROUND_RUBY}`
    );

    return newConfig;
  });
};

export default withIosFmtWorkaround;
