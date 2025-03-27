import { NativeModule, requireNativeModule } from 'expo';

import { ExpoAdapterIterableModuleEvents } from './ExpoAdapterIterable.types';

declare class ExpoAdapterIterableModule extends NativeModule<ExpoAdapterIterableModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAdapterIterableModule>('ExpoAdapterIterable');
