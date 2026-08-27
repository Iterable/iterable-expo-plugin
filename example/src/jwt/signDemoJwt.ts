/**
 * DEMO ONLY. Signs an Iterable JWT with HS256 in JavaScript so the example
 * survives `expo prebuild --clean`. Production apps must fetch JWTs from a
 * backend and must never embed the Iterable JWT secret.
 *
 * Algorithm matches the RN example's IterableJwtGenerator: HS256, URL-safe
 * base64 without padding, payload `{ email, iat, exp }` (no userId).
 */

export const DEMO_JWT_TTL_SECONDS = 86_400;

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export type SignDemoJwtParams = {
  email: string;
  secret: string;
  /** Unix timestamp in seconds. Defaults to now. Exposed for tests. */
  nowSeconds?: number;
};

export async function signDemoJwt({
  email,
  secret,
  nowSeconds,
}: SignDemoJwtParams): Promise<string> {
  const iat = nowSeconds ?? Math.floor(Date.now() / 1000);
  const exp = iat + DEMO_JWT_TTL_SECONDS;

  const header = base64UrlEncodeUtf8('{"alg":"HS256","typ":"JWT"}');
  const payload = base64UrlEncodeUtf8(JSON.stringify({ email, iat, exp }));
  const signingInput = `${header}.${payload}`;
  const signature = base64UrlEncode(await hmacSha256(secret, signingInput));

  return `${signingInput}.${signature}`;
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.subtle == null) {
    throw new Error('Web Crypto is not available for demo JWT signing');
  }

  const encoder = new TextEncoder();
  const key = await cryptoApi.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await cryptoApi.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  return new Uint8Array(signature);
}

function base64UrlEncodeUtf8(value: string): string {
  return base64UrlEncode(new TextEncoder().encode(value));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triplet = (a << 16) | (b << 8) | c;
    result += BASE64_ALPHABET.charAt((triplet >> 18) & 63);
    result += BASE64_ALPHABET.charAt((triplet >> 12) & 63);
    result += BASE64_ALPHABET.charAt((triplet >> 6) & 63);
    result += BASE64_ALPHABET.charAt(triplet & 63);
  }
  const padding = (3 - (bytes.length % 3)) % 3;
  if (padding > 0) {
    result = result.slice(0, result.length - padding);
  }
  return result.replace(/[+]/g, '-').replace(/\//g, '_');
}
