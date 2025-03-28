// Reexport the native module. On web, it will be resolved to ExpoAdapterIterableModule.web.ts
// and on native platforms to ExpoAdapterIterableModule.ts
import ExpoAdapterIterableModule from './ExpoAdapterIterableModule';

export { default } from './ExpoAdapterIterableModule';
export { default as ExpoAdapterIterableView } from './ExpoAdapterIterableView';
export * from '../old/src/ExpoAdapterIterable.types';

export function getApiKey(): string {
  return ExpoAdapterIterableModule.getApiKey();
}
