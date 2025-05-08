import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoAdapterIterableModule extends NativeModule {}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAdapterIterableModule>(
  'ExpoAdapterIterable'
);
