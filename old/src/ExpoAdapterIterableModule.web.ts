import { registerWebModule, NativeModule } from 'expo';

import { ExpoAdapterIterableModuleEvents } from '../old/src/ExpoAdapterIterable.types';

class ExpoAdapterIterableModule extends NativeModule<ExpoAdapterIterableModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoAdapterIterableModule);
