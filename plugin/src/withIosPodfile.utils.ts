const REACT_NATIVE_POST_INSTALL_REGEX =
  /(react_native_post_install\([\s\S]*?\n\s*\))/;

/**
 * Inserts a Ruby snippet right after the `react_native_post_install(...)` call
 * in a Podfile. Returns the contents unchanged when `marker` is already present
 * or when the call cannot be found.
 * @param contents - The Podfile contents.
 * @param marker - A comment that `snippet` contains, used to detect a prior injection.
 * @param snippet - The Ruby code to insert.
 * @param description - Names the snippet in the warning when the call is missing.
 * @returns The updated Podfile contents.
 */
export const injectAfterReactNativePostInstall = (
  contents: string,
  marker: string,
  snippet: string,
  description: string
): string => {
  if (contents.includes(marker)) {
    return contents;
  }

  const postInstallMatch = contents.match(REACT_NATIVE_POST_INSTALL_REGEX);

  if (!postInstallMatch) {
    console.warn(
      `@iterable/expo-plugin: Could not inject ${description} into Podfile — react_native_post_install block not found`
    );
    return contents;
  }

  return contents.replace(
    postInstallMatch[0],
    `${postInstallMatch[0]}${snippet}`
  );
};
