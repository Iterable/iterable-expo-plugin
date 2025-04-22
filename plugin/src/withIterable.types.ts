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
   * @default true
   */
  autoConfigurePushNotifications?: boolean;
  /**
   * Whether to enable time-sensitive push notifications.
   * @default true
   */
  enableTimeSensitivePush?: boolean;
  /**
   * Whether to request permissions for push notifications.
   * @default false
   */
  requestPermissionsForPushNotifications?: boolean;
  /**
   * Whether to enable in-app messages.
   * @default true
   */
  enableInAppMessages?: boolean;
}

export type ConfigPluginPropsWithDefaults = Required<ConfigPluginProps>;
