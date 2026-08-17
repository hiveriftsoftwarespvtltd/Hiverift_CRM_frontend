import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, attendanceAPI, leavesAPI } from '../../api';
import {
  Users, CreditCard, FolderKanban, RefreshCw, TrendingUp, Clock, Plus,
  ArrowUpRight, ArrowDownRight, CheckCircle2, FileText, AlertTriangle, Calendar,
  Briefcase, CheckSquare, ListTodo, ShieldAlert, UserCheck, ChevronRight, PhoneCall, ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const DEPT_ICONS = {
  development: '💻',
  sales: '💼',
  digital_marketing: '📈',
  management: '👔',
  hr: '👥',
  admin: '👑',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myAttendance, setMyAttendance] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchAttendance();
  }, [user]);

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
    } catch {}
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkIn({ notes: 'Web Dashboard Check-in' });
      Swal.fire({
        icon: 'success',
        title: 'Checked In Successfully! 🟢',
        text: 'Your attendance has been recorded for today.',
        timer: 1800,
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
        title: 'Checked Out! 🏁',
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

  return (
    <div>
      {/* Page Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}! 👋</h1>
          <p className="page-subtitle">
            {isSales && 'Your personalized sales pipeline, daily follow-ups, and conversion metrics.'}
            {isTech && 'Your active project assignments, tasks progress, and upcoming deliverables.'}
            {isHR && 'Company workforce attendance, shift timings, and pending leave requests.'}
            {isAdmin && 'Executive business overview, live sales trends, active projects, and financial health.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick Check-in/Out Button */}
          {!myAttendance ? (
            <button className="btn btn-primary" onClick={handleCheckIn} disabled={checkingIn}>
              <Clock size={16} /> Mark Check-in
            </button>
          ) : !myAttendance.checkOut ? (
            <button className="btn btn-secondary" onClick={handleCheckOut} disabled={checkingIn} style={{ border: '1px solid #10B981', color: '#016139', fontWeight: 700 }}>
              <CheckCircle2 size={16} color="#10B981" /> Check Out ({myAttendance.status.toUpperCase()})
            </button>
          ) : (
            <span className="badge badge-present" style={{ padding: '7px 14px', fontSize: 13, fontWeight: 700 }}>
              ✓ Shift Completed • {myAttendance.workingHours} hrs
            </span>
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
          {/* 6 KPI Cards */}
          <div className="grid-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="kpi-card" onClick={() => navigate('/leads?status=new')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
                <Users size={20} />
              </div>
              <div>
                <div className="kpi-value">{data?.newLeads ?? 0}</div>
                <div className="kpi-label">New Leads Today</div>
                <div className="kpi-growth positive">Fresh Inquiries</div>
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

            <div className="kpi-card" onClick={() => navigate('/leads')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF0F0', color: '#EF4444' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="kpi-value">{data?.overdueFollowups ?? 0}</div>
                <div className="kpi-label">Overdue Calls</div>
                <div className="kpi-growth negative">Requires Action</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/leads?status=won')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="kpi-value">₹{(data?.wonSalesValue || 0).toLocaleString()}</div>
                <div className="kpi-label">Won Sales Deals</div>
                <div className="kpi-growth positive">{data?.wonLeadsCount ?? 0} Converted</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
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
                    <YAxis stroke="#899792" fontSize={12} tickFormatter={v => `₹${v >= 1000 ? `${v/1000}k` : v}`} />
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
                    <div style={{ width: 95, fontSize: 12, fontWeight: 600, color: 'var(--text-heading)' }}>{f.name}</div>
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', height: 24, borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: `${Math.max(10, f.value)}%`, background: f.fill, height: '100%', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', transition: 'width 0.5s' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10231F' }}>{f.count}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10231F' }}>{f.value}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Follow-up Calls Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📞 My Scheduled Follow-ups for Today</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All Leads</button>
            </div>
            {data?.followupsToday?.length ? (
              <div className="table-wrapper">
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
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 25 }}>
                🎉 Great job! No pending follow-ups scheduled for today.
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
              <h3 className="card-title">📁 My Assigned Projects & Completion Progress</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>View All Projects</button>
            </div>
            {data?.myProjects?.length ? (
              <div className="table-wrapper">
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
                            Update Progress 🛠️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            <div className="kpi-card" onClick={() => navigate('/team/attendance')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
                <Users size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.totalEmployees ?? 0}</div>
                <div className="kpi-label">Total Staff Members</div>
                <div className="kpi-growth positive">Active Company Directory</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/team/attendance')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
                <UserCheck size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.onTimeToday ?? 0}</div>
                <div className="kpi-label">On-Time Today</div>
                <div className="kpi-growth positive">Before 10:00 AM</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/team/attendance')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
                <Clock size={22} />
              </div>
              <div>
                <div className="kpi-value">{data?.lateToday ?? 0}</div>
                <div className="kpi-label">Late Checked In</div>
                <div className="kpi-growth negative">After 10:00 AM Shift</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/team/leaves')} style={{ cursor: 'pointer' }}>
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
              <h3 className="card-title">📝 Pending Leave Applications (Require Review)</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/team/leaves')}>All Leaves Register</button>
            </div>
            {data?.pendingLeaves?.length ? (
              <div className="table-wrapper">
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
                          <span style={{ fontSize: 12, fontWeight: 700 }}>
                            {DEPT_ICONS[l.employee?.role] || '👤'} {(l.employee?.department || l.employee?.role || 'Staff').toUpperCase()}
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
                          <button className="btn btn-primary btn-sm" onClick={() => navigate('/team/leaves')} style={{ padding: '3px 8px', fontSize: 11 }}>
                            Review Leave ⚖️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 25 }}>
                🎉 No pending leave applications to review today!
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
          {/* 5 Executive KPI Cards */}
          <div className="grid-5" style={{ marginBottom: 24 }}>
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

            <div className="kpi-card" onClick={() => navigate('/payments')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#059669' }}>
                <TrendingUp />
              </div>
              <div>
                <div className="kpi-value">₹{(data?.finance?.totalReceived || 0).toLocaleString()}</div>
                <div className="kpi-label">Total Collected</div>
                <div className="kpi-growth positive">Live Revenue</div>
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate('/payments')} style={{ cursor: 'pointer' }}>
              <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#D99A00' }}>
                <CreditCard />
              </div>
              <div>
                <div className="kpi-value">₹{(data?.finance?.totalPending || 0).toLocaleString()}</div>
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

            <div className="kpi-card" onClick={() => navigate('/team/attendance')} style={{ cursor: 'pointer' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
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
                    <YAxis stroke="#899792" fontSize={12} tickFormatter={v => `₹${v >= 1000 ? `${v/1000}k` : v}`} />
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
                    <div style={{ width: 95, fontSize: 12, fontWeight: 600, color: 'var(--text-heading)' }}>{f.name}</div>
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', height: 24, borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: `${Math.max(12, f.value)}%`, background: f.fill, height: '100%', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', transition: 'width 0.5s' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10231F' }}>{f.count}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10231F' }}>{f.value}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No pending follow-ups for today 🎉</p>
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
    </div>
  );
}
