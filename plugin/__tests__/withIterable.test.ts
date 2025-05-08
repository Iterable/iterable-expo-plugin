import withIterable from '../src/withIterable';
import { ConfigPluginProps } from '../src/withIterable.types';
import { withStoreConfigValues } from '../src/withStoreConfigValues';

// Mock the plugins
jest.mock('../src/withStoreConfigValues', () => ({
  __esModule: true,
  withStoreConfigValues: jest.fn((config) => config),
}));

jest.mock('../src/withPushNotifications', () => ({
  __esModule: true,
  withPushNotifications: jest.fn((config) => config),
}));

jest.mock('../src/withDeepLinks', () => ({
  __esModule: true,
  withDeepLinks: jest.fn((config) => config),
}));

describe('withIterable', () => {
  const mockConfig = {
    name: 'TestApp',
    slug: 'test-app',
    _internal: { projectRoot: process.cwd() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof withIterable).toBe('function');
    expect(withIterable).toBeInstanceOf(Function);
  });

  it('should set default values when no props are provided', () => {
    // @ts-expect-error
    const result = withIterable(mockConfig);

    expect(result).toBeDefined();
    expect(withStoreConfigValues).toHaveBeenCalledWith(mockConfig, {
      appEnvironment: 'development',
      autoConfigurePushNotifications: true,
      enableTimeSensitivePush: true,
      requestPermissionsForPushNotifications: false,
    });
  });

  it('should use provided props when available', () => {
    const props: ConfigPluginProps = {
      appEnvironment: 'production',
      autoConfigurePushNotifications: false,
      enableTimeSensitivePush: false,
      requestPermissionsForPushNotifications: true,
    };

    const result = withIterable(mockConfig, props);

    expect(result).toBeDefined();
    expect(withStoreConfigValues).toHaveBeenCalledWith(mockConfig, props);
  });

  it('should handle partial props', () => {
    const props: ConfigPluginProps = {
      appEnvironment: 'production',
      // Other props should use defaults
    };

    const result = withIterable(mockConfig, props);

    expect(result).toBeDefined();
    expect(withStoreConfigValues).toHaveBeenCalledWith(mockConfig, {
      appEnvironment: 'production',
      autoConfigurePushNotifications: true,
      enableTimeSensitivePush: true,
      requestPermissionsForPushNotifications: false,
    });
  });
});
