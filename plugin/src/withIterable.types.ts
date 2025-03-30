export interface ConfigPluginProps {
  /**
   * The api key for the Iterable project.
   */
  apiKey?: string;
  /**
   * The mode for the Iterable application.
   * IE: 'development' or 'production'
   */
  mode?: ['development', 'production'];
}
