import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leavesAPI, usersAPI } from '../../api';
import { FileCheck, Plus, Check, X, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import Swal from 'sweetalert2';

const LEAVE_STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

export default function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const isSuperAdmin = user?.role === 'admin';
  const isManagerOrHR = user?.role === 'management' || user?.role === 'hr';
  const isManagementOrHR = isSuperAdmin || isManagerOrHR;

  const [formData, setFormData] = useState({
    type: 'casual',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    reason: '',
    requestedTo: 'all',
  });

  useEffect(() => {
    fetchLeaves();
    fetchApprovers();
  }, [statusTab, user]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      const { data } = await leavesAPI.getAll(params);
      setLeaves(data.data.leaves || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovers = async () => {
    try {
      const res = await usersAPI.getAll({ limit: 100 });
      const usersList = res.data.data.users || [];
      const admin = usersList.find(u => u.role === 'admin');
      if (admin) setAdminUser(admin);

      const filtered = usersList.filter(u => ['admin', 'management', 'hr'].includes(u.role));
      setApprovers(filtered);
    } catch (err) {
      console.error('Error fetching approvers:', err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      // If applicant is Manager or HR, force route exclusively to Super Admin
      if (isManagerOrHR && adminUser) {
        payload.requestedTo = adminUser._id;
      } else if (payload.requestedTo === 'all') {
        payload.requestedTo = '';
      }

      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });

      await leavesAPI.apply(payload);
      await Swal.fire({
        icon: 'success',
        title: 'Leave Application Submitted!',
        text: isManagerOrHR
          ? 'Your request has been routed directly to Super Admin for approval.'
          : 'Your leave request has been submitted for management review.',
        timer: 1800,
        showConfirmButton: false
      });
      setShowModal(false);
      setFormData({
        type: 'casual',
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        reason: '',
        requestedTo: 'all',
      });
      fetchLeaves();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to apply leave' });
    }
  };

  const handleApprove = async (id, empName) => {
    const confirm = await Swal.fire({
      title: 'Approve Leave?',
      text: `Approve time off request for ${empName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Yes, Approve',
    });

    if (confirm.isConfirmed) {
      try {
        await leavesAPI.approve(id);
        Swal.fire({ icon: 'success', title: 'Leave Approved!', timer: 1200, showConfirmButton: false });
        fetchLeaves();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Action Prohibited', text: err.response?.data?.message || 'Error approving leave' });
      }
    }
  };

  const handleReject = async (id, empName) => {
    const { value: reason } = await Swal.fire({
      title: `Reject Leave for ${empName}`,
      input: 'text',
      inputPlaceholder: 'Reason for rejection...',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Reject Request',
      inputValidator: (value) => {
        if (!value) return 'Please provide a rejection reason';
      }
    });

    if (reason) {
      try {
        await leavesAPI.reject(id, reason);
        Swal.fire({ icon: 'info', title: 'Leave Application Rejected', timer: 1200, showConfirmButton: false });
        fetchLeaves();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Action Prohibited', text: err.response?.data?.message || 'Error rejecting leave' });
      }
    }
  };

  // Helper to check if current user can approve/reject a row
  const canUserApproveRow = (leaveItem) => {
    const applicantId = leaveItem.employee?._id || leaveItem.employee;
    const applicantRole = leaveItem.employee?.role;

    // 1. Nobody can approve their own leave
    if (applicantId === user?._id) return false;

    // 2. Super Admin can approve everything
    if (isSuperAdmin) return true;

    // 3. Manager/HR leaves can ONLY be approved by Super Admin
    if (['management', 'hr'].includes(applicantRole)) return false;

    // 4. For regular staff, HR & Manager can approve if targeted or general
    if (isManagerOrHR) {
      if (!leaveItem.requestedTo || leaveItem.requestedTo._id === user?._id || leaveItem.requestedTo === user?._id) {
        return true;
      }
    }

    return false;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isManagementOrHR ? 'Leave Approvals Management' : 'My Leave Applications'}
          </h1>
          <p className="page-subtitle">
            {isManagementOrHR
              ? isSuperAdmin
                ? 'Master management oversight: review and approve all staff, HR, and manager leave requests'
                : 'Review, approve, and track employee time-off requests assigned to you'
              : 'Apply for leaves, select approving authority, and track status'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <div className="status-tabs">
          {LEAVE_STATUS_TABS.map(s => (
            <button
              key={s}
              className={`status-tab ${statusTab === s ? 'active' : ''}`}
              onClick={() => setStatusTab(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <FileCheck />
            <h3>No Leave Applications Found</h3>
            <p>
              {isManagementOrHR
                ? 'No employee leave applications matching this status.'
                : 'You have not submitted any leave applications yet. Click "Apply Leave" to submit one.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Apply Leave
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {isManagementOrHR && <th>Employee</th>}
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Approving Authority</th>
                {isManagementOrHR ? <th>Actions</th> : <th>Reviewed By</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => {
                const canApprove = canUserApproveRow(l);
                const isOwnLeave = (l.employee?._id || l.employee) === user?._id;
                const isManagementApplicant = ['management', 'hr'].includes(l.employee?.role);

                return (
                  <tr key={l._id}>
                    {isManagementOrHR && (
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          {l.employee?.name || 'N/A'} {isOwnLeave && <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {l.employee?.designation || l.employee?.department || 'Staff'} • {l.employee?.email}
                        </div>
                      </td>
                    )}
                    <td>
                      <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--primary)', fontWeight: 600 }}>
                        {l.type.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(l.toDate).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{l.days} Day(s)</td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>
                      <div>{l.reason}</div>
                      {l.rejectionReason && (
                        <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>
                          Reason: {l.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${l.status === 'approved' ? 'won' : l.status === 'rejected' ? 'lost' : 'quotation'}`}>
                        {l.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Approving Authority Target */}
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={13} style={{ color: 'var(--primary)' }} />
                        <span>
                          {isManagementApplicant
                            ? 'Super Admin'
                            : l.requestedTo?.name || 'All Management & HR'}
                        </span>
                      </div>
                    </td>

                    {/* Actions for HR/Admin vs Reviewed By for Employee */}
                    {isManagementOrHR ? (
                      <td>
                        {l.status === 'pending' ? (
                          canApprove ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ background: '#10B981', padding: '5px 10px' }}
                                title="Approve Leave"
                                onClick={() => handleApprove(l._id, l.employee?.name || 'Employee')}
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ padding: '5px 10px' }}
                                title="Reject Leave"
                                onClick={() => handleReject(l._id, l.employee?.name || 'Employee')}
                              >
                                <X size={14} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: isOwnLeave ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Lock size={12} />
                              {isOwnLeave
                                ? 'Awaiting Super Admin Approval'
                                : 'Super Admin Approval Only'}
                            </span>
                          )
                        ) : (
                          l.status === 'approved' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              background: '#E9F8F1',
                              color: '#016139',
                              border: '1px solid #A3E6C5',
                              borderRadius: 8,
                              fontWeight: 700,
                              fontSize: 12,
                            }}>
                              <Check size={13} style={{ color: '#016139', strokeWidth: 2.5 }} />
                              <span>Approved by {l.approvedBy?.name || 'Super Admin'}</span>
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              borderRadius: 8,
                              fontWeight: 700,
                              fontSize: 12,
                            }}>
                              <X size={13} style={{ color: '#DC2626', strokeWidth: 2.5 }} />
                              <span>Rejected by {l.approvedBy?.name || 'Super Admin'}</span>
                            </span>
                          )
                        )}
                      </td>
                    ) : (
                      <td>
                        {l.status === 'approved' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            background: '#E9F8F1',
                            color: '#016139',
                            border: '1px solid #A3E6C5',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 12,
                          }}>
                            <Check size={13} style={{ color: '#016139', strokeWidth: 2.5 }} />
                            <span>Approved by {l.approvedBy?.name || 'Super Admin'}</span>
                          </span>
                        ) : l.status === 'rejected' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 12,
                          }}>
                            <X size={13} style={{ color: '#DC2626', strokeWidth: 2.5 }} />
                            <span>Rejected by {l.approvedBy?.name || 'Management'}</span>
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            background: '#FFFBEB',
                            color: '#D97706',
                            border: '1px solid #FDE68A',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 12,
                          }}>
                            Pending with {l.requestedTo?.name || 'Management'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Submit Leave Request</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleApplyLeave}>
              <div className="modal-body">
                {/* Approving Authority Selection */}
                <div className="form-group">
                  <label className="form-label required" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserCheck size={15} style={{ color: 'var(--primary)' }} />
                    Approving Authority (Send Leave Request To)
                  </label>

                  {isManagerOrHR ? (
                    <div style={{
                      padding: '10px 14px',
                      background: '#e8f5f0',
                      border: '1px solid #bce6d2',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#016139',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <ShieldCheck size={16} />
                      <span>Super Admin</span>
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 400, marginLeft: 'auto' }}>
                        (Manager & HR leaves route exclusively to Super Admin)
                      </span>
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={formData.requestedTo}
                      onChange={e => setFormData({ ...formData, requestedTo: e.target.value })}
                    >
                      <option value="all">All Management & HR (Super Admin + HR + General Manager)</option>
                      {approvers.map(a => (
                        <option key={a._id} value={a._id}>
                          {a.name} ({a.designation || a.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  )}
                  <small style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 4, display: 'block' }}>
                    {isManagerOrHR
                      ? 'As a Manager/HR Lead, your leave applications require direct authorization from Super Admin.'
                      : 'Select a specific Manager / Super Admin or send to all authorities.'}
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label required">Leave Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="casual">Casual Leave (CL)</option>
                    <option value="sick">Sick Leave (SL)</option>
                    <option value="annual">Annual / Paid Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">From Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.fromDate}
                      onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">To Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.toDate}
                      onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Reason for Time Off</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Provide specific reason for your leave application..."
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
