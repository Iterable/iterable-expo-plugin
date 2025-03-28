// Reexport the native module. On web, it will be resolved to ExpoAdapterIterableModule.web.ts
// and on native platforms to ExpoAdapterIterableModule.ts
import ExpoAdapterIterableModule from './ExpoAdapterIterableModule';

export function getApiKey(): string {
  return ExpoAdapterIterableModule.getApiKey();
}

export default ExpoAdapterIterableModule;
