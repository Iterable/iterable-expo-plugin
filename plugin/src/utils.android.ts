interface GradleDependency {
  classpath: string;
  version?: string;
}

/**
 * Add a dependency to the project build.gradle file.
 */
export function addProjectDependency(
  buildGradle: string,
  options: GradleDependency
) {
  if (!buildGradle.includes(options?.classpath)) {
    return buildGradle.replace(
      /dependencies\s?{/,
      `dependencies {
        classpath('${options?.classpath}${
          options?.version ? `:${options?.version}` : ''
        }')`
    );
  } else {
    return buildGradle;
  }
}

interface AppGradleDependency extends GradleDependency {
  /**
   * The string to add to the dependencies block.
   *
   * If this is not provided, ${classpath}:${version} will be used.
   */
  implementation?: string;
}

/**
 * Add a dependency to the app build.gradle file.
 */
export function addAppDependency(
  buildGradle: string,
  options: AppGradleDependency
) {
  if (!buildGradle.includes(options?.classpath)) {
    const implementationString =
      options?.implementation ??
      `'${options?.classpath}${
        options?.version ? `:${options?.version}` : ''
      }'`;
    return buildGradle.replace(
      /dependencies\s?{/,
      // NOTE: awkward spacing is intentional -- it ensure correct alignment in
      // the output build.gradle file
      `dependencies {
    implementation ${implementationString}`
    );
  } else {
    return buildGradle;
  }
}

/**
 * Add the apply plugin line to the app build.gradle file if it doesn't exist.
 */
export function addApplyPlugin(appBuildGradle: string, pluginName: string) {
  // Check for `apply plugin: 'com.google.gms.google-services'`
  const applyPluginPattern = new RegExp(
    `apply\\s+plugin:\\s+['"]${pluginName}['"]`
  );
  // Check for `plugins { id 'com.google.gms.google-services' }`
  const pluginIdPattern = new RegExp(`id\\s+['"]${pluginName}['"]`);

  // Make sure the project does not have the plugin already
  if (
    !appBuildGradle.match(applyPluginPattern) &&
    !appBuildGradle.match(pluginIdPattern)
  ) {
    return appBuildGradle + `\napply plugin: '${pluginName}'`;
  }

  return appBuildGradle;
}
