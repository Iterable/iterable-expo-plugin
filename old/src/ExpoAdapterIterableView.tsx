import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoAdapterIterableViewProps } from '../old/src/ExpoAdapterIterable.types';

const NativeView: React.ComponentType<ExpoAdapterIterableViewProps> =
  requireNativeView('ExpoAdapterIterable');

export default function ExpoAdapterIterableView(props: ExpoAdapterIterableViewProps) {
  return <NativeView {...props} />;
}
