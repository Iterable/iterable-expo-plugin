import {
  IterableAuthFailureReason,
  IterableRetryBackoff,
  type IterableConfig,
} from '@iterable/react-native-sdk';
import { Alert } from 'react-native';

import {
  PLACEHOLDER_JWT_SECRET,
  alertJwtPrefetchFailure,
  applyJwtToConfig,
  isJwtConfigured,
  isJwtEnabled,
  jwtFailureReasonLabel,
  resolveJwtSecret,
} from './demoAuth';

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

jest.mock('@iterable/react-native-sdk', () => ({
  IterableRetryBackoff: { linear: 'LINEAR' },
  IterableAuthFailureReason: {
    AUTH_TOKEN_GENERATION_ERROR: 3,
    AUTH_TOKEN_SIGNATURE_INVALID: 9,
    3: 'AUTH_TOKEN_GENERATION_ERROR',
    9: 'AUTH_TOKEN_SIGNATURE_INVALID',
  },
}));

jest.mock('./signDemoJwt', () => ({
  signDemoJwt: jest.fn(),
}));

function emptyConfig(): IterableConfig {
  return {} as IterableConfig;
}

describe('demoAuth flags', () => {
  it('is disabled when the flag is missing or not true', () => {
    expect(isJwtEnabled(undefined)).toBe(false);
    expect(isJwtEnabled('false')).toBe(false);
    expect(isJwtConfigured(undefined, 'secret')).toBe(false);
  });

  it('is not configured when enabled without a secret', () => {
    expect(isJwtEnabled('true')).toBe(true);
    expect(isJwtConfigured('true', undefined)).toBe(false);
    expect(isJwtConfigured('true', '')).toBe(false);
    expect(resolveJwtSecret(PLACEHOLDER_JWT_SECRET)).toBeUndefined();
    expect(isJwtConfigured('true', PLACEHOLDER_JWT_SECRET)).toBe(false);
  });

  it('is configured when enabled with a real secret', () => {
    expect(isJwtConfigured('true', 'real-secret')).toBe(true);
  });
});

describe('applyJwtToConfig', () => {
  it('does not attach JWT handlers when JWT is disabled', () => {
    const config = emptyConfig();
    applyJwtToConfig(config, () => 'user@example.com', { enabled: 'false' });
    expect(config.authHandler).toBeUndefined();
    expect(config.onJwtError).toBeUndefined();
    expect(config.retryPolicy).toBeUndefined();
  });

  it('does not attach authHandler when the secret is missing', () => {
    const config = emptyConfig();
    applyJwtToConfig(config, () => 'user@example.com', {
      enabled: 'true',
    });
    expect(config.authHandler).toBeUndefined();
    expect(config.onJwtError).toBeDefined();
    expect(config.retryPolicy).toEqual({
      maxRetry: 5,
      retryInterval: 5,
      retryBackoff: IterableRetryBackoff.linear,
    });
  });

  it('does not attach authHandler when the secret is the placeholder', () => {
    const config = emptyConfig();
    applyJwtToConfig(config, () => 'user@example.com', {
      enabled: 'true',
      secret: PLACEHOLDER_JWT_SECRET,
    });
    expect(config.authHandler).toBeUndefined();
  });

  it('attaches authHandler, retryPolicy, and onJwtError when configured', () => {
    const config = emptyConfig();
    applyJwtToConfig(config, () => 'user@example.com', {
      enabled: 'true',
      secret: 'real-secret',
    });
    expect(config.authHandler).toBeDefined();
    expect(config.onJwtError).toBeDefined();
    expect(config.retryPolicy).toEqual({
      maxRetry: 5,
      retryInterval: 5,
      retryBackoff: IterableRetryBackoff.linear,
    });
  });

  it('shows only the failure reason on JWT error', () => {
    const config = emptyConfig();
    applyJwtToConfig(config, () => 'user@example.com', { enabled: 'true' });
    const alert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    alert.mockClear();

    config.onJwtError?.({
      userKey: 'user@example.com',
      failedAuthToken: 'header.payload.sig',
      failedRequestTime: 0,
      failureReason: IterableAuthFailureReason.AUTH_TOKEN_SIGNATURE_INVALID,
    });

    expect(alert).toHaveBeenCalledWith(
      'JWT authentication failed',
      'AUTH_TOKEN_SIGNATURE_INVALID'
    );
    const alertArgs = JSON.stringify(alert.mock.calls);
    expect(alertArgs).not.toContain('user@example.com');
    expect(alertArgs).not.toContain('header.payload.sig');
  });
});

describe('jwtFailureReasonLabel', () => {
  it('returns the enum key for numeric reasons', () => {
    expect(
      jwtFailureReasonLabel(
        IterableAuthFailureReason.AUTH_TOKEN_SIGNATURE_INVALID
      )
    ).toBe('AUTH_TOKEN_SIGNATURE_INVALID');
  });

  it('returns Android string reasons unchanged', () => {
    expect(
      jwtFailureReasonLabel(
        'AUTH_TOKEN_SIGNATURE_INVALID' as unknown as IterableAuthFailureReason
      )
    ).toBe('AUTH_TOKEN_SIGNATURE_INVALID');
  });
});

describe('alertJwtPrefetchFailure', () => {
  it('shows only a generation-error reason', () => {
    const alert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    alert.mockClear();

    alertJwtPrefetchFailure();

    expect(alert).toHaveBeenCalledWith(
      'JWT authentication failed',
      'AUTH_TOKEN_GENERATION_ERROR'
    );
  });
});
