import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, attendanceAPI, leavesAPI, monitoringAPI } from '../../api';
import WfhAgentModal from '../../components/wfh/WfhAgentModal';
import {
  Users, CreditCard, FolderKanban, RefreshCw, TrendingUp, Clock, Plus,
  ArrowUpRight, ArrowDownRight, CheckCircle2, FileText, AlertTriangle, Calendar,
  Briefcase, CheckSquare, ListTodo, ShieldAlert, UserCheck, ChevronRight, PhoneCall, ExternalLink,
  Award, XCircle, Coffee, Play, ChevronDown, Timer, Utensils, Droplets, GraduationCap, MessagesSquare, Trophy, Laptop, Home
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const BREAK_OPTIONS = [
  { label: 'Tea Break', Icon: Coffee, color: '#D97706', bg: '#FEF3C7' },
  { label: 'Lunch Break', Icon: Utensils, color: '#EA580C', bg: '#FFEDD5' },
  { label: 'Bio Break', Icon: Droplets, color: '#0284C7', bg: '#E0F2FE' },
  { label: 'Training', Icon: GraduationCap, color: '#6366F1', bg: '#EEF2FF' },
  { label: 'Huddle', Icon: MessagesSquare, color: '#059669', bg: '#ECFDF5' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myAttendance, setMyAttendance] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [breakMenuOpen, setBreakMenuOpen] = useState(false);
  const [checkInMenuOpen, setCheckInMenuOpen] = useState(false);
  const [breakTimerSeconds, setBreakTimerSeconds] = useState(0);
  const [isWfhModalOpen, setIsWfhModalOpen] = useState(false);
  const [wfhAgentConnected, setWfhAgentConnected] = useState(false);
  const breakMenuRef = useRef(null);
  const checkInMenuRef = useRef(null);

  // Close break & checkin dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (breakMenuRef.current && !breakMenuRef.current.contains(e.target)) {
        setBreakMenuOpen(false);
      }
      if (checkInMenuRef.current && !checkInMenuRef.current.contains(e.target)) {
        setCheckInMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live timer for active break
  useEffect(() => {
    let interval = null;
    if (myAttendance?.activeBreak?.startTime) {
      const start = new Date(myAttendance.activeBreak.startTime).getTime();
      const updateSeconds = () => {
        const now = Date.now();
        setBreakTimerSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      };
      updateSeconds();
      interval = setInterval(updateSeconds, 1000);
    } else {
      setBreakTimerSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [myAttendance?.activeBreak]);

  useEffect(() => {
    fetchDashboard();
    fetchAttendance();
    checkWfhStatus();
  }, [user]);

  const checkWfhStatus = async () => {
    try {
      const res = await monitoringAPI.getDeviceStatus();
      setWfhAgentConnected(res.data?.data?.isConnected);
    } catch {}
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      let res;
      if (user?.role === 'sales') {
        res = await dashboardAPI.sales();
      } else if (['development', 'digital_marketing'].includes(user?.role)) {
        res = await dashboardAPI.tech();
      } else if (user?.role === 'hr') {
        res = await dashboardAPI.hr();
      } else {
        res = await dashboardAPI.admin();
      }
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await attendanceAPI.getMy();
      setMyAttendance(res.data.data);
    } catch { }
  };

  const handleCheckIn = async (mode = 'office') => {
    setCheckingIn(true);
    setCheckInMenuOpen(false);
    try {
      const isWfh = mode === 'wfh';
      await attendanceAPI.checkIn({ notes: isWfh ? 'WFH Check-in' : 'Office Check-in' });
      
      if (isWfh) {
        const devRes = await monitoringAPI.getDeviceStatus();
        const connected = devRes.data?.data?.isConnected;
        setWfhAgentConnected(connected);
        if (!connected) {
          setIsWfhModalOpen(true);
        }
      }

      Swal.fire({
        icon: 'success',
        title: isWfh ? 'WFH Shift Started!' : 'Checked In Successfully!',
        text: isWfh
          ? 'Your Work From Home attendance and activity are now recording.'
          : 'Your office attendance has been recorded for today.',
        timer: 2000,
        showConfirmButton: false
      });
      fetchAttendance();
      fetchDashboard();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Check-in Failed', text: err.response?.data?.message || 'Error checking in' });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkOut();
      Swal.fire({
        icon: 'success',
        title: 'Checked Out!',
        text: 'Total working hours calculated.',
        timer: 1800,
        showConfirmButton: false
      });
      fetchAttendance();
      fetchDashboard();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Check-out Failed', text: err.response?.data?.message || 'Error checking out' });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleStartBreak = async (type) => {
    setBreakMenuOpen(false);
    setCheckingIn(true);
    try {
      await attendanceAPI.startBreak(type);
      Swal.fire({
        icon: 'info',
        title: `On ${type}`,
        text: 'Live break timer is now active on your dashboard.',
        timer: 1800,
        showConfirmButton: false,
      });
      fetchAttendance();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Break Error', text: err.response?.data?.message || 'Failed to start break' });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleEndBreak = async () => {
    setCheckingIn(true);
    try {
      const res = await attendanceAPI.endBreak();
      const totalBreak = res.data?.data?.totalBreakMinutes || 0;
      Swal.fire({
        icon: totalBreak > 60 ? 'warning' : 'success',
        title: totalBreak > 60 ? 'Break Limit Exceeded!' : 'Welcome Back!',
        text: `Break ended. Total break taken today: ${totalBreak} mins ${totalBreak > 60 ? '(Allowed limit: 60m)' : '(Within 60m limit)'}`,
        timer: 2200,
        showConfirmButton: false,
      });
      fetchAttendance();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error ending break', text: err.response?.data?.message || 'Failed to end break' });
    } finally {
      setCheckingIn(false);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleResumeShift = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkIn({ notes: 'Resumed Shift from Dashboard' });
      Swal.fire({
        icon: 'success',
        title: 'Shift Resumed!',
        text: 'You are now back on the clock.',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchAttendance();
      fetchDashboard();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Could not resume shift', text: err.response?.data?.message || 'Error resuming shift' });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleResetAttendance = async () => {
    const res = await Swal.fire({
      title: "Reset Today's Attendance?",
      text: 'This will reset your attendance for today so you can mark a fresh check-in.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#016139',
      confirmButtonText: 'Yes, Reset',
    });
    if (res.isConfirmed) {
      try {
        await attendanceAPI.resetToday();
        Swal.fire({ icon: 'success', title: 'Attendance Reset', timer: 1200, showConfirmButton: false });
        fetchAttendance();
        fetchDashboard();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Reset Failed', text: err.response?.data?.message || 'Failed to reset attendance' });
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner" style={{ width: 42, height: 42, borderWidth: 3 }} />
      </div>
    );
  }

  const role = user?.role || 'admin';
  const isSales = role === 'sales';
  const isTech = ['development', 'digital_marketing'].includes(role);
  const isHR = role === 'hr';
  const isAdmin = ['admin', 'management'].includes(role);

  const formatCurrency = (val) => {
    if (!val || val === 0) return '₹0';
    const num = Number(val);
    if (isNaN(num)) return '₹0';
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const activeBreakMinutes = Math.floor(breakTimerSeconds / 60);
  const totalBreakMinutesCalc = (myAttendance?.totalBreakMinutes || 0) + (myAttendance?.activeBreak ? activeBreakMinutes : 0);
  const isBreakLimitExceeded = totalBreakMinutesCalc > 60;

  return (
    <div>
      {/* Page Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}!</h1>
          <p className="page-subtitle">
            {isSales && 'Your personalized sales pipeline, daily follow-ups, and conversion metrics.'}
            {isTech && 'Your active project assignments, tasks progress, and upcoming deliverables.'}
            {isHR && 'Company workforce attendance, shift timings, and pending leave requests.'}
            {isAdmin && 'Executive business overview, live sales trends, active projects, and financial health.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick Check-in/Out & Break Tracking for Employees / Staff */}
          {!isAdmin && (
            !myAttendance ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleCheckIn('office')}
                  disabled={checkingIn}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <Clock size={16} /> Office Check-in
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCheckIn('wfh')}
                  disabled={checkingIn}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: '1.5px solid #016139',
                    color: '#016139',
                    fontWeight: 700,
                    background: '#f0fdf4'
                  }}
                >
                  <Home size={15} color="#016139" /> WFH Check-in
                </button>
              </div>
            ) : !myAttendance.checkOut ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* WFH Active Monitoring Status Badge */}
                {(myAttendance.notes?.includes('WFH') || myAttendance.status === 'wfh') && (
                  <div
                    onClick={() => !wfhAgentConnected && setIsWfhModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: wfhAgentConnected ? '#dcfce7' : '#fffbeb',
                      color: wfhAgentConnected ? '#15803d' : '#b45309',
                      border: `1px solid ${wfhAgentConnected ? '#86efac' : '#fde68a'}`,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: wfhAgentConnected ? 'default' : 'pointer'
                    }}
                    title={wfhAgentConnected ? 'HiveRift Monitoring Agent Connected & Active' : 'Click to pair WFH Agent'}
                  >
                    <Laptop size={14} />
                    <span>{wfhAgentConnected ? 'WFH Agent Active' : 'WFH Agent Required'}</span>
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: wfhAgentConnected ? '#16a34a' : '#f59e0b',
                      display: 'inline-block'
                    }} />
                  </div>
                )}
                {/* Active Break or Break Dropdown */}
                {myAttendance.activeBreak ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 14px',
                        borderRadius: 8,
                        background: isBreakLimitExceeded ? '#FEF2F2' : '#FFFBEB',
                        color: isBreakLimitExceeded ? '#DC2626' : '#B45309',
                        border: `1px solid ${isBreakLimitExceeded ? '#EF4444' : '#FCD34D'}`,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      <Coffee size={16} color={isBreakLimitExceeded ? '#DC2626' : '#D97706'} />
                      <span>{myAttendance.activeBreak.type}:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{formatTimer(breakTimerSeconds)}</span>
                      <span style={{ fontSize: 11, opacity: 0.85, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        ({totalBreakMinutesCalc}m / 60m {isBreakLimitExceeded ? <><AlertTriangle size={11} color="#DC2626" /> EXCEEDED</> : 'allowed'})
                      </span>
                    </div>

                    <button
                      className="btn"
                      onClick={handleEndBreak}
                      disabled={checkingIn}
                      style={{
                        background: isBreakLimitExceeded ? '#DC2626' : '#D97706',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                      }}
                    >
                      <Play size={15} /> Resume Work (End Break)
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Total Break Display Badge */}
                    {myAttendance.totalBreakMinutes > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: isBreakLimitExceeded ? '#FEF2F2' : '#F8FAFC',
                          color: isBreakLimitExceeded ? '#DC2626' : 'var(--text-secondary)',
                          border: `1px solid ${isBreakLimitExceeded ? '#FCA5A5' : 'var(--border)'}`,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <Coffee size={14} color={isBreakLimitExceeded ? '#DC2626' : '#64748B'} />
                        <span>Break:</span>
                        <span style={{ color: isBreakLimitExceeded ? '#DC2626' : 'var(--text-heading)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {myAttendance.totalBreakMinutes}m / 60m {isBreakLimitExceeded && <><AlertTriangle size={11} color="#DC2626" /> Limit Exceeded</>}
                        </span>
                      </div>
                    )}

                    {/* Break Dropdown Menu */}
                    <div style={{ position: 'relative' }} ref={breakMenuRef}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setBreakMenuOpen(!breakMenuOpen)}
                        disabled={checkingIn}
                        style={{
                          border: '1px solid #F59E0B',
                          color: '#B45309',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Coffee size={16} color="#F59E0B" /> Take Break <ChevronDown size={14} />
                      </button>

                      {breakMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '110%',
                            right: 0,
                            background: '#FFFFFF',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                            minWidth: 210,
                            zIndex: 100,
                            padding: '6px 0',
                            overflow: 'hidden',
                          }}
                        >
                          <div style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase' }}>
                            Select Break (Max 1 hr/day)
                          </div>
                          {BREAK_OPTIONS.map((opt) => {
                            const IconComponent = opt.Icon;
                            return (
                              <button
                                key={opt.label}
                                onClick={() => handleStartBreak(opt.label)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  width: '100%',
                                  padding: '8px 14px',
                                  background: 'none',
                                  border: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: 'var(--text-heading)',
                                  transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                              >
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    background: opt.bg,
                                    color: opt.color,
                                    flexShrink: 0,
                                  }}
                                >
                                  <IconComponent size={14} />
                                </span>
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Check Out Button */}
                <button
                  className="btn btn-secondary"
                  onClick={handleCheckOut}
                  disabled={checkingIn}
                  style={{ border: '1px solid #10B981', color: '#016139', fontWeight: 700 }}
                >
                  <CheckCircle2 size={16} color="#10B981" /> Check Out ({myAttendance.status === 'present' ? 'ON TIME' : myAttendance.status.toUpperCase()})
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="badge" style={{ padding: '7px 14px', fontSize: 12.5, fontWeight: 700, background: '#E8F5F0', color: '#016139', border: '1px solid #A7F3D0' }}>
                  Shift Completed • {myAttendance.workingHours} hrs {myAttendance.totalBreakMinutes > 0 && `• Breaks: ${myAttendance.totalBreakMinutes}m`} (Next Check-in: Tomorrow 10:00 AM)
                </span>
              </div>
            )
          )}

          {isSales || isAdmin ? (
            <button className="btn btn-primary" onClick={() => navigate('/leads')}>
              <Plus size={16} /> Add Lead
            </button>
          ) : null}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SALES ROLE DASHBOARD                                                   */}
      {/* ========================================================================= */}
      {isSales && (
        <>
          {/* 7 Sales KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="kpi-card" onClick={() => navigate('/leads')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
                <Users size={20} />
              </div>
              <div>
                <div className="kpi-value">{data?.totalLeads ?? data?.myLeads ?? 0}</div>
                <div className="kpi-label">My Total Leads</div>
                <div className="kpi-growth positive">+{data?.newLeads ?? 0} today</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/leads?status=won')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#016139' }}>
                <Award size={20} />
              </div>
              <div>
                <div className="kpi-value">{data?.wonLeadsCount ?? 0}</div>
                <div className="kpi-label">Won Leads</div>
                <div className="kpi-growth positive">{data?.conversionRate ?? 0}% Win Rate</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/leads?status=lost')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF0F0', color: '#EF4444' }}>
                <XCircle size={20} />
              </div>
              <div>
                <div className="kpi-value">{data?.lostLeadsCount ?? 0}</div>
                <div className="kpi-label">Rejected Leads</div>
                <div className="kpi-growth negative">Lost Inquiries</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/leads')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#EDE9FF', color: '#8B5CF6' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div className="kpi-value">{data?.followupsCount ?? data?.followupsToday?.length ?? 0}</div>
                <div className="kpi-label">Today's Follow-ups</div>
                <div className="kpi-growth positive">Scheduled Calls</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/quotations')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
                <FileText size={20} />
              </div>
              <div>
                <div className="kpi-value">{data?.pendingQuotations ?? 0}</div>
                <div className="kpi-label">Quotations Sent</div>
                <div className="kpi-growth">Active Proposals</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/renewals')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF0E5', color: '#F97316' }}>
                <RefreshCw size={20} />
              </div>
              <div>
                <div className="kpi-value">{data?.renewalsDue ?? 0}</div>
                <div className="kpi-label">Renewals Due</div>
                <div className="kpi-growth">Client Retention</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="dashboard-charts-grid">
            {/* Sales Collection Trend */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Sales & Collections Trend</h3>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Last 7 Days</span>
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.salesTrend || []}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#016139" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#016139" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9EFEC" />
                    <XAxis dataKey="name" stroke="#899792" fontSize={12} />
                    <YAxis stroke="#899792" fontSize={12} tickFormatter={v => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                    <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, 'Collection']} />
                    <Area type="monotone" dataKey="sales" stroke="#016139" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pipeline Funnel */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Pipeline Conversion</h3>
                <span className="badge badge-new">Real-time</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
                {(data?.pipelineFunnel || []).map((f) => (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 135, fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', height: 16, borderRadius: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, f.value))}%`,
                          background: f.fill,
                          height: '100%',
                          borderRadius: 6,
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, minWidth: 80, textAlign: 'right' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>
                        {f.count}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                        {f.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Follow-up Calls Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Scheduled Follow-ups for Today</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All Leads</button>
            </div>
            {data?.followupsToday?.length ? (
              <div className="table-wrapper">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Lead Name</th>
                        <th>Company</th>
                        <th>Phone</th>
                        <th>Requirement</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.followupsToday.map((f) => (
                        <tr key={f._id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{f.name}</td>
                          <td>{f.company || '-'}</td>
                          <td>
                            <a href={`tel:${f.phone}`} style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <PhoneCall size={13} /> {f.phone}
                            </a>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.requirement || 'General Inquiry'}</td>
                          <td>
                            <span className={`badge badge-${f.status}`}>{f.status.toUpperCase()}</span>
                          </td>
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/leads`)} style={{ padding: '3px 8px', fontSize: 11 }}>
                              Open Lead ↗
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 25 }}>
                Great job! No pending follow-ups scheduled for today.
              </p>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. TECH / DEVELOPER / MARKETER DASHBOARD                                   */}
      {/* ========================================================================= */}
      {isTech && (
        <>
          {/* 4 Tech KPI Cards */}
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="kpi-card" onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
                <FolderKanban size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.activeProjects ?? 0}</div>
                <div className="kpi-label">Active Projects</div>
                <div className="kpi-growth positive">Under Development</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF0F0', color: '#EF4444' }}>
                <Clock size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.deadlinesThisWeek ?? 0}</div>
                <div className="kpi-label">Due This Week</div>
                <div className="kpi-growth negative">Upcoming Deadlines</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
                <ListTodo size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.tasks?.pending ?? 0}</div>
                <div className="kpi-label">Tasks In Progress</div>
                <div className="kpi-growth">Active Work Items</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
                <CheckSquare size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.completedProjects ?? 0}</div>
                <div className="kpi-label">Delivered Projects</div>
                <div className="kpi-growth positive">100% Completed</div>
              </div>
            </div>
          </div>

          {/* Assigned Projects Table */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3 className="card-title">My Assigned Projects & Completion Progress</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>View All Projects</button>
            </div>
            {data?.myProjects?.length ? (
              <div className="table-wrapper">
                <div className="table-responsive">
                  <table className="table">
                  <thead>
                    <tr>
                      <th>Project ID & Name</th>
                      <th>Client Name</th>
                      <th>Deadline</th>
                      <th>Progress (%)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.myProjects.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.projectId} • {p.service || 'Service'}</div>
                        </td>
                        <td>{p.client?.name || p.client?.company || 'N/A'}</td>
                        <td style={{ fontWeight: 600, color: new Date(p.deadline) < new Date() ? '#DC2626' : 'var(--text-heading)' }}>
                          {new Date(p.deadline).toLocaleDateString()}
                        </td>
                        <td style={{ width: 180 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar-wrap" style={{ flex: 1, height: 8 }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${p.progress || 0}%`,
                                  background: p.progress === 100 ? '#10B981' : p.progress >= 50 ? '#0284C7' : '#F59E0B'
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{p.progress || 0}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${p.status}`}>{p.status.toUpperCase()}</span>
                        </td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/projects/${p._id}`)} style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>
                            Update Progress
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 25 }}>
                No active projects assigned to you at the moment.
              </p>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. HR ROLE DASHBOARD                                                      */}
      {/* ========================================================================= */}
      {isHR && (
        <>
          {/* 4 HR KPI Cards */}
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="kpi-card" onClick={() => navigate('/employees')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
                <Users size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.totalEmployees ?? 0}</div>
                <div className="kpi-label">Total Staff Members</div>
                <div className="kpi-growth positive">Active Company Directory</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/attendance')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
                <UserCheck size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.onTimeToday ?? 0}</div>
                <div className="kpi-label">On-Time Today</div>
                <div className="kpi-growth positive">Before 10:00 AM</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/attendance')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
                <Clock size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.lateToday ?? 0}</div>
                <div className="kpi-label">Late Checked In</div>
                <div className="kpi-growth negative">After 10:00 AM Shift</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/leaves')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF0F0', color: '#EF4444' }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.pendingLeaves?.length ?? 0}</div>
                <div className="kpi-label">Pending Leaves</div>
                <div className="kpi-growth negative">Requires Approval</div>
              </div>
            </div>
          </div>

          {/* Pending Leave Requests Card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3 className="card-title">Pending Leave Applications (Require Review)</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leaves')}>All Leaves Register</button>
            </div>
            {data?.pendingLeaves?.length ? (
              <div className="table-wrapper">
                <div className="table-responsive">
                  <table className="table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Duration / Dates</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingLeaves.map((l) => (
                      <tr key={l._id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{l.employee?.name || 'Staff'}</td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                            {(l.employee?.department || l.employee?.role || 'Staff').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-quotation">{l.type?.toUpperCase()}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()} ({l.days} days)
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.reason}</td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => navigate('/leaves')} style={{ padding: '3px 8px', fontSize: 11 }}>
                            Review Leave
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 25 }}>
                No pending leave applications to review today!
              </p>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN & EXECUTIVE MANAGEMENT DASHBOARD                                 */}
      {/* ========================================================================= */}
      {isAdmin && (
        <>
          {/* 7 Executive KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="kpi-card" onClick={() => navigate('/leads')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
                <Users />
              </div>
              <div>
                <div className="kpi-value">{data?.leads?.total ?? 0}</div>
                <div className="kpi-label">Total Leads</div>
                <div className="kpi-growth positive">+{data?.leads?.newToday ?? 0} today</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/leads?status=won')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#016139' }}>
                <Award />
              </div>
              <div>
                <div className="kpi-value">{data?.leads?.wonCount ?? data?.leads?.byStatus?.find(s => s._id === 'won')?.count ?? 0}</div>
                <div className="kpi-label">Won Leads</div>
                <div className="kpi-growth positive">{data?.leads?.conversionRate || 0}% Closed</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/leads?status=lost')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF0F0', color: '#EF4444' }}>
                <XCircle />
              </div>
              <div>
                <div className="kpi-value">{data?.leads?.lostCount ?? data?.leads?.byStatus?.find(s => s._id === 'lost')?.count ?? 0}</div>
                <div className="kpi-label">Rejected Leads</div>
                <div className="kpi-growth negative">Lost Deals</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/payments')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#059669' }}>
                <TrendingUp />
              </div>
              <div>
                <div className="kpi-value" title={`₹${Number(data?.finance?.totalReceived || 0).toLocaleString('en-IN')}`}>
                  {formatCurrency(data?.finance?.totalReceived)}
                </div>
                <div className="kpi-label">Total Collected</div>
                <div className="kpi-growth positive">Live Revenue</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/payments')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#D99A00' }}>
                <CreditCard />
              </div>
              <div>
                <div className="kpi-value" title={`₹${Number(data?.finance?.totalPending || 0).toLocaleString('en-IN')}`}>
                  {formatCurrency(data?.finance?.totalPending)}
                </div>
                <div className="kpi-label">Pending Balances</div>
                <div className="kpi-growth negative">Invoice Due</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#EDF2FF', color: '#4F46E5' }}>
                <FolderKanban />
              </div>
              <div>
                <div className="kpi-value">{data?.projects?.active ?? 0}</div>
                <div className="kpi-label">Active Projects</div>
                <div className="kpi-growth positive">{data?.projects?.completed ?? 0} Completed</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/attendance')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
                <UserCheck />
              </div>
              <div>
                <div className="kpi-value">{data?.team?.presentToday ?? 0} / {data?.team?.total ?? 0}</div>
                <div className="kpi-label">Present Today</div>
                <div className="kpi-growth positive">{data?.team?.onTimeToday ?? 0} On Time</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="dashboard-charts-grid">
            {/* Sales Collection Trend */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Sales & Collection Trend</h3>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Last 7 Days</span>
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.salesTrend || []}>
                    <defs>
                      <linearGradient id="salesGradAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#016139" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#016139" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9EFEC" />
                    <XAxis dataKey="name" stroke="#899792" fontSize={12} />
                    <YAxis stroke="#899792" fontSize={12} tickFormatter={v => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                    <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, 'Collection']} />
                    <Area type="monotone" dataKey="sales" stroke="#016139" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGradAdmin)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pipeline Funnel */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Company Pipeline Funnel</h3>
                <span className="badge badge-new">{data?.leads?.conversionRate || 0}% Win Rate</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
                {(data?.pipelineFunnel || []).map((f) => (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 135, fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', height: 16, borderRadius: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, f.value))}%`,
                          background: f.fill,
                          height: '100%',
                          borderRadius: 6,
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, minWidth: 90, textAlign: 'right' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>
                        {f.count}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                        {f.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Team & Employee Performance Breakdown */}
          {data?.salesPerformance && data.salesPerformance.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>Sales Team & Executive Performance</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>Real-time lead conversion, deals won, and dropped count per sales employee</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View Leads Register</button>
              </div>
              <div className="table-wrapper">
                <div className="table-responsive">
                  <table className="table">
                  <thead>
                    <tr>
                      <th>Sales Executive</th>
                      <th>Total Assigned Leads</th>
                      <th>Won Leads (Deals Closed)</th>
                      <th>Rejected Leads (Lost)</th>
                      <th>Quotations Sent</th>
                      <th>Conversion Rate</th>
                      <th>Total Won Value (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.salesPerformance.map((emp) => (
                      <tr key={emp._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#01613915', color: '#016139', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                              {emp.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{emp.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email} • {emp.role?.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, fontSize: 14 }}>{emp.totalLeads}</td>
                        <td>
                          <span
                            className="badge badge-won"
                            style={{
                              padding: '4px 10px',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <Trophy size={13} style={{ color: '#016139', flexShrink: 0 }} />
                            {emp.wonLeads} Won
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge badge-lost"
                            style={{
                              padding: '4px 10px',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <XCircle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />
                            {emp.lostLeads} Lost
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{emp.quotationsSent}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar-wrap" style={{ width: 60, height: 6 }}>
                              <div className="progress-bar-fill" style={{ width: `${emp.conversionRate}%`, background: emp.conversionRate >= 50 ? '#016139' : emp.conversionRate > 0 ? '#0284C7' : '#DC2626' }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 12 }}>{emp.conversionRate}%</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#016139' }}>₹{(emp.wonValue || 0).toLocaleString()}</td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leads')} style={{ padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                            View Leads ↗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}

          {/* Quick Action Tables & Activity */}
          <div className="grid-2">
            {/* Quick Follow-ups */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Today's Company Follow-ups</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data?.followupsToday?.length ? data.followupsToday.map(f => (
                  <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.company || 'Direct Client'} • Assigned: <strong>{f.assignedTo?.name || 'Unassigned'}</strong></div>
                    </div>
                    <span className={`badge badge-${f.status}`}>{f.status.toUpperCase()}</span>
                  </div>
                )) : (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No pending follow-ups for today</p>
                )}
              </div>
            </div>

            {/* System Activity Feed */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Live System Audit Activity</h3>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Real-time</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data?.recentActivity?.length ? data.recentActivity.map((act) => (
                  <div key={act._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#01613915', color: '#016139', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                      ✓
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>{act.action} in {act.module?.toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>By {act.user?.name || 'System'} • {act.description || 'Action logged'}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )) : (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                    Live system logging active.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* WFH Monitoring Agent Installer Modal */}
      <WfhAgentModal
        isOpen={isWfhModalOpen}
        onClose={() => setIsWfhModalOpen(false)}
        onConnected={() => setWfhAgentConnected(true)}
      />
    </div>
  );
}
