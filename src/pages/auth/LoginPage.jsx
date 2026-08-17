import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail, UserCheck, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const DEMO_ROLES = [
  { role: 'Admin', email: 'vineetvineet8006@gmail.com', pass: '123456', badge: '👑', label: 'Super Admin' },
  { role: 'Sales', email: 'sales@hiverift.com', pass: 'password123', badge: '💰', label: 'Sales Executive' },
  { role: 'Manager', email: 'management@hiverift.com', pass: 'password123', badge: '👔', label: 'General Manager' },
  { role: 'Marketing', email: 'marketing@hiverift.com', pass: 'password123', badge: '📢', label: 'Digital Marketer' },
  { role: 'Dev', email: 'dev@hiverift.com', pass: 'password123', badge: '💻', label: 'Fullstack Dev' },
  { role: 'HR', email: 'hr@hiverift.com', pass: 'password123', badge: '👨‍💼', label: 'HR Manager' },
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDemoChips, setShowDemoChips] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const err = {};
    if (!email) err.email = 'Email Address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Please enter a valid email';
    if (!password) err.password = 'Password is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const userData = await login(email, password);
      await Swal.fire({
        icon: 'success',
        title: `Welcome back, ${userData.name}! 👋`,
        text: `Role: ${userData.role?.toUpperCase()}`,
        timer: 1500,
        showConfirmButton: false,
        iconColor: '#016139',
      });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify email and password.';
      Swal.fire({ icon: 'error', title: 'Authentication Failed', text: msg, confirmButtonColor: '#016139' });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (dRole) => {
    setEmail(dRole.email);
    setPassword(dRole.pass);
    setSelectedRole(dRole.role);
    setErrors({});
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#014D3B',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '24px 20px',
      boxSizing: 'border-box',
    }}>
      {/* Crisp Plus-Grid Background Pattern matching screenshot */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.14,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M19 19v-6h2v6h6v2h-6v6h-2v-6h-6v-2h6z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }} />

      {/* Main Container Layout */}
      <div style={{
        width: '100%',
        maxWidth: 1080,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
        gap: 60,
        flexWrap: 'wrap',
      }}>
        {/* Left Side — Branding & Feature List */}
        <div style={{ flex: '1 1 420px', color: '#ffffff', maxWidth: 520 }}>
          {/* Logo Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <div style={{
              width: 44,
              height: 44,
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <Zap size={22} color="#ffffff" fill="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff', lineHeight: 1.2 }}>HiveRift</div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>CRM Platform</div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 42,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 18px 0',
            letterSpacing: '-1px',
            color: '#ffffff',
          }}>
            Manage your business,<br />the smart way.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 40px 0',
            maxWidth: 460,
          }}>
            From lead to renewal — track every step of your business cycle in one powerful platform.
          </p>

          {/* Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { title: 'Complete Lead Lifecycle', desc: 'Track leads from inquiry to deal won' },
              { title: 'Project Management', desc: 'Assign, track, and deliver projects' },
              { title: 'Smart Renewals', desc: 'Never miss a service renewal' },
            ].map((f) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  <ArrowRight size={13} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side — Pixel Perfect Floating Sign In Card */}
        <div style={{
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          boxSizing: 'border-box',
        }}>
          {/* Card Title Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              Welcome back 👋
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0, fontWeight: 400 }}>
              Sign in to your HiveRift account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  style={{
                    width: '100%',
                    height: 48,
                    paddingLeft: 42,
                    paddingRight: 16,
                    fontSize: 14,
                    color: '#0f172a',
                    background: '#ffffff',
                    border: errors.email ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    borderRadius: 10,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#016139'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#cbd5e1'}
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: null })); }}
                />
              </div>
              {errors.email && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, fontWeight: 500 }}>{errors.email}</div>}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  style={{
                    width: '100%',
                    height: 48,
                    paddingLeft: 42,
                    paddingRight: 44,
                    fontSize: 14,
                    color: '#0f172a',
                    background: '#ffffff',
                    border: errors.password ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    borderRadius: 10,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#016139'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#cbd5e1'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: null })); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, fontWeight: 500 }}>{errors.password}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 50,
                background: '#016139',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s, transform 0.1s',
                boxShadow: '0 4px 14px rgba(1, 97, 57, 0.28)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#007A48'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#016139'; }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: 18, height: 18, borderColor: '#ffffff', borderTopColor: 'transparent' }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Security Footer Badge */}
          <div style={{
            marginTop: 22,
            padding: '12px 14px',
            background: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              🔒 Secured with JWT Authentication &nbsp;|&nbsp; Role-based Access Control
            </p>
          </div>

          {/* Quick Demo Login Auto-Filler */}
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={() => setShowDemoChips(!showDemoChips)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                fontSize: 12,
                color: '#016139',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '4px 0',
              }}
            >
              <UserCheck size={14} />
              {showDemoChips ? 'Hide Quick Demo Roles' : '⚡ Quick Demo 1-Click Autofill'}
            </button>

            {showDemoChips && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                marginTop: 10,
                padding: 10,
                background: '#e8f5f0',
                borderRadius: 12,
                border: '1px solid #bce6d2',
              }}>
                {DEMO_ROLES.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => fillDemoUser(r)}
                    style={{
                      background: selectedRole === r.role ? '#016139' : '#ffffff',
                      color: selectedRole === r.role ? '#ffffff' : '#016139',
                      border: '1px solid #bce6d2',
                      borderRadius: 8,
                      padding: '8px 4px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{r.badge}</span> {r.role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
