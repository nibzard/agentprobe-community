/**
 * Cryptographic utilities using Web Crypto API for Cloudflare Workers compatibility
 */

// Constants for key generation and hashing
const API_KEY_PREFIX = 'ap_';
const SECRET_KEY_LENGTH = 32; // 256 bits
const KEY_ID_LENGTH = 16; // 128 bits for key ID

/**
 * Generate a secure random API key pair
 * Returns both the public key ID and the secret key
 */
export async function generateApiKey(): Promise<{ keyId: string; secretKey: string }> {
  // Generate random bytes for key ID (public part)
  const keyIdBytes = crypto.getRandomValues(new Uint8Array(KEY_ID_LENGTH));
  const keyIdHex = Array.from(keyIdBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const keyId = API_KEY_PREFIX + keyIdHex;

  // Generate random bytes for secret key
  const secretBytes = crypto.getRandomValues(new Uint8Array(SECRET_KEY_LENGTH));
  const secretKey = Array.from(secretBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return { keyId, secretKey };
}

/**
 * Hash an API key using PBKDF2 with SHA-256
 * This is secure against timing attacks and provides good protection
 */
export async function hashApiKey(secretKey: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  
  // Generate salt if not provided
  if (!salt) {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    salt = Array.from(saltBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Import the secret key as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000, // 100k iterations for security
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 256 bits output
  );

  const hashArray = new Uint8Array(hashBuffer);
  const hash = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return { hash: `${salt}:${hash}`, salt };
}

/**
 * Verify an API key against a stored hash
 * Uses constant-time comparison to prevent timing attacks
 */
export async function verifyApiKey(secretKey: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, expectedHash] = storedHash.split(':');
    if (!salt || !expectedHash) {
      return false;
    }

    const { hash: computedHash } = await hashApiKey(secretKey, salt);
    const [, actualHash] = computedHash.split(':');

    // Constant-time comparison to prevent timing attacks
    return constantTimeEquals(expectedHash, actualHash);
  } catch (error) {
    // Log security event but don't expose error details
    console.error('API key verification error:', error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Key should be in format: ap_[32 hex chars]_[64 hex chars]
  const keyPattern = /^ap_[a-f0-9]{32}_[a-f0-9]{64}$/;
  return keyPattern.test(key);
}

/**
 * Extract key ID from full API key
 */
export function extractKeyId(apiKey: string): string | null {
  if (!isValidApiKeyFormat(apiKey)) {
    return null;
  }

  const parts = apiKey.split('_');
  if (parts.length !== 3) {
    return null;
  }

  return `${parts[0]}_${parts[1]}`;
}

/**
 * Extract secret from full API key
 */
export function extractSecret(apiKey: string): string | null {
  if (!isValidApiKeyFormat(apiKey)) {
    return null;
  }

  const parts = apiKey.split('_');
  if (parts.length !== 3) {
    return null;
  }

  return parts[2];
}

/**
 * Generate a secure session token (for future use)
 */
export async function generateSessionToken(): Promise<string> {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(tokenBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a full API key from components
 */
export function createFullApiKey(keyId: string, secretKey: string): string {
  return `${keyId}_${secretKey}`;
}