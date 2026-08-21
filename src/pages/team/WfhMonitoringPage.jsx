import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { monitoringAPI } from '../../api';
import {
  Laptop, Activity, Clock, ShieldCheck, Download, Filter, Search,
  RefreshCw, Users, AlertCircle, CheckCircle2, XCircle, Coffee,
  BarChart3, Monitor, Layers, ArrowLeft, Eye, Zap, Moon, ChevronRight,
  TrendingUp, HardDrive, Calendar, PieChart, Sparkles, X, ShieldAlert,
  Code, Megaphone, Briefcase, UserSquare2, Play, Radio, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import PaginationControls from '../../components/common/PaginationControls';

const CATEGORY_COLORS = {
  development: { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' },
  communication: { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' },
  productivity: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  browsing: { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
  utilities: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
  other: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' }
};

export default function WfhMonitoringPage() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'management', 'super_admin'].includes(user?.role);
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'apps' | 'devices' | 'reports'
  
  // Dashboard & Live State
  const [dashboardStats, setDashboardStats] = useState(null);
  const [liveEmployees, setLiveEmployees] = useState([]);
  const [appsSummary, setAppsSummary] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [reportsList, setReportsList] = useState([]);

  // Pagination States (7 per page)
  const [livePage, setLivePage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [devicePage, setDevicePage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // App Analytics View Mode & Employee Filter
  const [appViewMode, setAppViewMode] = useState('employee'); // 'employee' | 'leaderboard'
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('all');

  // Selected Employee Modal Drilldown
  const [selectedEmpDetail, setSelectedEmpDetail] = useState(null);
  const [empModalLoading, setEmpModalLoading] = useState(false);

  useEffect(() => {
    setLivePage(1);
    setAppsPage(1);
    setLeaderboardPage(1);
    setDevicePage(1);
    setReportPage(1);
  }, [search, deptFilter, activeTab, selectedDate, appViewMode, selectedEmpFilter]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchLiveOnly, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, [activeTab, selectedDate, deptFilter, appViewMode, selectedEmpFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'live') {
        const [dashRes, liveRes] = await Promise.all([
          monitoringAPI.getDashboardStats(),
          monitoringAPI.getLiveMonitoring()
        ]);
        setDashboardStats(dashRes.data?.data);
        setLiveEmployees(liveRes.data?.data || []);
      } else if (activeTab === 'apps') {
        const res = await monitoringAPI.getApplicationSummary({
          date: selectedDate,
          department: deptFilter,
          employeeId: selectedEmpFilter,
          groupBy: appViewMode === 'employee' ? 'employee' : 'app'
        });
        setAppsSummary(res.data?.data || []);
      } else if (activeTab === 'devices') {
        const res = await monitoringAPI.getDevices();
        setDevicesList(res.data?.data || []);
      } else if (activeTab === 'reports') {
        const res = await monitoringAPI.getReports({ startDate: selectedDate, endDate: selectedDate });
        setReportsList(res.data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching WFH data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveOnly = async () => {
    if (activeTab !== 'live') return;
    try {
      const [dashRes, liveRes] = await Promise.all([
        monitoringAPI.getDashboardStats(),
        monitoringAPI.getLiveMonitoring()
      ]);
      setDashboardStats(dashRes.data?.data);
      setLiveEmployees(liveRes.data?.data || []);
    } catch {}
  };

  const handleOpenEmployeeDetail = async (employeeId, customDate) => {
    setEmpModalLoading(true);
    const dateToQuery = customDate || selectedDate;
    try {
      const res = await monitoringAPI.getEmployeeDetails(employeeId, dateToQuery);
      setSelectedEmpDetail(res.data?.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not load employee activity details' });
    } finally {
      setEmpModalLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId) => {
    const confirm = await Swal.fire({
      title: 'Revoke Monitoring Device?',
      text: `Are you sure you want to disconnect and revoke device ${deviceId}? The employee will need to re-pair the agent.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Revoke Device'
    });

    if (confirm.isConfirmed) {
      try {
        await monitoringAPI.revokeDevice(deviceId);
        Swal.fire({ icon: 'success', title: 'Device Revoked', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Revoke Failed', text: err.response?.data?.message || 'Error' });
      }
    }
  };

  const handleDeleteDevicePermanently = async (deviceId) => {
    const confirm = await Swal.fire({
      title: 'Delete Device Record Permanently?',
      text: `This will completely remove device ${deviceId} and its heartbeat records from the system.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete Permanently'
    });

    if (confirm.isConfirmed) {
      try {
        await monitoringAPI.deleteDevicePermanently(deviceId);
        Swal.fire({ icon: 'success', title: 'Device Deleted', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.message || 'Error' });
      }
    }
  };

  const handleDeleteReport = async (reportId) => {
    const confirm = await Swal.fire({
      title: 'Delete WFH Report Record?',
      text: 'Are you sure you want to delete this daily activity report?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete Report'
    });

    if (confirm.isConfirmed) {
      try {
        await monitoringAPI.deleteReport(reportId);
        Swal.fire({ icon: 'success', title: 'Report Deleted', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.message || 'Error' });
      }
    }
  };

  const handleExportCSV = () => {
    if (reportsList.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Data', text: 'No report records to export for this date.' });
      return;
    }

    const headers = ['Employee Name', 'Department', 'Date', 'Active Work (Mins)', 'Idle (Mins)', 'Break (Mins)', 'Productivity Score', 'Top Application'];
    const rows = reportsList.map(r => [
      `"${r.employee?.name || 'N/A'}"`,
      `"${r.employee?.department || r.employee?.role || 'N/A'}"`,
      `"${r.date}"`,
      r.totalActiveMinutes || 0,
      r.totalIdleMinutes || 0,
      r.totalBreakMinutes || 0,
      `"${r.productivityScore || 0}%"`,
      `"${r.topApplications?.[0]?.appName || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HiveRift_WFH_Activity_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = liveEmployees.filter(emp => {
    if (deptFilter !== 'all' && (emp.department || emp.role || '').toLowerCase() !== deptFilter.toLowerCase()) {
      return false;
    }
    if (search) {
      const s = search.toLowerCase();
      return (emp.name || '').toLowerCase().includes(s) ||
             (emp.email || '').toLowerCase().includes(s) ||
             (emp.deviceId || '').toLowerCase().includes(s);
    }
    return true;
  });

  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Laptop size={20} />
            </div>
            <span>WFH Management & Monitoring</span>
          </h1>
          <p className="page-subtitle">
            Real-time Work From Home employee tracking, active/idle time analytics, application usage & attendance
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={fetchData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        background: '#ffffff',
        padding: '6px',
        borderRadius: 12,
        border: '1px solid var(--border)',
        marginBottom: 24,
        overflowX: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {[
          { id: 'live', label: 'Live WFH Monitoring', icon: <Radio size={16} /> },
          { id: 'apps', label: 'Application Analytics', icon: <Layers size={16} /> },
          { id: 'devices', label: 'Connected Devices', icon: <HardDrive size={16} /> },
          { id: 'reports', label: 'WFH Reports & Export', icon: <BarChart3 size={16} /> },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 2px 8px rgba(1,97,57,0.25)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIVE WFH MONITORING & DASHBOARD */}
      {/* ============================================================== */}
      {activeTab === 'live' && (
        <div>
          {/* Summary KPI Cards */}
          <div className="grid-4" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 24
          }}>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#E8F5F0', color: '#016139' }}>
                <Users size={20} />
              </div>
              <div>
                <div className="kpi-value">{dashboardStats?.totalWfhEmployees || 0}</div>
                <div className="kpi-label">WFH Staff</div>
                <div className="kpi-growth" style={{ color: '#016139' }}>Registered Devices</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
                <Activity size={20} />
              </div>
              <div>
                <div className="kpi-value" style={{ color: '#10B981' }}>{dashboardStats?.onlineCount || 0}</div>
                <div className="kpi-label">Online Now</div>
                <div className="kpi-growth positive">Live Heartbeats</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
                <Zap size={20} />
              </div>
              <div>
                <div className="kpi-value" style={{ color: '#2563EB' }}>{dashboardStats?.activeCount || 0}</div>
                <div className="kpi-label">Currently Active</div>
                <div className="kpi-growth" style={{ color: '#2563EB' }}>Working on PC</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
                <Moon size={20} />
              </div>
              <div>
                <div className="kpi-value" style={{ color: '#D97706' }}>{dashboardStats?.idleCount || 0}</div>
                <div className="kpi-label">Currently Idle</div>
                <div className="kpi-growth" style={{ color: '#D97706' }}>No Input &gt;5m</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#FFF0F0', color: '#EF4444' }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="kpi-value" style={{ color: '#EF4444' }}>{dashboardStats?.offlineCount || 0}</div>
                <div className="kpi-label">Offline Devices</div>
                <div className="kpi-growth negative">No Recent Ping</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#EDE9FF', color: '#8B5CF6' }}>
                <Clock size={20} />
              </div>
              <div>
                <div className="kpi-value">{dashboardStats?.avgActiveHours || '0.0'} hrs</div>
                <div className="kpi-label">Avg Work Time</div>
                <div className="kpi-growth" style={{ color: '#8B5CF6' }}>Today's Average</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{
            background: '#ffffff',
            padding: '14px 18px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 260 }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search WFH employee, email, device..."
                  className="form-input"
                  style={{ paddingLeft: 36, fontSize: 13 }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 'auto', fontSize: 13, fontWeight: 600 }}
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="development">Development</option>
                <option value="sales">Sales</option>
                <option value="digital_marketing">Digital Marketing</option>
                <option value="hr">HR</option>
                <option value="management">Management</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: '#016139',
              background: 'var(--primary-very-light)',
              padding: '6px 12px',
              borderRadius: 20,
              border: '1px solid var(--primary-light)'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
              Live Ping Stream (15s)
            </div>
          </div>

          {/* Live Employees Table */}
          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Employee</th>
                    <th style={{ width: '10%' }}>Department</th>
                    <th style={{ width: '11%' }}>Check-in</th>
                    <th style={{ width: '11%' }}>Live Status</th>
                    <th style={{ width: '15%' }}>Current Running App</th>
                    <th style={{ width: '10%' }}>Active Time</th>
                    <th style={{ width: '9%' }}>Idle Time</th>
                    <th style={{ width: '10%' }}>Productivity</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <Laptop size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>No WFH Employees Found</div>
                        <div style={{ fontSize: 13 }}>Employees will appear here once they pair their HiveRift Monitoring Agent.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees
                      .slice((livePage - 1) * 7, livePage * 7)
                      .map((emp) => (
                      <tr key={emp.deviceId}>
                        <td>
                          <div
                            onClick={() => handleOpenEmployeeDetail(emp.employeeId)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                            title="Click to view full day activity tracking"
                          >
                            <div style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              fontWeight: 800,
                              fontSize: 13,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #CBD8D3'
                            }}>
                              {emp.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--primary)', textDecoration: 'underline' }}>
                                {emp.name}
                              </div>
                              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{
                            padding: '3px 8px',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            color: '#475569'
                          }}>
                            {emp.department || emp.role}
                          </span>
                        </td>

                        <td>
                          {emp.checkIn ? (
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--primary)' }}>
                                {new Date(emp.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {emp.checkOut ? 'Checked Out' : 'Active Shift'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Not Checked In
                            </span>
                          )}
                        </td>

                        <td>
                          {emp.activeBreak ? (
                            <span className="badge badge-requirement" style={{ gap: 5 }}>
                              <Coffee size={11} />
                              On Break
                            </span>
                          ) : emp.onlineStatus === 'active' ? (
                            <span className="badge badge-won" style={{ gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                              Active
                            </span>
                          ) : emp.onlineStatus === 'idle' ? (
                            <span className="badge badge-requirement" style={{ gap: 5 }}>
                              <Moon size={11} />
                              Idle
                            </span>
                          ) : (
                            <span className="badge badge-todo" style={{ gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8', display: 'inline-block' }} />
                              Offline
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              background: 'var(--primary-very-light)',
                              color: 'var(--primary)',
                              border: '1px solid var(--primary-light)',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'inline-block',
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={emp.windowTitle ? `${emp.currentApp}: ${emp.windowTitle}` : emp.currentApp}
                          >
                            {emp.currentApp || 'Desktop'}
                          </span>
                        </td>

                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {formatMinutes(emp.activeMinutes)}
                        </td>

                        <td style={{ fontWeight: 600, color: emp.idleMinutes > 30 ? '#DC2626' : 'var(--text-secondary)' }}>
                          {formatMinutes(emp.idleMinutes)}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 44, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{
                                width: `${emp.productivityScore || 0}%`,
                                height: '100%',
                                background: (emp.productivityScore || 0) >= 75 ? '#10B981' : (emp.productivityScore || 0) >= 50 ? '#F59E0B' : '#EF4444'
                              }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-heading)' }}>
                              {emp.productivityScore || 0}%
                            </span>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenEmployeeDetail(emp.employeeId)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700 }}
                          >
                            <Eye size={13} /> View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={livePage}
              totalPages={Math.ceil(filteredEmployees.length / 7) || 1}
              totalItems={filteredEmployees.length}
              itemsPerPage={7}
              onPageChange={setLivePage}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: APPLICATION ANALYTICS */}
      {/* ============================================================== */}
      {activeTab === 'apps' && (
        <div>
          <div style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                  {appViewMode === 'employee' ? 'Employee-wise Application Tracking' : 'Company-wide Application Leaderboard'}
                </h2>
                <div style={{
                  display: 'inline-flex',
                  background: '#F1F5F9',
                  padding: 3,
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <button
                    type="button"
                    onClick={() => setAppViewMode('employee')}
                    style={{
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: appViewMode === 'employee' ? '#ffffff' : 'transparent',
                      color: appViewMode === 'employee' ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: appViewMode === 'employee' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    👤 By Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppViewMode('leaderboard')}
                    style={{
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: appViewMode === 'leaderboard' ? '#ffffff' : 'transparent',
                      color: appViewMode === 'leaderboard' ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: appViewMode === 'leaderboard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    🏢 Company Leaderboard
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {appViewMode === 'employee'
                  ? `Detailed software usage per employee for ${selectedDate} (Chrome, VS Code, Teams, Excel, etc.)`
                  : `Ranked by total hours logged across all WFH staff for ${selectedDate}`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {appViewMode === 'employee' && (
                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: 13, fontWeight: 600, padding: '6px 12px' }}
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  <option value="development">Development</option>
                  <option value="sales">Sales</option>
                  <option value="digital_marketing">Digital Marketing</option>
                  <option value="hr">HR</option>
                  <option value="management">Management</option>
                </select>
              )}

              <input
                type="date"
                className="form-input"
                style={{ padding: '6px 12px', fontSize: 13, width: 'auto', fontWeight: 600 }}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* VIEW 1: BY EMPLOYEE TABLE */}
          {appViewMode === 'employee' && (
            <div className="table-wrapper">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>Employee</th>
                      <th style={{ width: '12%' }}>Department</th>
                      <th style={{ width: '20%' }}>Application Name</th>
                      <th style={{ width: '14%' }}>Process Name</th>
                      <th style={{ width: '12%' }}>Category</th>
                      <th style={{ width: '10%' }}>Sessions</th>
                      <th style={{ width: '14%', textAlign: 'right' }}>Time Spent</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appsSummary.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                          <Layers size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>No Application Data Recorded for {selectedDate}</div>
                          <div style={{ fontSize: 13 }}>Applications stream automatically when employees work on their connected PC.</div>
                        </td>
                      </tr>
                    ) : (
                      appsSummary
                        .slice((appsPage - 1) * 7, appsPage * 7)
                        .map((item, idx) => {
                        const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
                        return (
                          <tr key={`${item.employee?._id || idx}-${item.appName}`}>
                            <td>
                              <div
                                onClick={() => handleOpenEmployeeDetail(item.employee?._id, selectedDate)}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                                title="Click to view complete daily tracking"
                              >
                                <div style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  fontWeight: 800,
                                  fontSize: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #CBD8D3'
                                }}>
                                  {item.employee?.name?.charAt(0)?.toUpperCase() || 'E'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', textDecoration: 'underline' }}>
                                    {item.employee?.name || 'Unknown Staff'}
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    {item.employee?.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span style={{
                                padding: '3px 8px',
                                background: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 700,
                                textTransform: 'capitalize',
                                color: '#475569'
                              }}>
                                {item.employee?.department || item.employee?.role || 'N/A'}
                              </span>
                            </td>

                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                              {item.appName}
                            </td>

                            <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                              {item.processName}
                            </td>

                            <td>
                              <span style={{
                                padding: '3px 8px',
                                background: catStyle.bg,
                                color: catStyle.text,
                                border: `1px solid ${catStyle.border}`,
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 700,
                                textTransform: 'capitalize'
                              }}>
                                {item.category}
                              </span>
                            </td>

                            <td>
                              <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                                {item.sessionCount} Sessions
                              </span>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13.5 }}>
                                {item.totalHours} hrs
                              </div>
                              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                ({formatMinutes(item.totalMinutes)})
                              </div>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleOpenEmployeeDetail(item.employee?._id, selectedDate)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                                title="Preview complete daily timeline"
                              >
                                <Eye size={12} /> Timeline
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={appsPage}
                totalPages={Math.ceil(appsSummary.length / 7) || 1}
                totalItems={appsSummary.length}
                itemsPerPage={7}
                onPageChange={setAppsPage}
              />
            </div>
          )}

          {/* VIEW 2: COMPANY LEADERBOARD TABLE */}
          {appViewMode === 'leaderboard' && (
            <div className="table-wrapper">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>Rank</th>
                      <th style={{ width: '24%' }}>Application Name</th>
                      <th style={{ width: '18%' }}>Process Name</th>
                      <th style={{ width: '16%' }}>Category</th>
                      <th style={{ width: '14%' }}>Active Users</th>
                      <th style={{ width: '14%' }}>Total Sessions</th>
                      <th style={{ width: '16%', textAlign: 'right' }}>Total Monitored Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appsSummary.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                          <Layers size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>No Application Data Recorded Yet</div>
                          <div style={{ fontSize: 13 }}>Application sessions stream automatically from connected desktop agents.</div>
                        </td>
                      </tr>
                    ) : (
                      appsSummary
                        .slice((leaderboardPage - 1) * 7, leaderboardPage * 7)
                        .map((app, idx) => {
                        const catStyle = CATEGORY_COLORS[app.category] || CATEGORY_COLORS.other;
                        return (
                          <tr key={app.appName}>
                            <td style={{ fontWeight: 800, color: idx < 3 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                              #{(leaderboardPage - 1) * 7 + idx + 1}
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                              {app.appName}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                              {app.processName}
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 8px',
                                background: catStyle.bg,
                                color: catStyle.text,
                                border: `1px solid ${catStyle.border}`,
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 700,
                                textTransform: 'capitalize'
                              }}>
                                {app.category}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700 }}>
                              {app.usersCount} Staff
                            </td>
                            <td>
                              {app.sessionCount} Sessions
                            </td>
                            <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14, textAlign: 'right' }}>
                              {app.totalHours} hrs <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>({formatMinutes(app.totalMinutes)})</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={leaderboardPage}
                totalPages={Math.ceil(appsSummary.length / 7) || 1}
                totalItems={appsSummary.length}
                itemsPerPage={7}
                onPageChange={setLeaderboardPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: REGISTERED DEVICES */}
      {/* ============================================================== */}
      {activeTab === 'devices' && (
        <div>
          <div style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            marginBottom: 20
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
              Registered Hardware Devices
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Manage paired desktop agents, operating systems, and agent authorization
            </p>
          </div>

          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '16%' }}>Device ID</th>
                    <th style={{ width: '16%' }}>Computer Name</th>
                    <th style={{ width: '16%' }}>Operating System</th>
                    <th style={{ width: '18%' }}>Paired Employee</th>
                    <th style={{ width: '10%' }}>Agent Build</th>
                    <th style={{ width: '12%' }}>Device Status</th>
                    <th style={{ width: '14%' }}>Last Ping</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devicesList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <HardDrive size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>No Devices Paired Yet</div>
                        <div style={{ fontSize: 13 }}>Devices register when employees install the monitoring agent.</div>
                      </td>
                    </tr>
                  ) : (
                    devicesList
                      .slice((devicePage - 1) * 7, devicePage * 7)
                      .map((dev) => (
                      <tr key={dev._id || dev.deviceId}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                          {dev.deviceId}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                          {dev.deviceName || 'Windows PC'}
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--text-body)' }}>
                          {dev.os || 'Windows'}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-heading)' }}>{dev.employee?.name || 'N/A'}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{dev.employee?.department || dev.employee?.role}</div>
                        </td>
                        <td>
                          <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                            v{dev.agentVersion || '1.0.0'}
                          </span>
                        </td>
                        <td>
                          {dev.status === 'connected' ? (
                            <span className="badge badge-won">Active</span>
                          ) : dev.status === 'revoked' ? (
                            <span className="badge badge-lost">Revoked</span>
                          ) : (
                            <span className="badge badge-todo">Disconnected</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {dev.lastHeartbeat ? new Date(dev.lastHeartbeat).toLocaleString() : 'Never'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            {dev.status !== 'revoked' && (
                              <button
                                onClick={() => handleRevokeDevice(dev.deviceId)}
                                className="btn btn-sm btn-secondary"
                                style={{ fontWeight: 700, color: '#D97706', borderColor: '#FDE68A' }}
                                title="Revoke active pairing token & disconnect"
                              >
                                Revoke
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteDevicePermanently(dev.deviceId)}
                                className="btn btn-sm btn-danger"
                                style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                title="Delete device record permanently"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={devicePage}
              totalPages={Math.ceil(devicesList.length / 7) || 1}
              totalItems={devicesList.length}
              itemsPerPage={7}
              onPageChange={setDevicePage}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: WFH REPORTS & EXPORT */}
      {/* ============================================================== */}
      {activeTab === 'reports' && (
        <div>
          <div style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                WFH Daily Timesheets & Productivity Reports
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Detailed breakdown of active hours, idle time, and productivity scores
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="date"
                className="form-input"
                style={{ padding: '6px 12px', fontSize: 13, width: 'auto', fontWeight: 600 }}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />

              <button
                onClick={handleExportCSV}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Employee</th>
                    <th style={{ width: '11%' }}>Department</th>
                    <th style={{ width: '10%' }}>Date</th>
                    <th style={{ width: '12%' }}>Active Work Time</th>
                    <th style={{ width: '10%' }}>Idle Time</th>
                    <th style={{ width: '10%' }}>Break Taken</th>
                    <th style={{ width: '10%' }}>Productivity</th>
                    <th style={{ width: '13%' }}>Primary App</th>
                    <th style={{ width: '16%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsList.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <BarChart3 size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-heading)' }}>No Reports Found for {selectedDate}</div>
                      </td>
                    </tr>
                  ) : (
                    reportsList
                      .slice((reportPage - 1) * 7, reportPage * 7)
                      .map((r) => (
                      <tr key={r._id}>
                        <td>
                          <div
                            onClick={() => handleOpenEmployeeDetail(r.employee?._id || r.employee, r.date)}
                            style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                            title="Click to preview employee activity breakdown"
                          >
                            {r.employee?.name || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span style={{ padding: '3px 8px', background: '#F1F5F9', borderRadius: 6, fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                            {r.employee?.department || r.employee?.role || 'N/A'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-body)' }}>
                          {r.date}
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          {formatMinutes(r.totalActiveMinutes)}
                        </td>
                        <td style={{ fontWeight: 600, color: r.totalIdleMinutes > 30 ? '#DC2626' : 'var(--text-secondary)' }}>
                          {formatMinutes(r.totalIdleMinutes)}
                        </td>
                        <td>
                          {formatMinutes(r.totalBreakMinutes)}
                        </td>
                        <td>
                          <span className={`badge ${(r.productivityScore || 0) >= 75 ? 'badge-won' : (r.productivityScore || 0) >= 50 ? 'badge-requirement' : 'badge-lost'}`}>
                            {r.productivityScore || 0}%
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                          {r.topApplications?.[0]?.appName || 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleOpenEmployeeDetail(r.employee?._id || r.employee, r.date)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                              title="Preview activity breakdown"
                            >
                              <Eye size={13} /> Preview
                            </button>
                            {isAdmin && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteReport(r._id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                                title="Delete report record"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={reportPage}
              totalPages={Math.ceil(reportsList.length / 7) || 1}
              totalItems={reportsList.length}
              itemsPerPage={7}
              onPageChange={setReportPage}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYEE ACTIVITY DRILLDOWN MODAL */}
      {/* ============================================================== */}
      {selectedEmpDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 780,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #016139 0%, #014D3B 100%)',
              padding: '22px 26px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                  Employee Activity Breakdown: {selectedEmpDetail.employee?.name}
                </h2>
                <p style={{ fontSize: 12.5, color: '#A8C9BE', margin: '4px 0 0 0' }}>
                  {selectedEmpDetail.employee?.department || selectedEmpDetail.employee?.role} • {selectedEmpDetail.employee?.email}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Date Switcher inside Modal */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}>
                  <Calendar size={14} color="#ffffff" />
                  <input
                    type="date"
                    value={selectedEmpDetail.date || selectedDate}
                    onChange={e => handleOpenEmployeeDetail(selectedEmpDetail.employee?._id, e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    title="Change Date to View Past Tracking"
                  />
                </div>

                <button
                  onClick={() => setSelectedEmpDetail(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Top Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                <div style={{ background: '#F0FDF4', padding: '14px', borderRadius: 10, border: '1px solid #BBF7D0', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Active Work</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#016139', marginTop: 4 }}>
                    {formatMinutes(selectedEmpDetail.activity?.totalActiveMinutes)}
                  </div>
                </div>

                <div style={{ background: '#FFFBEB', padding: '14px', borderRadius: 10, border: '1px solid #FDE68A', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Idle Time</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#D97706', marginTop: 4 }}>
                    {formatMinutes(selectedEmpDetail.activity?.totalIdleMinutes)}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Break Taken</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#334155', marginTop: 4 }}>
                    {formatMinutes(selectedEmpDetail.attendance?.totalBreakMinutes || selectedEmpDetail.activity?.totalBreakMinutes)}
                  </div>
                </div>

                <div style={{ background: '#EFF6FF', padding: '14px', borderRadius: 10, border: '1px solid #BFDBFE', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>Productivity</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#1E40AF', marginTop: 4 }}>
                    {selectedEmpDetail.activity?.productivityScore || 0}%
                  </div>
                </div>
              </div>

              {/* Attendance Card */}
              {selectedEmpDetail.attendance && (
                <div style={{
                  background: '#F8FAFA',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Daily Shift Attendance</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                      Login: {selectedEmpDetail.attendance.checkIn ? new Date(selectedEmpDetail.attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} • 
                      Logout: {selectedEmpDetail.attendance.checkOut ? new Date(selectedEmpDetail.attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Working'}
                    </div>
                  </div>

                  <div>
                    <span className="badge badge-won" style={{ fontSize: 12.5, padding: '4px 12px' }}>
                      Shift: {selectedEmpDetail.attendance.workingHours ? `${selectedEmpDetail.attendance.workingHours.toFixed(1)} hrs` : 'In Progress'}
                    </span>
                  </div>
                </div>
              )}

              {/* Top Applications Breakdown */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 12 }}>
                  Application Usage Breakdown
                </h3>

                {(selectedEmpDetail.activity?.topApplications || []).length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No application sessions aggregated for this date.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selectedEmpDetail.activity.topApplications.map((app) => (
                      <div key={app.appName} style={{ background: '#F8FAFA', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-heading)' }}>{app.appName}</span>
                          <span style={{ color: 'var(--primary)' }}>{formatMinutes(app.durationMinutes)} ({app.percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: 7, background: '#E6EFEB', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${app.percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chronological Activity Timeline */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 12 }}>
                  Chronological Activity Timeline
                </h3>

                {(selectedEmpDetail.sessions || []).length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No session logs available.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                    {selectedEmpDetail.sessions.map((s, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12.5
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 12 }}>
                            {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{s.appName}</span>
                          {s.windowTitle && (
                            <span style={{ color: 'var(--text-muted)', fontSize: 11.5, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              - {s.windowTitle}
                            </span>
                          )}
                        </div>

                        <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {formatMinutes(s.durationMinutes)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
