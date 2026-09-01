import { createHmac } from 'crypto';

import { DEMO_JWT_TTL_SECONDS, signDemoJwt } from './signDemoJwt';

function decodeJwtPayload(token: string): {
  email?: string;
  iat?: number;
  exp?: number;
  userId?: string;
} {
  const payload = token.split('.')[1];
  if (!payload) {
    throw new Error('JWT is missing a payload');
  }
  const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const json = Buffer.from(padded + '='.repeat(padLength), 'base64').toString(
    'utf8'
  );
  return JSON.parse(json) as {
    email?: string;
    iat?: number;
    exp?: number;
    userId?: string;
  };
}

describe('signDemoJwt', () => {
  const email = 'demo@example.com';
  const secret = 'test-secret';
  const nowSeconds = 1_700_000_000;

  it('returns a three-part HS256 token', async () => {
    const token = await signDemoJwt({ email, secret, nowSeconds });
    expect(token.split('.')).toHaveLength(3);
  });

  it('includes email, iat, and exp, and omits userId', async () => {
    const token = await signDemoJwt({ email, secret, nowSeconds });
    const payload = decodeJwtPayload(token);
    expect(payload.email).toBe(email);
    expect(payload.iat).toBe(nowSeconds);
    expect(payload.exp).toBe(nowSeconds + DEMO_JWT_TTL_SECONDS);
    expect(payload).not.toHaveProperty('userId');
  });

  it('produces a different signature for a different secret', async () => {
    const valid = await signDemoJwt({ email, secret, nowSeconds });
    const invalid = await signDemoJwt({
      email,
      secret: 'other-secret',
      nowSeconds,
    });
    expect(valid.split('.')[2]).not.toBe(invalid.split('.')[2]);
  });

  it('matches Node crypto HMAC-SHA256', async () => {
    const token = await signDemoJwt({ email, secret, nowSeconds });
    const [header, payload, signature] = token.split('.');
    expect(header).toBeDefined();
    expect(payload).toBeDefined();
    expect(signature).toBeDefined();
    const signingInput = `${header}.${payload}`;
    const expected = createHmac('sha256', secret)
      .update(signingInput)
      .digest('base64url');
    expect(signature).toBe(expected);
  });
});
