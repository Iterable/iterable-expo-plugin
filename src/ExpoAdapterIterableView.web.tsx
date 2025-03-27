import * as React from 'react';

import { ExpoAdapterIterableViewProps } from './ExpoAdapterIterable.types';

export default function ExpoAdapterIterableView(props: ExpoAdapterIterableViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
