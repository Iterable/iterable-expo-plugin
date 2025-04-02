import { getApiKey } from '@iterable/expo-plugin';
import {
  Iterable,
  IterableConfig,
  IterableInAppShowResponse,
  IterableLogLevel,
} from '@iterable/react-native-sdk';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors } from './constants';

interface LoginProps {
  /**
   * Callback function that is called when the user is logged in.
   */
  onLoggedIn: () => void;
}

export const Login = ({ onLoggedIn = () => {} }: LoginProps) => {
  const [initialized, setInitialized] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const config = new IterableConfig();

    config.inAppDisplayInterval = 1.0; // Min gap between in-apps. No need to set this in production.

    config.urlHandler = (url: string) => true;

    config.allowedProtocols = ['app', 'iterable'];

    config.logLevel = IterableLogLevel.debug;

    config.inAppHandler = () => IterableInAppShowResponse.show;

    Iterable.initialize(getApiKey(), config).finally(() => {
      setInitialized(true);
    });
  }, []);

  const onPress = () => {
    Iterable.setEmail(email);
    setTimeout(() => {
      onLoggedIn();
    }, 300);
  };

  return (
    <View style={styles.loginScreenContainer}>
      {initialized ? (
        <>
          <Text style={styles.appName}>Iterable</Text>
          <Text style={styles.title}>Sign in to continue</Text>
          <Text style={styles.subtitle}>Example app for Expo developers</Text>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              placeholder="eg: my.name@gmail.com"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
            <Pressable
              style={email.length > 0 ? styles.button : styles.buttonDisabled}
              disabled={!email.length}
              onPressOut={onPress}
            >
              <Text style={email.length > 0 ? styles.buttonText : styles.buttonTextDisabled}>
                Login
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
          <ActivityIndicator size="large" color={colors.brandPurple} />
        </View>
      )}
    </View>
  );
};

const setButton = (buttonToSet: ViewStyle = {}): ViewStyle => ({
  alignItems: 'center',
  backgroundColor: colors.brandPurple,
  borderRadius: 32,
  paddingVertical: 12,
  paddingHorizontal: 10,
  width: '100%',
  ...buttonToSet,
  marginTop: 32,
});

const buttonText: TextStyle = {
  color: 'white',
  fontWeight: '700',
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0.1,
  textAlign: 'center',
};

const styles = StyleSheet.create({
  appName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    width: '100%',
    marginTop: 41,
    marginBottom: 64,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  button: setButton(),
  buttonDisabled: setButton({ backgroundColor: colors.backgroundDisabled }),
  buttonText,
  buttonTextDisabled: {
    ...buttonText,
    color: colors.textDisabled,
  },
  formContainer: { marginTop: 24 },
  input: {
    height: 40,
    backgroundColor: colors.white,
    borderColor: colors.borderPrimary,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    shadowColor: colors.black,
    elevation: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    marginBottom: 15,
  },
  label: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginScreenContainer: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 16,
    marginTop: Platform.OS === 'android' ? 0 : 50,
    backgroundColor: colors.white,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    marginBottom: 20,
    fontWeight: '400',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.25,
    marginBottom: 12,
  },
});
