import { IterableInbox } from '@iterable/react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Login } from './Login';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {loggedIn ? <IterableInbox /> : <Login onLoggedIn={() => setLoggedIn(true)} />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
