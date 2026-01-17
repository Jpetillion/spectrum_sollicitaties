import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  House,
  Briefcase,
  FileText,
  Users,
  Envelope,
  Bell,
  SignOut
} from '@phosphor-icons/react';
import { api } from '../../lib/apiClient.js';

export default function AppLayout({ user, children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      // Force a full page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login page
      window.location.href = '/login';
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar__header">
          <h1 className="sidebar__title">Het Spectrum</h1>
          <p className="sidebar__subtitle">Sollicitaties</p>
        </div>

        <nav className="sidebar__nav">
          <Link to="/" className="nav-item">
            <House size={20} weight="duotone" />
            <span>Dashboard</span>
          </Link>

          <Link to="/jobs" className="nav-item">
            <Briefcase size={20} weight="duotone" />
            <span>Vacatures</span>
          </Link>

          <Link to="/applications" className="nav-item">
            <FileText size={20} weight="duotone" />
            <span>Sollicitaties</span>
          </Link>

          <Link to="/candidates" className="nav-item">
            <Users size={20} weight="duotone" />
            <span>Kandidaten</span>
          </Link>

          <Link to="/mail/outbox" className="nav-item">
            <Envelope size={20} weight="duotone" />
            <span>Mails</span>
          </Link>
        </nav>

        <div className="sidebar__footer">
          <div className="user-info">
            <div className="user-info__name">{user?.name}</div>
            <div className="user-info__role">{user?.role}</div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar__actions">
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <button
                className="notification-button"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={24} weight={unreadCount > 0 ? 'fill' : 'regular'} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-dropdown__header">
                    <h3>Notificaties</h3>
                    {unreadCount > 0 && (
                      <button
                        className="link-button"
                        onClick={async () => {
                          await api.markAllNotificationsRead();
                          loadNotifications();
                        }}
                      >
                        Alles markeren als gelezen
                      </button>
                    )}
                  </div>
                  <div className="notifications-dropdown__list">
                    {notifications.length === 0 ? (
                      <div className="notifications-empty">Geen notificaties</div>
                    ) : (
                      notifications.slice(0, 10).map(notif => (
                        <div
                          key={notif.id}
                          className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                        >
                          <p>{notif.payload_json?.message}</p>
                          {!notif.is_read && (
                            <button onClick={() => handleMarkAsRead(notif.id)}>
                              Markeer gelezen
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="logout-button" onClick={handleLogout}>
              <SignOut size={24} />
              <span>Uitloggen</span>
            </button>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
