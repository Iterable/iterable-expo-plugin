import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoAdapterIterableModule extends NativeModule {
  /**
   * Get the Iterable API key set in the expo config.
   * @return The Iterable API key.
   */
  getApiKey(): string;

  /**
   * Request notification permission.
   */
  requestNotificationPermission(): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAdapterIterableModule>('ExpoAdapterIterable');
