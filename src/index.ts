// Reexport the native module. On web, it will be resolved to ExpoAdapterIterableModule.web.ts
// and on native platforms to ExpoAdapterIterableModule.ts
export { default } from './ExpoAdapterIterableModule';
export { default as ExpoAdapterIterableView } from './ExpoAdapterIterableView';
export * from './ExpoAdapterIterable.types';
