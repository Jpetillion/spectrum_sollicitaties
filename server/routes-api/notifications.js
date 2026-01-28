import express from 'express';
import { requireAuth } from '../auth/jwt.js';
import * as notificationsService from '../services/notificationsService.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await notificationsService.getNotificationsForUser(req.session.userId);
    const unreadCount = await notificationsService.getUnreadCount(req.session.userId);

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Fout bij ophalen notificaties' });
  }
});

router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    await notificationsService.markNotificationAsRead(req.params.id);
    res.json({ message: 'Notificatie gemarkeerd als gelezen' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Fout bij markeren notificatie' });
  }
});

router.put('/read-all', requireAuth, async (req, res) => {
  try {
    await notificationsService.markAllNotificationsAsRead(req.session.userId);
    res.json({ message: 'Alle notificaties gemarkeerd als gelezen' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Fout bij markeren notificaties' });
  }
});

export default router;
