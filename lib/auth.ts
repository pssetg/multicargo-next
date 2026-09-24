// Node-only auth helpers (scrypt password hashing + CLIENT_USERS parsing).
// Only import this from Node.js runtime route handlers — never from
// middleware (Edge runtime), which uses lib/session.ts instead.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export type ClientUser = { email: string; passwordHash: string; addedAt?: string };

const SCRYPT_KEYLEN = 64;

/** `scrypt:<saltHex>:<hashHex>` — no extra npm dependency needed for hashing. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPasswordHash(password: string, stored: string): boolean {
  try {
    const [scheme, saltHex, hashHex] = stored.split(':');
    if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = scryptSync(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * Reads CLIENT_USERS from process.env (server-only, never NEXT_PUBLIC_).
 * Empty, missing, or malformed → no users, i.e. nobody can log in yet.
 * That's the expected state until an admin fills the env var in Vercel.
 */
export function getClientUsers(): ClientUser[] {
  const raw = process.env.CLIENT_USERS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (u): u is ClientUser => !!u && typeof u.email === 'string' && typeof u.passwordHash === 'string',
    );
  } catch {
    return [];
  }
}
