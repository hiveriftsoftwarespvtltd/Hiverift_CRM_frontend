import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  PhoneCall,
  FileText,
  Users,
  FolderKanban,
  CheckSquare,
  RefreshCw,
  CreditCard,
  UserCog,
  Clock,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Settings,
  Zap,
  Receipt,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const getSections = () => {
    const role = user?.role;

    if (role === 'sales') {
      return [
        {
          title: 'MAIN',
          items: [{ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> }],
        },
        {
          title: 'SALES',
          items: [
            { label: 'Leads', path: '/leads', icon: <UserCheck size={18} /> },
            { label: 'Telecalling', path: '/calling', icon: <PhoneCall size={18} /> },
            { label: 'Quotations', path: '/quotations', icon: <FileText size={18} /> },
            { label: 'Clients', path: '/clients', icon: <Users size={18} /> },
            { label: 'Renewals', path: '/renewals', icon: <RefreshCw size={18} /> },
            { label: 'Payments', path: '/payments', icon: <CreditCard size={18} /> },
          ],
        },
        {
          title: 'PROJECTS',
          items: [{ label: 'Projects', path: '/projects', icon: <FolderKanban size={18} /> }],
        },
        {
          title: 'MY ACCOUNT',
          items: [
            { label: 'Attendance', path: '/attendance', icon: <Clock size={18} /> },
            { label: 'Leaves', path: '/leaves', icon: <CalendarDays size={18} /> },
          ],
        },
      ];
    }

    if (role === 'development' || role === 'digital_marketing') {
      return [
        {
          title: 'MAIN',
          items: [{ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> }],
        },
        {
          title: 'PROJECTS',
          items: [
            { label: 'Projects', path: '/projects', icon: <FolderKanban size={18} /> },
            { label: 'Tasks', path: '/tasks', icon: <CheckSquare size={18} /> },
          ],
        },
        {
          title: 'MY ACCOUNT',
          items: [
            { label: 'Attendance', path: '/attendance', icon: <Clock size={18} /> },
            { label: 'Leaves', path: '/leaves', icon: <CalendarDays size={18} /> },
          ],
        },
      ];
    }

    if (role === 'hr') {
      return [
        {
          title: 'MAIN',
          items: [{ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> }],
        },
        {
          title: 'TEAM',
          items: [
            { label: 'Employees', path: '/employees', icon: <UserCog size={18} /> },
            { label: 'Attendance', path: '/attendance', icon: <Clock size={18} /> },
            { label: 'Leaves', path: '/leaves', icon: <CalendarDays size={18} /> },
          ],
        },
        {
          title: 'ANALYTICS',
          items: [{ label: 'Reports', path: '/reports', icon: <BarChart3 size={18} /> }],
        },
      ];
    }

    // Default: Super Admin / Management
    return [
      {
        title: 'MAIN',
        items: [{ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> }],
      },
      {
        title: 'SALES',
        items: [
          { label: 'Leads', path: '/leads', icon: <UserCheck size={18} /> },
          { label: 'Telecalling', path: '/calling', icon: <PhoneCall size={18} /> },
          { label: 'Quotations', path: '/quotations', icon: <FileText size={18} /> },
          { label: 'Invoices', path: '/invoices', icon: <Receipt size={18} /> },
          { label: 'Clients', path: '/clients', icon: <Users size={18} /> },
        ],
      },
      {
        title: 'OPERATIONS',
        items: [
          { label: 'Projects', path: '/projects', icon: <FolderKanban size={18} /> },
          { label: 'Tasks', path: '/tasks', icon: <CheckSquare size={18} /> },
          { label: 'Renewals', path: '/renewals', icon: <RefreshCw size={18} /> },
          { label: 'Payments', path: '/payments', icon: <CreditCard size={18} /> },
        ],
      },
      {
        title: 'TEAM',
        items: [
          { label: 'Employees', path: '/employees', icon: <UserCog size={18} /> },
          { label: 'Attendance', path: '/attendance', icon: <Clock size={18} /> },
          { label: 'Leaves', path: '/leaves', icon: <CalendarDays size={18} /> },
        ],
      },
      {
        title: 'ANALYTICS',
        items: [
          { label: 'Reports', path: '/reports', icon: <BarChart3 size={18} /> },
          { label: 'Audit Logs', path: '/audit', icon: <ShieldCheck size={18} /> },
        ],
      },
      {
        title: 'SYSTEM',
        items: [{ label: 'Settings', path: '/settings', icon: <Settings size={18} /> }],
      },
    ];
  };

  const sections = getSections();

  return (
    <aside className={`crm-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo">
        <img
          src="/logo.png"
          alt="HiveRift"
          style={{
            height: 40,
            width: 'auto',
            maxWidth: 180,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* Nav Items */}
      <div className="sidebar-nav">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) onClose();
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</div>
            <div style={{ color: '#A8C9BE', fontSize: 11, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
