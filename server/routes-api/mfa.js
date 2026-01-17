import express from 'express';
import { executeQuery } from '../db/client.js';
import {
  generateMfaSecret,
  verifyMfaToken,
  hashBackupCodes,
  verifyBackupCode
} from '../auth/mfa.js';
import { verifyPassword } from '../auth/password.js';

const router = express.Router();

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Niet ingelogd' });
  }
  next();
}

/**
 * POST /api/mfa/setup/generate
 * Generate QR code and backup codes for MFA setup
 */
router.post('/setup/generate', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userEmail = req.session.userEmail;

    // Generate MFA secret and backup codes
    const { secret, otpAuthUrl, backupCodes } = await generateMfaSecret(userEmail);

    // Temporarily store in session (will be saved to DB on verification)
    req.session.mfaPendingSecret = secret;
    req.session.mfaPendingBackupCodes = backupCodes;

    res.json({
      otpAuthUrl,
      secret,
      backupCodes
    });
  } catch (error) {
    console.error('MFA setup generate error:', error);
    res.status(500).json({ error: 'Fout bij genereren MFA setup' });
  }
});

/**
 * POST /api/mfa/setup/verify
 * Verify setup token and enable MFA
 */
router.post('/setup/verify', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.session.userId;

    if (!token) {
      return res.status(400).json({ error: 'Token is verplicht' });
    }

    const pendingSecret = req.session.mfaPendingSecret;
    const pendingBackupCodes = req.session.mfaPendingBackupCodes;

    if (!pendingSecret || !pendingBackupCodes) {
      return res.status(400).json({ error: 'Geen pending MFA setup gevonden. Start opnieuw.' });
    }

    // Verify the token
    const isValid = verifyMfaToken(pendingSecret, token);

    if (!isValid) {
      return res.status(400).json({ error: 'Ongeldige code. Probeer opnieuw.' });
    }

    // Hash backup codes
    const hashedBackupCodes = await hashBackupCodes(pendingBackupCodes);

    // Save to database
    await executeQuery(
      'UPDATE users SET mfa_enabled = 1, mfa_secret = ?, mfa_backup_codes = ? WHERE id = ?',
      [pendingSecret, JSON.stringify(hashedBackupCodes), userId]
    );

    // Clear pending data from session
    delete req.session.mfaPendingSecret;
    delete req.session.mfaPendingBackupCodes;

    res.json({
      success: true,
      message: '2FA succesvol ingeschakeld'
    });
  } catch (error) {
    console.error('MFA setup verify error:', error);
    res.status(500).json({ error: 'Fout bij verifiëren MFA setup' });
  }
});

/**
 * POST /api/mfa/verify
 * Verify an MFA token (for testing)
 */
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.session.userId;

    const result = await executeQuery(
      'SELECT mfa_secret FROM users WHERE id = ? AND mfa_enabled = 1',
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'MFA niet ingeschakeld' });
    }

    const isValid = verifyMfaToken(user.mfa_secret, token);

    res.json({ valid: isValid });
  } catch (error) {
    console.error('MFA verify error:', error);
    res.status(500).json({ error: 'Fout bij verifiëren MFA token' });
  }
});

/**
 * POST /api/mfa/disable
 * Disable MFA (requires password confirmation)
 */
router.post('/disable', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.session.userId;

    if (!password) {
      return res.status(400).json({ error: 'Wachtwoord is verplicht' });
    }

    // Get user
    const result = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Onjuist wachtwoord' });
    }

    // Disable MFA
    await executeQuery(
      'UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_backup_codes = NULL WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: '2FA uitgeschakeld'
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ error: 'Fout bij uitschakelen MFA' });
  }
});

/**
 * GET /api/mfa/status
 * Get MFA status for current user
 */
router.get('/status', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    const result = await executeQuery(
      'SELECT mfa_enabled, mfa_backup_codes FROM users WHERE id = ?',
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    let backupCodesRemaining = 0;
    if (user.mfa_backup_codes) {
      try {
        const codes = JSON.parse(user.mfa_backup_codes);
        backupCodesRemaining = codes.length;
      } catch (e) {
        // Invalid JSON
      }
    }

    res.json({
      mfaEnabled: user.mfa_enabled === 1,
      backupCodesRemaining
    });
  } catch (error) {
    console.error('MFA status error:', error);
    res.status(500).json({ error: 'Fout bij ophalen MFA status' });
  }
});

/**
 * POST /api/mfa/backup-codes/regenerate
 * Regenerate backup codes (requires MFA verification)
 */
router.post('/backup-codes/regenerate', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.session.userId;

    if (!token) {
      return res.status(400).json({ error: 'MFA token is verplicht' });
    }

    // Get user
    const result = await executeQuery(
      'SELECT mfa_enabled, mfa_secret FROM users WHERE id = ?',
      [userId]
    );

    const user = result.rows[0];
    if (!user || user.mfa_enabled !== 1) {
      return res.status(400).json({ error: 'MFA niet ingeschakeld' });
    }

    // Verify MFA token
    const isValid = verifyMfaToken(user.mfa_secret, token);
    if (!isValid) {
      return res.status(401).json({ error: 'Ongeldige MFA code' });
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 8 }, () => {
      return Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 10)
      ).join('');
    });

    // Hash and save
    const hashedBackupCodes = await hashBackupCodes(backupCodes);
    await executeQuery(
      'UPDATE users SET mfa_backup_codes = ? WHERE id = ?',
      [JSON.stringify(hashedBackupCodes), userId]
    );

    res.json({
      success: true,
      backupCodes
    });
  } catch (error) {
    console.error('MFA backup codes regenerate error:', error);
    res.status(500).json({ error: 'Fout bij regenereren backup codes' });
  }
});

export default router;
