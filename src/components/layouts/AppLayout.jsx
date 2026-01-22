import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  House,
  Briefcase,
  FileText,
  Users,
  Envelope,
  Bell,
  SignOut,
  Question
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

          <Link to="/help" className="nav-item">
            <Question size={20} weight="duotone" />
            <span>Hulp</span>
          </Link>
        </nav>

        <div className="sidebar__footer">
          <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
            <Link to="/settings" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3l-2.64-23.72a8,8,0,0,0-3.93-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.6,70q-2.64.29-5.28.66a8,8,0,0,0-3.93,6,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40.16,130.16Q40,132,40,133.84L25.11,152.48a8,8,0,0,0-1.48,7.06A107.6,107.6,0,0,0,34.51,185.89a8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3l2.64,23.72a8,8,0,0,0,3.93,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3l23.72-2.64a8,8,0,0,0,6-3.93,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.89a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.19,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.11a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"/>
              </svg>
              <span>Instellingen</span>
            </Link>
          </div>
          <div className="user-info" style={{ paddingTop: '1rem', paddingLeft: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
                          <p>{notif.message}</p>
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
