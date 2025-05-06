import {
  addAppDependency,
  addApplyPlugin,
  addProjectDependency,
} from '../utils.android';

const countWord = (str: string, word: string) =>
  (str.match(new RegExp(word, 'g')) || []).length;

describe('addProjectDependency', () => {
  const classpath = 'my.class.path';
  const version = '1.2.3';
  const getBuildGradle = () => `dependencies { 
}`;

  it('should add a dependency to the project build.gradle file', () => {
    const result = addProjectDependency(getBuildGradle(), {
      classpath,
      version,
    });
    expect(result).toContain(classpath);
    expect(result).toContain(version);
  });

  it('should not add a version to the dependency if it is not provided', () => {
    const result = addProjectDependency(getBuildGradle(), {
      classpath,
    });
    expect(result).toContain(`classpath('my.class.path')`);
  });

  it('should not add a duplicate dependency to the project build.gradle file', () => {
    const buildGradle = `
    dependencies { 
      classpath '${classpath}:${version}' 
    }`;
    const result = addProjectDependency(buildGradle, {
      classpath,
      version,
    });
    expect(countWord(result, classpath)).toBe(1);
  });
});

describe('addAppDependency', () => {
  const classpath = 'my.class.path';
  const version = '1.2.3';
  const getBuildGradle = () => `dependencies { 
}`;
  it('should add a dependency to the app build.gradle file', () => {
    const result = addAppDependency(getBuildGradle(), {
      classpath,
      version,
    });
    expect(result).toContain(classpath);
    expect(result).toContain(version);
  });

  it('should not add a version to the dependency if it is not provided', () => {
    const result = addAppDependency(getBuildGradle(), {
      classpath,
    });
    expect(result).toContain(`implementation 'my.class.path'`);
  });

  it('should not add a duplicate dependency to the app build.gradle file', () => {
    const buildGradle = `
    dependencies { 
      implementation '${classpath}:${version}' 
    }`;
    const result = addAppDependency(buildGradle, {
      classpath,
      version,
    });
    expect(countWord(result, classpath)).toBe(1);
  });
});

describe('addApplyPlugin', () => {
  const pluginName = 'com.google.gms.google-services';
  const version = '1.2.3';
  const getBuildGradle = () => `dependencies { 
}`;
  it('should add the apply plugin line to the app build.gradle file', () => {
    const result = addApplyPlugin(getBuildGradle(), pluginName);
    expect(result).toContain(`apply plugin: '${pluginName}'`);
  });

  it('should not add a duplicate apply plugin line to the app build.gradle file', () => {
    const buildGradle = `
    apply plugin: '${pluginName}'
    `;
    const result = addApplyPlugin(buildGradle, pluginName);
    expect(countWord(result, pluginName)).toBe(1);
  });

  it('should not add apply plugin line to the app build.gradle file if it already exists in id format', () => {
    const buildGradle = `plugins { id '${pluginName}' }`;
    const result = addApplyPlugin(buildGradle, pluginName);
    expect(countWord(result, pluginName)).toBe(1);
  });
});
