import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';

/**
 * Generate a new MFA secret for a user
 * @param {string} userEmail - User's email
 * @returns {Object} - { secret: string, otpAuthUrl: string, backupCodes: string[] }
 */
export async function generateMfaSecret(userEmail) {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `Het Spectrum (${userEmail})`,
    issuer: 'Het Spectrum',
    length: 32
  });

  // Generate 8 backup codes (8 digits each)
  const backupCodes = Array.from({ length: 8 }, () => {
    return Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
  });

  return {
    secret: secret.base32,
    otpAuthUrl: secret.otpauth_url,
    backupCodes
  };
}

/**
 * Verify a TOTP token
 * @param {string} secret - Base32 encoded secret
 * @param {string} token - 6-digit token from user
 * @returns {boolean} - True if valid
 */
export function verifyMfaToken(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1 // Allow 30s clock skew
  });
}

/**
 * Hash backup codes for storage
 * @param {string[]} codes - Plain backup codes
 * @returns {Promise<string[]>} - Hashed codes
 */
export async function hashBackupCodes(codes) {
  return Promise.all(
    codes.map(code => bcrypt.hash(code, 10))
  );
}

/**
 * Verify a backup code
 * @param {string} code - Plain backup code from user
 * @param {string[]} hashedCodes - Array of hashed codes from DB
 * @returns {Promise<number|null>} - Index of matched code, or null
 */
export async function verifyBackupCode(code, hashedCodes) {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);
    if (isValid) {
      return i;
    }
  }
  return null;
}

/**
 * Generate a temporary MFA token (for multi-step login)
 * @param {string} userId - User ID
 * @returns {string} - Random token
 */
export function generateTempToken(userId) {
  const randomBytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');

  return `${userId}:${randomBytes}:${Date.now()}`;
}

/**
 * Verify a temporary token (with expiry check)
 * @param {string} token - Temp token
 * @param {number} maxAgeMs - Max age in milliseconds (default 5 min)
 * @returns {string|null} - User ID if valid, null otherwise
 */
export function verifyTempToken(token, maxAgeMs = 5 * 60 * 1000) {
  try {
    const [userId, , timestamp] = token.split(':');
    const age = Date.now() - parseInt(timestamp);

    if (age > maxAgeMs) {
      return null; // Expired
    }

    return userId;
  } catch {
    return null;
  }
}
