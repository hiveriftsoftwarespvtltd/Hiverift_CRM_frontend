import { useState, useEffect, useRef } from 'react';
import {
  Bell, Menu, Search, LogOut, User, ChevronDown,
  FolderKanban, CheckSquare, CreditCard, RefreshCw, CalendarDays, Coffee,
  Trash2, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Header({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifsRef = useRef(null);
  const profileRef = useRef(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'management' || user?.role === 'super_admin';

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s live poll for break notifications
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

  const handleDeleteNotification = async (e, notifId) => {
    e.stopPropagation();
    try {
      await notificationsAPI.delete(notifId);
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleClearAllNotifications = async (e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Clear All Notifications?',
      text: 'Are you sure you want to delete all notifications?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete All',
      iconColor: '#ef4444',
    });
    if (result.isConfirmed) {
      try {
        await notificationsAPI.deleteAll();
        setNotifications([]);
        setUnreadCount(0);
      } catch (err) {
        console.error('Failed to clear notifications', err);
      }
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationsAPI.markRead(notif._id);
        setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      if (notif.module === 'attendance' || notif.type === 'break') {
        navigate('/attendance');
      } else if (notif.module === 'leads') {
        navigate('/leads');
      } else if (notif.module === 'projects') {
        navigate('/projects');
      }
      setShowNotifs(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    const iconStyle = { color: 'var(--primary)', flexShrink: 0 };
    switch (type) {
      case 'break':
      case 'attendance':
        return <Coffee size={16} style={{ color: '#D97706', flexShrink: 0 }} />;
      case 'lead':
        return <User size={16} style={iconStyle} />;
      case 'project':
        return <FolderKanban size={16} style={iconStyle} />;
      case 'task':
        return <CheckSquare size={16} style={iconStyle} />;
      case 'payment':
        return <CreditCard size={16} style={iconStyle} />;
      case 'renewal':
        return <RefreshCw size={16} style={iconStyle} />;
      case 'leave':
        return <CalendarDays size={16} style={iconStyle} />;
      default:
        return <Bell size={16} style={iconStyle} />;
    }
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
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>Notifications</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Mark all read
                    </button>
                  )}
                  {isAdmin && notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      title="Delete all notifications"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Trash2 size={13} /> Clear all
                    </button>
                  )}
                </div>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bell size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontSize: 13 }}>No notifications yet</p>
                  </div>
                ) : notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: notif.isRead ? 'white' : 'var(--primary-very-light)',
                      cursor: 'pointer',
                      transition: 'background 0.1s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: notif.type === 'break' ? '#FEF3C7' : '#EAF3FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        {getNotifIcon(notif.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>{notif.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4, wordBreak: 'break-word' }}>{notif.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 2 }}>
                        {!notif.isRead && (
                          <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }} />
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(e, notif._id)}
                            title="Delete notification"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.background = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#94a3b8';
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
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
