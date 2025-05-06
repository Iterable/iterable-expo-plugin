export interface ConfigPluginProps {
  /**
   * The api key for the Iterable project.
   */
  apiKey?: string;
  /**
   * The environment of the app.
   * @default 'development'
   */
  appEnvironment?: 'development' | 'production';
  /**
   * Whether to automatically configure push notifications.
   *
   * If true, this will set up the necessary permissions and configurations for
   * push notifications according to the Iterable SDK documentation.  If you
   * would like to build your own push notification configuration, set this to
   * false -- but do so with caution as Iterable cannot guarantee compatibility
   * with custom push notification configurations.
   * @default true
   */
  autoConfigurePushNotifications?: boolean;
  /**
   * Whether to enable time-sensitive push notifications.
   *
   * (iOS only)
   *
   * @default true
   */
  enableTimeSensitivePush?: boolean;
  /**
   * Whether to request permissions for push notifications.
   *
   * (iOS only)
   *
   * @default false
   */
  requestPermissionsForPushNotifications?: boolean;
}

export type ConfigPluginPropsWithDefaults = Required<ConfigPluginProps>;
