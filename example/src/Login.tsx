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

/**
 * Has the user set their Iterable API key in the .env.local file?
 * See the [example README](https://github.com/Iterable/iterable-expo-plugin/blob/main/example/README.md) or the [.env file](https://github.com/Iterable/iterable-expo-plugin/blob/main/example/.env) for more details.
 */
const isApiKeySet =
  !!process.env.EXPO_PUBLIC_ITERABLE_API_KEY &&
  process.env.EXPO_PUBLIC_ITERABLE_API_KEY !== 'YOUR_ITERABLE_API_KEY';

export const Login = ({ onLoggedIn = () => {} }: LoginProps) => {
  const [initialized, setInitialized] = useState(false);
  const [email, setEmail] = useState(
    process.env.EXPO_PUBLIC_ITERABLE_EMAIL ?? ''
  );

  const onPress = () => {
    Iterable.setEmail(email);
    setTimeout(() => {
      onLoggedIn();
    }, 300);
  };

  const runInitialize = () => {
    if (!isApiKeySet) return;

    const config = new IterableConfig();

    config.inAppDisplayInterval = 1.0; // Min gap between in-apps. No need to set this in production.
    config.urlHandler = () => true;
    config.allowedProtocols = ['app', 'iterable'];
    config.logLevel = IterableLogLevel.info;
    config.inAppHandler = () => IterableInAppShowResponse.show;

    Iterable.initialize(
      process.env.EXPO_PUBLIC_ITERABLE_API_KEY as string,
      config
    ).finally(() => {
      setInitialized(true);
    });
  };

  useEffect(() => {
    runInitialize();
  }, []);

  if (!isApiKeySet) {
    return (
      <View style={styles.loginScreenContainer}>
        <Text style={styles.warningTitle}>ERROR: API Key not set</Text>
        <Text style={styles.warningText}>
          Please set your Iterable API key in the
          <Text style={styles.emphasisTest}> .env.local</Text> file.
        </Text>
        <Text style={styles.warningText}>
          See the
          <Text style={styles.emphasisTest}> example README</Text> or the
          <Text style={styles.emphasisTest}> .env</Text> file for more details.
        </Text>
      </View>
    );
  }

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
              style={
                email.length > 0 && isApiKeySet
                  ? styles.button
                  : styles.buttonDisabled
              }
              disabled={!email.length}
              onPressOut={onPress}
            >
              <Text
                style={
                  email.length > 0
                    ? styles.buttonText
                    : styles.buttonTextDisabled
                }
              >
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
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 64,
    marginTop: 41,
    textAlign: 'center',
    textTransform: 'uppercase',
    width: '100%',
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
    backgroundColor: colors.white,
    borderColor: colors.borderPrimary,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    height: 40,
    marginBottom: 15,
    padding: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
    marginBottom: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loginScreenContainer: {
    backgroundColor: colors.white,
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'flex-start',
    marginTop: Platform.OS === 'android' ? 0 : 50,
    padding: 16,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 20,
    marginBottom: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.25,
    lineHeight: 28,
    marginBottom: 12,
  },
  warningTitle: {
    color: colors.textDestructive,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 100,
    marginBottom: 20,
    textAlign: 'center',
  },
  warningText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emphasisTest: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
