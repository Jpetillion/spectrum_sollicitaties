import { Bell, Check } from '@phosphor-icons/react';
import { formatDateTime } from '../../lib/format.js';

export default function Notification({ notification, onMarkAsRead }) {
  return (
    <div className={`notification ${notification.is_read ? 'notification--read' : ''}`}>
      <div className="notification__icon">
        <Bell size={20} weight={notification.is_read ? 'regular' : 'fill'} />
      </div>
      <div className="notification__content">
        <p className="notification__message">{notification.message}</p>
        <span className="notification__time">{formatDateTime(notification.created_at)}</span>
      </div>
      {!notification.is_read && (
        <button
          className="notification__action"
          onClick={() => onMarkAsRead(notification.id)}
          aria-label="Markeer als gelezen"
        >
          <Check size={18} />
        </button>
      )}
    </div>
  );
}
