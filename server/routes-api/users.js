import express from 'express';
import { executeQuery } from '../db/client.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { requireAuth, requireRole } from '../auth/jwt.js';

const router = express.Router();

// ============================================
// SELF-SERVICE ENDPOINTS (All authenticated users)
// ============================================

/**
 * GET /api/users/me
 * Get current user's profile (with fresh data from DB)
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await executeQuery(
      'SELECT id, name, email, role, mfa_enabled, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfa_enabled === 1,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden' });
  }
});

/**
 * PUT /api/users/me
 * Update current user's profile (name and/or password)
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name && !newPassword) {
      return res.status(400).json({ error: 'Naam of nieuw wachtwoord is verplicht' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Huidig wachtwoord is verplicht om het wachtwoord te wijzigen' });
      }

      // Verify current password
      const userResult = await executeQuery(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      const user = userResult.rows[0];
      if (!user) {
        return res.status(404).json({ error: 'Gebruiker niet gevonden' });
      }

      const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Huidig wachtwoord is onjuist' });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Nieuw wachtwoord moet minstens 8 karakters bevatten' });
      }

      // Hash new password and update
      const newPasswordHash = await hashPassword(newPassword);
      await executeQuery(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, userId]
      );
    }

    // Update name if provided
    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({ error: 'Naam moet minstens 2 karakters bevatten' });
      }

      await executeQuery(
        'UPDATE users SET name = ? WHERE id = ?',
        [name.trim(), userId]
      );
    }

    // Fetch updated user data
    const updatedResult = await executeQuery(
      'SELECT id, name, email, role, mfa_enabled FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedResult.rows[0];

    res.json({
      message: 'Profiel succesvol bijgewerkt',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        mfaEnabled: updatedUser.mfa_enabled === 1
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het bijwerken van je profiel' });
  }
});

// ============================================
// ADMIN ENDPOINTS (Admin users only)
// ============================================

/**
 * GET /api/users
 * List all users (admin only)
 */
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const result = await executeQuery(
      'SELECT id, name, email, role, mfa_enabled, created_at FROM users ORDER BY name ASC',
      []
    );

    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfa_enabled === 1,
      createdAt: user.created_at
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het ophalen van gebruikers' });
  }
});

/**
 * POST /api/users
 * Create new user (admin only)
 */
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // Validate input
    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'Naam, email, rol en wachtwoord zijn verplicht' });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Naam moet minstens 2 karakters bevatten' });
    }

    // Validate email
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Ongeldig email adres' });
    }

    // Validate role
    if (!['admin', 'directie', 'staf'].includes(role)) {
      return res.status(400).json({ error: 'Ongeldige rol. Kies admin, directie of staf' });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ error: 'Wachtwoord moet minstens 8 karakters bevatten' });
    }

    // Check if email already exists
    const existingResult = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Een gebruiker met dit email adres bestaat al' });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const result = await executeQuery(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, role]
    );

    // Fetch created user
    const newUser = await executeQuery(
      'SELECT id, name, email, role, mfa_enabled, created_at FROM users WHERE id = ?',
      [result.lastInsertRowid]
    );

    res.status(201).json({
      message: 'Gebruiker succesvol aangemaakt',
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
        mfaEnabled: newUser.rows[0].mfa_enabled === 1,
        createdAt: newUser.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het aanmaken van de gebruiker' });
  }
});

/**
 * PUT /api/users/:id
 * Update user (admin only)
 */
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, role, password } = req.body;

    // Check if user exists
    const existingResult = await executeQuery(
      'SELECT id, role FROM users WHERE id = ?',
      [userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({ error: 'Naam moet minstens 2 karakters bevatten' });
      }
      updates.push('name = ?');
      values.push(name.trim());
    }

    if (email !== undefined) {
      if (!email.includes('@')) {
        return res.status(400).json({ error: 'Ongeldig email adres' });
      }

      // Check if email is already taken by another user
      const emailCheck = await executeQuery(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email.toLowerCase().trim(), userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Dit email adres is al in gebruik' });
      }

      updates.push('email = ?');
      values.push(email.toLowerCase().trim());
    }

    if (role !== undefined) {
      if (!['admin', 'directie', 'staf'].includes(role)) {
        return res.status(400).json({ error: 'Ongeldige rol' });
      }
      updates.push('role = ?');
      values.push(role);
    }

    if (password !== undefined) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Wachtwoord moet minstens 8 karakters bevatten' });
      }
      const passwordHash = await hashPassword(password);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Geen wijzigingen opgegeven' });
    }

    // Update user
    values.push(userId);
    await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const updatedResult = await executeQuery(
      'SELECT id, name, email, role, mfa_enabled, created_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedResult.rows[0];

    res.json({
      message: 'Gebruiker succesvol bijgewerkt',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        mfaEnabled: updatedUser.mfa_enabled === 1,
        createdAt: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het bijwerken van de gebruiker' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    // Check if user exists
    const existingResult = await executeQuery(
      'SELECT id, role, email FROM users WHERE id = ?',
      [userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    const userToDelete = existingResult.rows[0];

    // Prevent admin from deleting themselves
    if (userId === currentUserId) {
      return res.status(403).json({ error: 'Je kunt jezelf niet verwijderen' });
    }

    // Check if this is the last admin
    if (userToDelete.role === 'admin') {
      const adminCountResult = await executeQuery(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['admin']
      );

      const adminCount = adminCountResult.rows[0].count;
      if (adminCount <= 1) {
        return res.status(403).json({ error: 'Je kunt de laatste admin niet verwijderen' });
      }
    }

    // Delete user
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      message: `Gebruiker ${userToDelete.email} succesvol verwijderd`
    });
  } catch (error) {
    console.error('Error deleting user:', error);

    // Check if it's a foreign key constraint error
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({
        error: 'Deze gebruiker kan niet worden verwijderd omdat er nog gerelateerde gegevens zijn (notificaties, evaluaties, of sollicitaties). Verwijder eerst deze gegevens of maak de gebruiker inactief.'
      });
    }

    res.status(500).json({ error: 'Er is een fout opgetreden bij het verwijderen van de gebruiker' });
  }
});

export default router;
