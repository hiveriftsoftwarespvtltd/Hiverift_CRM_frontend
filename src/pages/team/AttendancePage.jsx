import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI, usersAPI } from '../../api';
import {
  CalendarCheck, Clock, CheckCircle2, AlertTriangle, Users, Calendar,
  Download, Filter, ArrowUpDown, ChevronLeft, ChevronRight, UserCheck, ShieldAlert,
  Search, Briefcase, Code, Megaphone, UserSquare2, X, ArrowLeft, BarChart3,
  Mail, Eye, Crown, CheckCircle, Coffee, RotateCcw
} from 'lucide-react';
import Swal from 'sweetalert2';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DEPARTMENTS = [
  { id: 'all', label: 'All Staff', Icon: Users },
  { id: 'development', label: 'Development', Icon: Code },
  { id: 'sales', label: 'Sales', Icon: Briefcase },
  { id: 'digital_marketing', label: 'Marketing', Icon: Megaphone },
  { id: 'management', label: 'Management', Icon: UserCheck },
  { id: 'hr', label: 'HR', Icon: UserSquare2 },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const isManagementOrHR = ['admin', 'management', 'hr'].includes(user?.role);

  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly' | 'employee_detail'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Employee for Full Month Detailed Drilldown
  const [selectedEmployee, setSelectedEmployee] = useState(null); // User object or null
  const [employeeMonthLogs, setEmployeeMonthLogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [attendances, setAttendances] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [todaySummary, setTodaySummary] = useState({ total: 0, present: 0, late: 0, halfDay: 0 });
  const [loading, setLoading] = useState(true);

  // Pagination State (7 items per page)
  const ITEMS_PER_PAGE = 7;
  const [dailyPage, setDailyPage] = useState(1);
  const [empMonthPage, setEmpMonthPage] = useState(1);
  const [monthlyReportPage, setMonthlyReportPage] = useState(1);

  // Reset pagination on filter or view change
  useEffect(() => {
    setDailyPage(1);
    setEmpMonthPage(1);
    setMonthlyReportPage(1);
  }, [selectedDate, selectedMonth, selectedYear, statusFilter, deptFilter, search, selectedEmployee, viewMode]);

  // My personal attendance for quick checkin status
  const [myTodayAttendance, setMyTodayAttendance] = useState(null);

  useEffect(() => {
    fetchUsersList();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeMonthLogs(selectedEmployee._id || selectedEmployee.id);
    } else if (viewMode === 'daily') {
      fetchDailyAttendance();
    } else if (viewMode === 'monthly') {
      fetchMonthlyReport();
    }
  }, [user, viewMode, selectedDate, selectedMonth, selectedYear, statusFilter, selectedEmployee, deptFilter]);

  const fetchUsersList = async () => {
    try {
      const { data } = await usersAPI.getAll({ limit: 100 });
      setAllUsers(data.data.users || []);
    } catch {}
  };

  const fetchDailyAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (statusFilter !== 'all') params.status = statusFilter;

      const promises = [
        attendanceAPI.getAll(params),
        attendanceAPI.getMy(),
      ];
      if (isManagementOrHR) {
        promises.push(attendanceAPI.getTodaySummary());
      }

      const results = await Promise.all(promises);
      setAttendances(results[0].data.data?.attendances || results[0].data.data || []);
      setMyTodayAttendance(results[1]?.data?.data || null);

      if (isManagementOrHR && results[2]) {
        setTodaySummary(results[2].data.data || { total: 0, present: 0, late: 0, halfDay: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      if (isManagementOrHR) {
        const { data } = await attendanceAPI.getMonthlyReport({ year: selectedYear, month: selectedMonth });
        setMonthlyReport(data.data || []);
      } else {
        const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
        const endOfMonth = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
        const { data } = await attendanceAPI.getAll({ startDate: startOfMonth, endDate: endOfMonth });
        setAttendances(data.data.attendances || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeMonthLogs = async (empId) => {
    setLoading(true);
    try {
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      const { data } = await attendanceAPI.getAll({
        employee: empId,
        startDate: startOfMonth,
        endDate: endOfMonth,
        limit: 100,
      });
      setEmployeeMonthLogs(data.data.attendances || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployeeDrilldown = (emp) => {
    setSelectedEmployee(emp);
  };

  const getStatusCount = (statusName) => {
    if (!todaySummary) return 0;
    if (typeof todaySummary === 'object' && !Array.isArray(todaySummary)) {
      if (statusName === 'present') return todaySummary.present || 0;
      if (statusName === 'late') return todaySummary.late || 0;
      if (statusName === 'half_day') return todaySummary.halfDay || 0;
      if (statusName === 'total') return todaySummary.total || 0;
      return todaySummary[statusName] || 0;
    }
    if (Array.isArray(todaySummary)) {
      const found = todaySummary.find(s => s._id === statusName || s.status === statusName);
      return found ? (found.count || found.total || 0) : 0;
    }
    return 0;
  };

  const calcPunctuality = (a) => {
    if (!a?.checkIn) return { isLate: false, label: 'Not Checked In', status: 'ABSENT', badgeClass: 'badge-lost', color: 'var(--text-muted)' };

    const checkInDate = new Date(a.checkIn);
    const hours = checkInDate.getHours();
    const minutes = checkInDate.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const shiftStartMinutes = 10 * 60; // 10:00 AM (600 mins)

    const isLateCalc = totalMinutes > shiftStartMinutes || a.status === 'late';

    if (isLateCalc) {
      const diff = totalMinutes > shiftStartMinutes ? totalMinutes - shiftStartMinutes : 0;
      const diffH = Math.floor(diff / 60);
      const diffM = diff % 60;
      const duration = diff > 0 ? (diffH > 0 ? `${diffH}h ${diffM}m late` : `${diffM}m late`) : (a.lateDuration || 'Late');
      return {
        isLate: true,
        label: a.lateDuration && a.lateDuration !== 'On Time' ? a.lateDuration : duration,
        status: (totalMinutes >= 13 * 60 || a.status === 'half_day') ? 'HALF DAY' : 'PRESENT (LATE)',
        badgeClass: 'badge-quotation',
        color: '#D97706',
      };
    }

    return {
      isLate: false,
      label: 'On Time',
      status: 'PRESENT',
      badgeClass: 'badge-won',
      color: '#016139',
    };
  };

  const formatWorkingHours = (hoursDecimal) => {
    if (!hoursDecimal || Number(hoursDecimal) <= 0) return '0 hrs';
    const totalMinutes = Math.round(Number(hoursDecimal) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m} mins`;
    if (m === 0) return `${h} hrs`;
    return `${h}h ${m}m (${Number(hoursDecimal).toFixed(2)} hrs)`;
  };

  const handleEditOvertime = async (att) => {
    const empName = att.employee?.name || user?.name || 'Staff';
    const { value: extraText } = await Swal.fire({
      title: 'Overtime',
      text: `Enter overtime worked after 07:00 PM cutoff for ${empName}:`,
      input: 'text',
      inputValue: att.overtime || '',
      inputPlaceholder: 'e.g. 30 mins, 50 mins, 2 hours, 7:45 PM',
      showCancelButton: true,
      confirmButtonText: 'Save Overtime',
      confirmButtonColor: '#016139',
      cancelButtonColor: '#64748b',
    });

    if (extraText !== undefined) {
      try {
        await attendanceAPI.updateOvertime(att._id, { overtime: extraText.trim() });
        Swal.fire({
          icon: 'success',
          title: 'Overtime Saved',
          text: extraText.trim() ? `Overtime set to "${extraText.trim()}".` : 'Overtime cleared.',
          timer: 1500,
          showConfirmButton: false,
          iconColor: '#016139',
        });
        fetchData();
        if (selectedEmployee) {
          fetchEmployeeMonthLogs(selectedEmployee._id || selectedEmployee.id);
        }
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to update overtime', 'error');
      }
    }
  };

  const isSuperAdminOnly = user?.role === 'admin';

  const handleResetOrEditAttendance = async (att) => {
    const empName = att.employee?.name || user?.name || 'Employee';
    const dateStr = new Date(att.date).toLocaleDateString();
    const checkInStr = att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';
    const checkOutStr = att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const currentPunctuality = calcPunctuality(att).status;

    const result = await Swal.fire({
      title: `Attendance Override: ${empName}`,
      html: `
        <div style="text-align: left; font-size: 13px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #E2E8F0; margin-bottom: 14px; line-height: 1.6;">
            <div><strong>Date:</strong> ${dateStr}</div>
            <div><strong>Current Logged Check-In:</strong> ${att.checkIn ? checkInStr : 'Not Checked In'} (${currentPunctuality})</div>
            ${att.checkOut ? `<div><strong>Current Check-Out:</strong> ${checkOutStr}</div>` : ''}
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #1E293B;">Correct Check-In Time (Manual Input):</label>
            <input id="swal-checkin" class="swal2-input" value="${checkInStr}" placeholder="e.g. 10:00 AM, 09:55 AM, 11:10 AM" style="margin: 0; width: 100%; box-sizing: border-box; font-size: 13px; padding: 8px 12px; height: 38px;">
            <span style="font-size: 11px; color: #64748B;">Enter 10:00 AM or earlier to mark as On Time.</span>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #1E293B;">Check-Out Time (Optional Manual Input):</label>
            <input id="swal-checkout" class="swal2-input" value="${checkOutStr}" placeholder="e.g. 07:00 PM (Leave blank if shift in progress)" style="margin: 0; width: 100%; box-sizing: border-box; font-size: 13px; padding: 8px 12px; height: 38px;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: 700; margin-bottom: 4px; color: #1E293B;">Punctuality Status Override:</label>
            <select id="swal-status" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; font-size: 13px; padding: 6px 10px; height: 38px;">
              <option value="auto" selected>Auto-Calculate (On Time if <= 10:00 AM)</option>
              <option value="present">PRESENT (On Time)</option>
              <option value="late">PRESENT (LATE)</option>
              <option value="half_day">HALF DAY</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Save & Recalculate',
      denyButtonText: 'Reset & Delete Log',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#016139',
      denyButtonColor: '#DC2626',
      preConfirm: () => {
        return {
          checkInTime: document.getElementById('swal-checkin')?.value || '',
          checkOutTime: document.getElementById('swal-checkout')?.value || '',
          status: document.getElementById('swal-status')?.value || 'auto',
        };
      }
    });

    if (result.isConfirmed && result.value) {
      // Save & Recalculate
      const { checkInTime, checkOutTime, status } = result.value;
      try {
        await attendanceAPI.editTime(att._id, { checkInTime, checkOutTime, status });
        Swal.fire({
          icon: 'success',
          title: 'Attendance Saved & Recalculated!',
          text: `Check-in updated to ${checkInTime}. Working hours and status recalculated.`,
          timer: 1800,
          showConfirmButton: false,
          iconColor: '#016139',
        });
        fetchData();
        if (selectedEmployee) fetchEmployeeMonthLogs(selectedEmployee._id || selectedEmployee.id);
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to save attendance', 'error');
      }
    } else if (result.isDenied) {
      // Reset & Delete Log
      const confirmReset = await Swal.fire({
        title: 'Reset Attendance Log?',
        text: `This will delete the check-in log for ${empName} on ${dateStr}. They will be able to check in freshly.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Reset & Clear Log',
        confirmButtonColor: '#DC2626',
      });

      if (confirmReset.isConfirmed) {
        try {
          await attendanceAPI.resetRecord(att._id);
          Swal.fire({
            icon: 'success',
            title: 'Log Reset Successfully',
            text: `Attendance log for ${empName} has been cleared.`,
            timer: 1600,
            showConfirmButton: false,
          });
          fetchData();
          if (selectedEmployee) fetchEmployeeMonthLogs(selectedEmployee._id || selectedEmployee.id);
        } catch (err) {
          Swal.fire('Error', err.response?.data?.message || 'Failed to reset attendance log', 'error');
        }
      }
    }
  };

  const renderPaginationControls = (currentPage, totalPages, totalItems, onPageChange) => {
    if (totalItems <= 7) return null;

    const startItem = (currentPage - 1) * 7 + 1;
    const endItem = Math.min(currentPage * 7, totalItems);

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'var(--surface-card, #FFFFFF)',
          borderTop: '1px solid var(--border, #E2E8F0)',
          borderRadius: '0 0 12px 12px',
          marginTop: -1,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ fontSize: 13, color: 'var(--text-secondary, #64748B)', fontWeight: 600 }}>
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              type="button"
              className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 700,
                minWidth: 32,
                background: p === currentPage ? '#016139' : '#FFFFFF',
                color: p === currentPage ? '#FFFFFF' : 'var(--text-main, #1E293B)',
                border: p === currentPage ? '1px solid #016139' : '1px solid var(--border, #CBD5E1)',
              }}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  const renderDepartmentBadge = (role, department) => {
    const dept = (department || role || '').toLowerCase();
    const r = (role || '').toLowerCase();

    if (dept.includes('dev') || r === 'development') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          background: '#E0F2FE',
          color: '#0284C7',
          border: '1px solid #BAE6FD',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          <Code size={12} /> Development
        </span>
      );
    }
    if (dept.includes('sales') || r === 'sales') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          background: '#ECFDF5',
          color: '#059669',
          border: '1px solid #A7F3D0',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          <Briefcase size={12} /> Sales
        </span>
      );
    }
    if (dept.includes('market') || r === 'digital_marketing') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          background: '#F3E8FF',
          color: '#7E22CE',
          border: '1px solid #E9D5FF',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          <Megaphone size={12} /> Marketing
        </span>
      );
    }
    if (dept.includes('manage') || r === 'management') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          background: '#FEF3C7',
          color: '#D97706',
          border: '1px solid #FDE68A',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          <UserCheck size={12} /> Management
        </span>
      );
    }
    if (dept.includes('hr') || r === 'hr') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          background: '#FFE4E6',
          color: '#E11D48',
          border: '1px solid #FECDD3',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          <UserSquare2 size={12} /> HR
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        background: '#E9F8F1',
        color: '#016139',
        border: '1px solid #A3E6C5',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase'
      }}>
        <Crown size={12} /> {department || role || 'Admin'}
      </span>
    );
  };

  // Export to CSV for HR / Payroll
  const exportToCSV = () => {
    if (selectedEmployee) {
      const headers = ['Date', 'Day', 'Employee Name', 'Department / Role', 'Check In', 'Late Duration', 'Check Out', 'Working Hours', 'Overtime', 'Status'];
      const rows = employeeMonthLogs.map(a => [
        new Date(a.date).toLocaleDateString(),
        new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }),
        selectedEmployee.name,
        selectedEmployee.department || selectedEmployee.role,
        a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        a.lateDuration || 'On Time',
        a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress',
        a.workingHours ? `${a.workingHours} hrs` : '-',
        a.overtime || '-',
        a.status === 'late' ? 'PRESENT (LATE)' : (a.status?.toUpperCase() || 'PRESENT')
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(i => `"${i}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${selectedEmployee.name.replace(/\s+/g, '_')}_Attendance_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (viewMode === 'daily') {
      const headers = ['Date', 'Employee Name', 'Department / Role', 'Email', 'Check In', 'Late Duration', 'Check Out', 'Working Hours', 'Overtime', 'Status'];
      const rows = attendances.map(a => [
        new Date(a.date).toLocaleDateString(),
        a.employee?.name || user?.name,
        a.employee?.department || a.employee?.role || user?.department || 'Staff',
        a.employee?.email || user?.email,
        a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        a.lateDuration || 'On Time',
        a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress',
        a.workingHours ? `${a.workingHours} hrs` : '-',
        a.overtime || '-',
        a.status === 'late' ? 'PRESENT (LATE)' : (a.status?.toUpperCase() || 'PRESENT')
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(i => `"${i}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `HiveRift_Attendance_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Employee Name', 'Department / Role', 'Email', 'Month', 'Total Days Present', 'Days On Time', 'Days Late', 'Total Working Hours', 'Avg Daily Hours'];
      const rows = monthlyReport.map(m => [
        m.name,
        m.department || m.role || 'Staff',
        m.email,
        `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
        m.totalDays,
        m.presentDays,
        m.lateDays,
        `${m.totalWorkingHours} hrs`,
        `${m.avgWorkingHours} hrs`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(i => `"${i}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `HiveRift_Monthly_Attendance_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredAttendances = attendances.filter(a => {
    const roleOrDept = (a.employee?.department || a.employee?.role || '').toLowerCase();
    if (deptFilter !== 'all') {
      if (!roleOrDept.includes(deptFilter.toLowerCase())) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const nameMatch = a.employee?.name?.toLowerCase().includes(s);
      const emailMatch = a.employee?.email?.toLowerCase().includes(s);
      return nameMatch || emailMatch;
    }
    return true;
  });

  const filteredMonthlyReport = monthlyReport.filter(m => {
    const roleOrDept = (m.department || m.role || '').toLowerCase();
    if (deptFilter !== 'all') {
      if (!roleOrDept.includes(deptFilter.toLowerCase())) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const nameMatch = m.name?.toLowerCase().includes(s);
      const emailMatch = m.email?.toLowerCase().includes(s);
      return nameMatch || emailMatch;
    }
    return true;
  });

  // Calculate Single Employee Full Month Statistics
  const empTotalDays = employeeMonthLogs.length;
  const empOnTimeDays = employeeMonthLogs.filter(l => l.status === 'present').length;
  const empLateDays = employeeMonthLogs.filter(l => l.status === 'late').length;
  const empTotalHours = employeeMonthLogs.reduce((acc, l) => acc + (l.workingHours || 0), 0);
  const empAvgHours = empTotalDays > 0 ? (empTotalHours / empTotalDays).toFixed(1) : 0;
  const empPunctuality = empTotalDays > 0 ? Math.round((empOnTimeDays / empTotalDays) * 100) : 100;

  // Filter user list by selected department
  const filteredUsersForDropdown = allUsers.filter(u => {
    if (deptFilter === 'all') return true;
    const dept = (u.department || u.role || '').toLowerCase();
    return dept.includes(deptFilter.toLowerCase());
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isManagementOrHR
              ? selectedEmployee
                ? `Monthly Timesheet: ${selectedEmployee.name}`
                : 'Master Attendance Register'
              : 'My Attendance & Timings'}
          </h1>
          <p className="page-subtitle">
            {isManagementOrHR
              ? selectedEmployee
                ? `Detailed daily logs and full month calculation for ${selectedEmployee.name} (${MONTH_NAMES[selectedMonth - 1]} ${selectedYear})`
                : 'Company-wide shift attendance (10:00 AM - 7:00 PM), department filters, and monthly timesheets'
              : 'Track your daily check-in, check-out, office punctuality (10:00 AM shift), and working hours'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {selectedEmployee && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedEmployee(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <ArrowLeft size={14} /> Back to All Staff
            </button>
          )}
          {isManagementOrHR && (
            <button className="btn btn-primary btn-sm" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <Download size={14} /> Export CSV Report
            </button>
          )}
        </div>
      </div>

      {/* Top KPI Cards for HR / Super Admin (When not drilled into single employee) */}
      {isManagementOrHR && !selectedEmployee && (
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="kpi-value" style={{ color: '#016139' }}>{getStatusCount('present')}</div>
              <div className="kpi-label">On Time Today</div>
              <div className="kpi-growth positive">Checked in before 10:00 AM</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
              <Clock size={22} />
            </div>
            <div>
              <div className="kpi-value" style={{ color: '#D97706' }}>{getStatusCount('late')}</div>
              <div className="kpi-label">Late Checked In</div>
              <div className="kpi-growth negative">After 10:00 AM Shift Cutoff</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
              <Users size={22} />
            </div>
            <div>
              <div className="kpi-value" style={{ color: '#1E40AF' }}>{attendances.length}</div>
              <div className="kpi-label">Total Logs Recorded</div>
              <div className="kpi-growth positive">Date: {new Date(selectedDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Status Card for Regular Staff */}
      {!isManagementOrHR && (
        <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #014D3B 0%, #016139 100%)', color: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.5 }}>Employee Profile:</span>
                {renderDepartmentBadge(user?.role, user?.department)}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                {myTodayAttendance ? (
                  myTodayAttendance.status === 'present' ? 'Present (On Time)' : 'Late Checked In'
                ) : 'Not Checked In Today'}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                Office Shift: <strong>10:00 AM - 7:00 PM</strong>
                {myTodayAttendance?.checkIn && ` • Check In: ${new Date(myTodayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                {myTodayAttendance?.lateDuration && myTodayAttendance.lateDuration !== 'On Time' && ` (${myTodayAttendance.lateDuration} late)`}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: 10, textAlign: 'right' }}>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Working Hours Today</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {myTodayAttendance?.workingHours
                  ? `${myTodayAttendance.workingHours} hrs`
                  : myTodayAttendance?.checkIn
                  ? 'In Progress'
                  : '0.0 hrs'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT QUICK FILTER TABS (Interactive for HR & Super Admin) */}
      {isManagementOrHR && (
        <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          <div className="status-tabs">
            {DEPARTMENTS.map(d => {
              const DeptIcon = d.Icon;
              return (
                <button
                  key={d.id}
                  className={`status-tab ${deptFilter === d.id ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  onClick={() => {
                    setDeptFilter(d.id);
                    if (selectedEmployee) {
                      // check if selected employee matches new department
                      const empDept = (selectedEmployee.department || selectedEmployee.role || '').toLowerCase();
                      if (d.id !== 'all' && !empDept.includes(d.id.toLowerCase())) {
                        setSelectedEmployee(null);
                      }
                    }
                  }}
                >
                  <DeptIcon size={14} />
                  <span>{d.label.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Employee Drilldown Detailed Summary Card (When an individual employee is selected) */}
      {selectedEmployee && (
        <div className="card" style={{ marginBottom: 24, border: '1px solid #016139', background: '#F9FCFA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                  {selectedEmployee.name}
                </h2>
                {renderDepartmentBadge(selectedEmployee.role, selectedEmployee.department)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} /> {selectedEmployee.email} • Shift: <strong>10:00 AM - 7:00 PM</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Month:</span>
              <select
                className="form-select"
                style={{ padding: '5px 10px', fontSize: 13, width: 'auto', fontWeight: 700 }}
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>{m}</option>
                ))}
              </select>
              <select
                className="form-select"
                style={{ padding: '5px 10px', fontSize: 13, width: 'auto', fontWeight: 700 }}
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
              >
                {[2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Monthly Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Present</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#016139', marginTop: 4 }}>{empTotalDays} Days</div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>On Time</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981', marginTop: 4 }}>{empOnTimeDays} Days</div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Late Days</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: empLateDays > 0 ? '#DC2626' : '#64748b', marginTop: 4 }}>
                {empLateDays} Days
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Hours</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>{empTotalHours.toFixed(1)} hrs</div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Avg Daily</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#D97706', marginTop: 4 }}>{empAvgHours} hrs/day</div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Punctuality</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: empPunctuality >= 80 ? '#10B981' : '#F59E0B', marginTop: 4 }}>
                {empPunctuality}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: View Switcher, Employee Selector, Date/Month Picker, Search */}
      {!selectedEmployee && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          {/* Daily vs Monthly Mode Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn btn-sm ${viewMode === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setViewMode('daily')}
            >
              <Calendar size={14} /> Day-wise Register (Daily)
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setViewMode('monthly')}
            >
              <BarChart3 size={14} /> Month-wise Summary (Monthly)
            </button>
          </div>

          {/* Filter Controls Bar */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Employee Selector for Direct Monthly Drilldown */}
            {isManagementOrHR && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Employee:</span>
                <select
                  className="form-select"
                  style={{ padding: '5px 10px', fontSize: 13, width: 'auto', fontWeight: 600 }}
                  value={selectedEmployee ? (selectedEmployee._id || selectedEmployee.id) : ''}
                  onChange={e => {
                    const found = allUsers.find(u => (u._id || u.id) === e.target.value);
                    if (found) handleSelectEmployeeDrilldown(found);
                  }}
                >
                  <option value="">-- View Specific Staff Month --</option>
                  {filteredUsersForDropdown.map(u => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name} ({u.department || u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewMode === 'daily' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select Date:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '5px 10px', fontSize: 13, width: 'auto' }}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                >
                  Today
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select Month:</span>
                <select
                  className="form-select"
                  style={{ padding: '5px 10px', fontSize: 13, width: 'auto' }}
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>{m}</option>
                  ))}
                </select>
                <select
                  className="form-select"
                  style={{ padding: '5px 10px', fontSize: 13, width: 'auto' }}
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                >
                  {[2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {isManagementOrHR && (
              <div className="search-box" style={{ width: 160 }}>
                <Search size={14} />
                <input
                  className="search-input"
                  placeholder="Search staff..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Table Wrapper */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : selectedEmployee ? (
          /* ================= SINGLE EMPLOYEE DETAILED MONTH TABLE ================= */
          employeeMonthLogs.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck />
              <h3>No Attendance Logs for {selectedEmployee.name} in {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</h3>
              <p>No check-in activity recorded during this selected month.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date & Day</th>
                      <th>Shift Timing</th>
                      <th>Check In Time</th>
                      <th>Punctuality Calculation</th>
                      <th>Breaks Taken</th>
                      <th>Check Out Time</th>
                      <th>Total Working Hours</th>
                      <th>Overtime</th>
                      <th>Status</th>
                      {isSuperAdminOnly && <th>Reset / Fix</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {employeeMonthLogs
                      .slice((empMonthPage - 1) * ITEMS_PER_PAGE, empMonthPage * ITEMS_PER_PAGE)
                      .map(a => {
                      const checkInFormatted = a.checkIn
                        ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-';
                      const checkOutFormatted = a.checkOut
                        ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'In Progress';

                      const dayName = new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' });
                      const punctuality = calcPunctuality(a);

                      return (
                        <tr key={a._id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                              {new Date(a.date).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {dayName}
                            </div>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>10:00 AM - 7:00 PM</td>
                          <td style={{ fontWeight: 700, color: punctuality.color }}>
                            {checkInFormatted}
                          </td>
                          <td>
                            {punctuality.isLate ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                background: '#FFF7ED',
                                color: '#C2410C',
                                border: '1px solid #FFEDD5',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                              }}>
                                <Clock size={11} /> {punctuality.label}
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                background: '#E9F8F1',
                                color: '#016139',
                                border: '1px solid #A3E6C5',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                              }}>
                                On Time
                              </span>
                            )}
                          </td>
                          <td>
                            {a.activeBreak ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D', fontWeight: 700, fontSize: 11 }}>
                                <Coffee size={11} /> {a.activeBreak.type} (Live)
                              </span>
                            ) : a.totalBreakMinutes > 0 ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: a.totalBreakMinutes > 60 ? '#FEF2F2' : '#F8FAFC',
                                color: a.totalBreakMinutes > 60 ? '#DC2626' : 'var(--text-secondary)',
                                border: `1px solid ${a.totalBreakMinutes > 60 ? '#FCA5A5' : 'var(--border)'}`,
                                fontWeight: 700,
                                fontSize: 11
                              }}>
                                <Coffee size={11} /> {a.totalBreakMinutes}m {a.totalBreakMinutes > 60 && <AlertTriangle size={11} color="#DC2626" />}
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>0m</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{checkOutFormatted}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: a.workingHours >= 8 ? '#016139' : 'var(--text-heading)' }}>
                              {a.workingHours ? formatWorkingHours(a.workingHours) : (a.currentLiveHours ? `${formatWorkingHours(a.currentLiveHours)} (Live)` : 'In Progress')}
                            </span>
                          </td>
                          <td>
                            {(() => {
                              const isSuperAdmin = user?.role === 'admin';

                              if (a.overtime) {
                                return (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '3px 8px',
                                      background: '#EFF6FF',
                                      color: '#1D4ED8',
                                      border: '1px solid #BFDBFE',
                                      borderRadius: 6,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                    title="Click to edit overtime"
                                    onClick={() => handleEditOvertime(a)}
                                  >
                                    ⚡ {a.overtime}
                                  </span>
                                );
                              }

                              if (!isSuperAdmin) {
                                return (
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '2px 6px', fontSize: 10, fontWeight: 600, borderStyle: 'dashed' }}
                                    onClick={() => handleEditOvertime(a)}
                                    title="Add overtime worked after 7 PM"
                                  >
                                    + Add Overtime
                                  </button>
                                );
                              }

                              return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>;
                            })()}
                          </td>
                          <td>
                            <span className={`badge ${punctuality.badgeClass}`}>
                              {punctuality.status}
                            </span>
                          </td>
                          {isSuperAdminOnly && (
                            <td>
                              <button
                                className="btn btn-warning btn-sm"
                                style={{ padding: '2px 6px', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF7ED', color: '#C2410C', border: '1px solid #FFEDD5' }}
                                onClick={() => handleResetOrEditAttendance(a)}
                                title="Reset attendance log or fix check-in time"
                              >
                                <RotateCcw size={10} /> Reset / Fix
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {renderPaginationControls(empMonthPage, Math.ceil(employeeMonthLogs.length / ITEMS_PER_PAGE) || 1, employeeMonthLogs.length, setEmpMonthPage)}
            </>
          )
        ) : viewMode === 'daily' ? (
          /* ================= COMPANY DAY-WISE TABLE ================= */
          filteredAttendances.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck />
              <h3>No Attendance Records for {new Date(selectedDate).toLocaleDateString()}</h3>
              <p>No check-in logs found for the selected department filter.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      {isManagementOrHR && <th>Employee Details</th>}
                      <th>Department / Role</th>
                      <th>Shift Timing</th>
                      <th>Check In Time</th>
                      <th>Late Duration</th>
                      <th>Breaks Taken</th>
                      <th>Check Out Time</th>
                      <th>Total Working Hours</th>
                      <th>Overtime</th>
                      <th>Punctuality Status</th>
                      {isManagementOrHR && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendances
                      .slice((dailyPage - 1) * ITEMS_PER_PAGE, dailyPage * ITEMS_PER_PAGE)
                      .map(a => {
                      const checkInFormatted = a.checkIn
                        ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-';
                      const checkOutFormatted = a.checkOut
                        ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'In Progress';

                      const empRole = a.employee?.role || user?.role;
                      const empDept = a.employee?.department || user?.department;
                      const punctuality = calcPunctuality(a);

                      return (
                        <tr key={a._id}>
                          <td style={{ fontWeight: 600 }}>{new Date(a.date).toLocaleDateString()}</td>
                          {isManagementOrHR && (
                            <td>
                              <div
                                style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
                                title="Click to view full month timesheet"
                                onClick={() => a.employee && handleSelectEmployeeDrilldown(a.employee)}
                              >
                                {a.employee?.name || 'N/A'}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                {a.employee?.email}
                              </div>
                            </td>
                          )}
                          <td>
                            {renderDepartmentBadge(empRole, empDept)}
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>10:00 AM - 7:00 PM</td>
                          <td style={{ fontWeight: 700, color: punctuality.color }}>
                            {checkInFormatted}
                          </td>
                          <td>
                            {punctuality.isLate ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                background: '#FFF7ED',
                                color: '#C2410C',
                                border: '1px solid #FFEDD5',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                              }}>
                                <Clock size={11} /> {punctuality.label}
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                background: '#E9F8F1',
                                color: '#016139',
                                border: '1px solid #A3E6C5',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                              }}>
                                On Time
                              </span>
                            )}
                          </td>
                          <td>
                            {a.activeBreak ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D', fontWeight: 700, fontSize: 11 }}>
                                <Coffee size={11} /> {a.activeBreak.type} (Live)
                              </span>
                            ) : a.totalBreakMinutes > 0 ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: a.totalBreakMinutes > 60 ? '#FEF2F2' : '#F8FAFC',
                                color: a.totalBreakMinutes > 60 ? '#DC2626' : 'var(--text-secondary)',
                                border: `1px solid ${a.totalBreakMinutes > 60 ? '#FCA5A5' : 'var(--border)'}`,
                                fontWeight: 700,
                                fontSize: 11
                              }}>
                                <Coffee size={11} /> {a.totalBreakMinutes}m {a.totalBreakMinutes > 60 && <AlertTriangle size={11} color="#DC2626" />}
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>0m</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{checkOutFormatted}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: a.workingHours >= 8 ? '#016139' : 'var(--text-heading)' }}>
                              {a.workingHours ? formatWorkingHours(a.workingHours) : (a.currentLiveHours ? `${formatWorkingHours(a.currentLiveHours)} (Live)` : 'In Progress')}
                            </span>
                          </td>
                          <td>
                            {(() => {
                              const isSuperAdmin = user?.role === 'admin';

                              if (a.overtime) {
                                return (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '3px 8px',
                                      background: '#EFF6FF',
                                      color: '#1D4ED8',
                                      border: '1px solid #BFDBFE',
                                      borderRadius: 6,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                    title="Click to edit overtime"
                                    onClick={() => handleEditOvertime(a)}
                                  >
                                    ⚡ {a.overtime}
                                  </span>
                                );
                              }

                              if (!isSuperAdmin) {
                                return (
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '2px 6px', fontSize: 10, fontWeight: 600, borderStyle: 'dashed' }}
                                    onClick={() => handleEditOvertime(a)}
                                    title="Add overtime worked after 7 PM"
                                  >
                                    + Add Overtime
                                  </button>
                                );
                              }

                              return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>;
                            })()}
                          </td>
                          <td>
                            <span className={`badge ${punctuality.badgeClass}`}>
                              {punctuality.status}
                            </span>
                          </td>
                          {isManagementOrHR && (
                            <td>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {isSuperAdminOnly && (
                                  <button
                                    className="btn btn-warning btn-sm"
                                    style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF7ED', color: '#C2410C', border: '1px solid #FFEDD5' }}
                                    onClick={() => handleResetOrEditAttendance(a)}
                                    title="Reset attendance log or fix check-in time"
                                  >
                                    <RotateCcw size={11} /> Reset / Fix
                                  </button>
                                )}
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  onClick={() => a.employee && handleSelectEmployeeDrilldown(a.employee)}
                                >
                                  <Calendar size={11} /> Month Log
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {renderPaginationControls(dailyPage, Math.ceil(filteredAttendances.length / ITEMS_PER_PAGE) || 1, filteredAttendances.length, setDailyPage)}
            </>
          )
        ) : (
          /* ================= COMPANY MONTH-WISE SUMMARY TABLE ================= */
          isManagementOrHR ? (
            filteredMonthlyReport.length === 0 ? (
              <div className="empty-state">
                <CalendarCheck />
                <h3>No Monthly Attendance Data for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</h3>
                <p>No employee activity recorded during this billing month.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Department / Role</th>
                        <th>Month</th>
                        <th>Total Days Present</th>
                        <th>On-Time Days</th>
                        <th>Late Days</th>
                        <th>Total Hours Logged</th>
                        <th>Avg Daily Hours</th>
                        <th>Punctuality Rate</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMonthlyReport
                        .slice((monthlyReportPage - 1) * ITEMS_PER_PAGE, monthlyReportPage * ITEMS_PER_PAGE)
                        .map((m) => {
                        const punctualityPercent = m.totalDays > 0 ? Math.round((m.presentDays / m.totalDays) * 100) : 100;

                        return (
                          <tr key={m.employeeId}>
                            <td>
                              <div
                                style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
                                title="Click to view full month timesheet"
                                onClick={() => handleSelectEmployeeDrilldown({ _id: m.employeeId, name: m.name, email: m.email, department: m.department, role: m.role })}
                              >
                                {m.name}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.email}</div>
                            </td>
                            <td>
                              {renderDepartmentBadge(m.role, m.department)}
                            </td>
                            <td style={{ fontWeight: 600 }}>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</td>
                            <td style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
                              {m.totalDays} Days
                            </td>
                            <td style={{ color: '#10B981', fontWeight: 700 }}>{m.presentDays} Days</td>
                            <td style={{ color: m.lateDays > 0 ? '#EF4444' : 'var(--text-muted)', fontWeight: 700 }}>
                              {m.lateDays} Days
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{m.totalWorkingHours} hrs</td>
                            <td style={{ fontWeight: 600 }}>{m.avgWorkingHours} hrs/day</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div className="progress-bar-wrap" style={{ width: 60, height: 6 }}>
                                  <div
                                    className="progress-bar-fill"
                                    style={{
                                      width: `${punctualityPercent}%`,
                                      background: punctualityPercent >= 80 ? '#10B981' : '#F59E0B'
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700 }}>{punctualityPercent}%</span>
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                onClick={() => handleSelectEmployeeDrilldown({ _id: m.employeeId, name: m.name, email: m.email, department: m.department, role: m.role })}
                              >
                                <Eye size={11} /> View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {renderPaginationControls(monthlyReportPage, Math.ceil(filteredMonthlyReport.length / ITEMS_PER_PAGE) || 1, filteredMonthlyReport.length, setMonthlyReportPage)}
              </>
            )
          ) : (
            /* Regular staff monthly history */
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Department</th>
                    <th>Shift Timing</th>
                    <th>Check In</th>
                    <th>Late Duration</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{new Date(a.date).toLocaleDateString()}</td>
                      <td>{renderDepartmentBadge(user?.role, user?.department)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>10:00 AM - 7:00 PM</td>
                      <td style={{ fontWeight: 700, color: a.status === 'late' ? '#D97706' : '#016139' }}>
                        {a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td>
                        {a.status === 'late' ? (
                          <span style={{ color: '#C2410C', fontWeight: 700, fontSize: 11 }}>
                            {a.lateDuration || 'Late'}
                          </span>
                        ) : (
                          <span style={{ color: '#016139', fontWeight: 700, fontSize: 11 }}>On Time</span>
                        )}
                      </td>
                      <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}</td>
                      <td style={{ fontWeight: 700 }}>{a.workingHours ? `${a.workingHours} hrs` : 'In Progress'}</td>
                      <td>
                        <span className={`badge badge-${a.status === 'present' ? 'won' : a.status === 'late' ? 'quotation' : 'lost'}`}>
                          {a.status === 'late' ? 'PRESENT (LATE)' : (a.status?.toUpperCase() || 'PRESENT')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
