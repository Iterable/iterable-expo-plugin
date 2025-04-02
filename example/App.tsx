import * as ExpoAdapterIterable from '@iterable/expo-plugin';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>API key: {ExpoAdapterIterable.getApiKey()}</Text>
    </View>
  );
}
