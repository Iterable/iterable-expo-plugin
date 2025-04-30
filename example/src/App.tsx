import { IterableInbox } from '@iterable/react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button } from 'react-native';

import { requestNotificationPermission } from '@iterable/expo-plugin';
import { Login } from './Login';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {loggedIn ? (
          <>
            <IterableInbox />
            <Button title="Request permissions" onPress={() => {
              requestNotificationPermission();
              }} />
          </>
        ) : (
          <Login onLoggedIn={() => setLoggedIn(true)} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
