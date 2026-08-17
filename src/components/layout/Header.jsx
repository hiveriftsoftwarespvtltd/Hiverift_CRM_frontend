import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../api';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getAll();
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setUnreadCount(0);
    fetchNotifications();
  };

  const getNotifIcon = (type) => {
    const icons = { lead: '👤', project: '📁', task: '✅', payment: '💳', renewal: '🔄', leave: '📋' };
    return icons[type] || '🔔';
  };

  return (
    <header className="crm-header">
      {/* Menu toggle (mobile) */}
      <button
        onClick={onMenuToggle}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
        className="menu-toggle"
      >
        <Menu size={22} />
      </button>

      {/* Search */}
      <div className="search-box" style={{ flex: 1, maxWidth: 340 }}>
        <Search />
        <input className="search-input" placeholder="Search leads, clients, projects..." />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Notifications */}
        <div ref={notifsRef} style={{ position: 'relative' }}>
          <button className="notif-bell" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', right: 0, top: '110%',
              width: 360, background: 'white', borderRadius: 12,
              border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden',
              animation: 'slideUp 0.15s ease'
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-heading)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bell size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontSize: 13 }}>No notifications yet</p>
                  </div>
                ) : notifications.map((notif) => (
                  <div key={notif._id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: notif.isRead ? 'white' : 'var(--primary-very-light)',
                    cursor: 'pointer',
                    transition: 'background 0.1s'
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18 }}>{getNotifIcon(notif.type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>{notif.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{notif.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {!notif.isRead && (
                        <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: 8,
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div className="avatar avatar-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showProfile && (
            <div style={{
              position: 'absolute', right: 0, top: '110%',
              width: 200, background: 'white', borderRadius: 12,
              border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden', animation: 'slideUp 0.15s ease'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
              <div style={{ padding: '6px' }}>
                <button
                  onClick={() => { setShowProfile(false); navigate('/profile'); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-body)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={logout}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--red)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--red-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
