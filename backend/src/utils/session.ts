import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically random session ID with 128 bits of entropy
 * @returns 32-character hexadecimal string
 */
export function generateSessionId(): string {
  const bytes = randomBytes(16); // 16 bytes = 128 bits
  return bytes.toString('hex');
}
