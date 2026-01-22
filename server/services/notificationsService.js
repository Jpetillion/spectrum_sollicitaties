import { executeQuery } from '../db/client.js';

export async function createNotification(userId, type, data) {
  const result = await executeQuery(
    'INSERT INTO notifications (user_id, type, related_id, message) VALUES (?, ?, ?, ?)',
    [userId, type, data.related_id || null, data.message]
  );
  return result.lastInsertRowid;
}

export async function getNotificationsForUser(userId, limit = 50) {
  const result = await executeQuery(
    `SELECT * FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return result.rows;
}

export async function markNotificationAsRead(id) {
  await executeQuery('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
}

export async function markAllNotificationsAsRead(userId) {
  await executeQuery('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [userId]);
}

export async function getUnreadCount(userId) {
  const result = await executeQuery(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  return result.rows[0].count;
}

export async function notifyNewApplication(applicationId, candidateName) {
  // Get all directie and staf users
  const users = await executeQuery(
    "SELECT id FROM users WHERE role IN ('directie', 'staf')"
  );

  for (const user of users.rows) {
    await createNotification(user.id, 'new_application', {
      related_id: applicationId,
      message: `Nieuwe sollicitatie van ${candidateName}`
    });
  }
}
