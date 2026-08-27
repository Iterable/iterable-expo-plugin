import {
  IterableAuthFailureReason,
  IterableRetryBackoff,
  type IterableAuthFailure,
  type IterableConfig,
} from '@iterable/react-native-sdk';
import { Alert } from 'react-native';

import { signDemoJwt } from './signDemoJwt';

const PLACEHOLDER_JWT_SECRET = 'YOUR_ITERABLE_JWT_SECRET';

export function isJwtEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ITERABLE_JWT_ENABLED === 'true';
}

export function getJwtSecret(): string | undefined {
  const secret = process.env.EXPO_PUBLIC_ITERABLE_JWT_SECRET;
  if (!secret || secret === PLACEHOLDER_JWT_SECRET) {
    return undefined;
  }
  return secret;
}

export function isJwtConfigured(): boolean {
  return isJwtEnabled() && getJwtSecret() !== undefined;
}

/**
 * DEMO ONLY. Production apps should replace this local signer with a backend
 * fetch, for example:
 *
 * ```
 * const response = await fetch('https://your-backend.example/iterable-jwt', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email }),
 * });
 * return response.text();
 * ```
 */
export async function getDemoAuthToken(email: string): Promise<string> {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  return signDemoJwt({ email, secret });
}

export function jwtFailureReasonLabel(
  failureReason: IterableAuthFailure['failureReason']
): string {
  if (typeof failureReason === 'string') {
    return failureReason;
  }
  return IterableAuthFailureReason[failureReason] ?? 'Unknown error';
}

export function applyJwtToConfig(
  config: IterableConfig,
  getEmail: () => string
): void {
  if (!isJwtEnabled()) {
    return;
  }

  config.retryPolicy = {
    maxRetry: 5,
    retryInterval: 5,
    retryBackoff: IterableRetryBackoff.linear,
  };

  config.onJwtError = (authFailure: IterableAuthFailure) => {
    Alert.alert(
      'JWT authentication failed',
      jwtFailureReasonLabel(authFailure.failureReason)
    );
  };

  if (!isJwtConfigured()) {
    return;
  }

  config.authHandler = () => getDemoAuthToken(getEmail());
}
