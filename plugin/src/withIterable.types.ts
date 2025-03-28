export interface ConfigPluginProps {
  /**
   * The api key for the Iterable project.
   * TODO: Make this optional
   */
  apiKey: string;
  /**
   * Whether to create a push service.
   */
  createPushService?: boolean;
}
