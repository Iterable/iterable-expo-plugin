// Reexport the native module.
import ExpoAdapterIterableModule from './ExpoAdapterIterableModule';

export function getApiKey(): string {
  return ExpoAdapterIterableModule.getApiKey();
}

export default ExpoAdapterIterableModule;
