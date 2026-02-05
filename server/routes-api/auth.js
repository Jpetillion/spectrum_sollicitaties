import express from 'express';
import { executeQuery } from '../db/client.js';
import { verifyPassword } from '../auth/password.js';
import { verifyMfaToken, verifyBackupCode, generateTempToken } from '../auth/mfa.js';
import { signToken } from '../auth/jwt.js';

const router = express.Router();

// Store temp tokens in memory (in production, use Redis)
const tempTokens = new Map();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail en wachtwoord zijn verplicht' });
    }

    const result = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Ongeldige inloggegevens' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Ongeldige inloggegevens' });
    }

    // Check if MFA is enabled
    if (user.mfa_enabled === 1) {
      // Generate temp token for MFA step
      const tempToken = generateTempToken(user.id.toString());
      tempTokens.set(tempToken, {
        userId: user.id,
        email: user.email,
        role: user.role,
        timestamp: Date.now()
      });

      // Clean up old temp tokens (older than 10 minutes)
      for (const [token, data] of tempTokens.entries()) {
        if (Date.now() - data.timestamp > 10 * 60 * 1000) {
          tempTokens.delete(token);
        }
      }

      return res.json({
        mfaRequired: true,
        tempToken
      });
    }

    // No MFA - complete login
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het inloggen' });
  }
});

/**
 * POST /api/auth/login/mfa
 * Complete login with MFA verification
 */
router.post('/login/mfa', async (req, res) => {
  try {
    const { tempToken, code, isBackupCode } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ error: 'Temp token en code zijn verplicht' });
    }

    // Verify temp token
    const tokenData = tempTokens.get(tempToken);
    if (!tokenData) {
      return res.status(401).json({ error: 'Ongeldige of verlopen temp token' });
    }

    // Check token expiry (5 minutes)
    if (Date.now() - tokenData.timestamp > 5 * 60 * 1000) {
      tempTokens.delete(tempToken);
      return res.status(401).json({ error: 'Temp token verlopen. Log opnieuw in.' });
    }

    // Get user with MFA secret
    const result = await executeQuery(
      'SELECT id, email, role, mfa_secret, mfa_backup_codes FROM users WHERE id = ? AND mfa_enabled = 1',
      [tokenData.userId]
    );

    const user = result.rows[0];
    if (!user) {
      tempTokens.delete(tempToken);
      return res.status(401).json({ error: 'MFA niet ingeschakeld voor deze gebruiker' });
    }

    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      const backupCodes = JSON.parse(user.mfa_backup_codes || '[]');
      const matchedIndex = await verifyBackupCode(code, backupCodes);

      if (matchedIndex !== null) {
        verified = true;
        // Remove used backup code
        backupCodes.splice(matchedIndex, 1);
        await executeQuery(
          'UPDATE users SET mfa_backup_codes = ? WHERE id = ?',
          [JSON.stringify(backupCodes), user.id]
        );
      }
    } else {
      // Verify TOTP token
      verified = verifyMfaToken(user.mfa_secret, code);
    }

    if (!verified) {
      return res.status(401).json({ error: 'Ongeldige code' });
    }

    // Delete temp token
    tempTokens.delete(tempToken);

    // Complete login with JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      mfaVerified: true
    });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('MFA login error:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij MFA verificatie' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Succesvol uitgelogd' });
});

router.get('/me', async (req, res) => {
  if (req.user) {
    try {
      // Fetch fresh user data from DB (name can change)
      const result = await executeQuery(
        'SELECT id, name, email, role, mfa_enabled FROM users WHERE id = ?',
        [req.user.id]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({ error: 'Gebruiker niet gevonden' });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mfaEnabled: user.mfa_enabled === 1
        }
      });
    } catch (error) {
      console.error('Error fetching user in /me:', error);
      res.status(500).json({ error: 'Er is een fout opgetreden' });
    }
  } else {
    res.status(401).json({ error: 'Niet ingelogd' });
  }
});

export default router;
