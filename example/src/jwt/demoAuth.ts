import {
  IterableAuthFailureReason,
  IterableRetryBackoff,
  type IterableAuthFailure,
  type IterableConfig,
} from '@iterable/react-native-sdk';
import { Alert } from 'react-native';

import { signDemoJwt } from './signDemoJwt';

export const PLACEHOLDER_JWT_SECRET = 'YOUR_ITERABLE_JWT_SECRET';

export type JwtDemoEnv = {
  enabled?: string;
  secret?: string;
};

export function isJwtEnabled(
  enabled: string | undefined = process.env.EXPO_PUBLIC_ITERABLE_JWT_ENABLED
): boolean {
  return enabled === 'true';
}

export function resolveJwtSecret(
  secret: string | undefined = process.env.EXPO_PUBLIC_ITERABLE_JWT_SECRET
): string | undefined {
  if (!secret || secret === PLACEHOLDER_JWT_SECRET) {
    return undefined;
  }
  return secret;
}

export function isJwtConfigured(
  enabled: string | undefined = process.env.EXPO_PUBLIC_ITERABLE_JWT_ENABLED,
  secret: string | undefined = process.env.EXPO_PUBLIC_ITERABLE_JWT_SECRET
): boolean {
  return isJwtEnabled(enabled) && resolveJwtSecret(secret) !== undefined;
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
export async function getDemoAuthToken(
  email: string,
  secret: string | undefined = resolveJwtSecret()
): Promise<string> {
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

export function alertJwtFailure(reason: string): void {
  Alert.alert('JWT authentication failed', reason);
}

export function alertJwtPrefetchFailure(): void {
  alertJwtFailure(
    jwtFailureReasonLabel(IterableAuthFailureReason.AUTH_TOKEN_GENERATION_ERROR)
  );
}

export function applyJwtToConfig(
  config: IterableConfig,
  getEmail: () => string,
  env: JwtDemoEnv = {
    enabled: process.env.EXPO_PUBLIC_ITERABLE_JWT_ENABLED,
    secret: process.env.EXPO_PUBLIC_ITERABLE_JWT_SECRET,
  }
): void {
  if (!isJwtEnabled(env.enabled)) {
    return;
  }

  config.retryPolicy = {
    maxRetry: 5,
    retryInterval: 5,
    retryBackoff: IterableRetryBackoff.linear,
  };

  config.onJwtError = (authFailure: IterableAuthFailure) => {
    alertJwtFailure(jwtFailureReasonLabel(authFailure.failureReason));
  };

  if (!isJwtConfigured(env.enabled, env.secret)) {
    return;
  }

  config.authHandler = () => getDemoAuthToken(getEmail(), env.secret);
}
