// Reexport the native module.
import ExpoAdapterIterableModule from './ExpoAdapterIterableModule';

export function getApiKey(): string {
  return ExpoAdapterIterableModule.getApiKey();
}

export function requestNotificationPermission(): void {
  ExpoAdapterIterableModule.requestNotificationPermission();
}

export default ExpoAdapterIterableModule;
