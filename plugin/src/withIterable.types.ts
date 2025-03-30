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
}
