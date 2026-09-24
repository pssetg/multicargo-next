// Signed, stateless session tokens (HMAC-SHA256 over a JSON payload), built
// only on the Web Crypto API so the same code runs in both the Edge
// middleware (which guards /[locale]/cabinet) and the Node.js API routes
// that issue the cookies — no `node:crypto` import here on purpose.

function base64url(bytes: Uint8Array): string {
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBytes(b64url: string): Uint8Array {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '=');
  const str = atob(padded);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

const textEncoder = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', textEncoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export type SessionPayload = Record<string, unknown> & { exp: number };

export async function signSession(
  payload: Record<string, unknown>,
  secret: string,
  maxAgeSeconds: number,
): Promise<string> {
  const body: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds };
  const bodyB64 = base64url(textEncoder.encode(JSON.stringify(body)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(bodyB64));
  return `${bodyB64}.${base64url(new Uint8Array(sig))}`;
}

export async function verifySession<T extends Record<string, unknown> = Record<string, unknown>>(
  token: string | undefined | null,
  secret: string,
): Promise<(T & SessionPayload) | null> {
  if (!token) return null;
  const [bodyB64, sigB64] = token.split('.');
  if (!bodyB64 || !sigB64) return null;

  try {
    const key = await hmacKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlToBytes(sigB64) as BufferSource,
      textEncoder.encode(bodyB64) as BufferSource,
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(bodyB64))) as T & SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
