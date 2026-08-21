import { useState, useEffect } from 'react';
import { usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Edit2, Trash2, X, UserPlus, Users, Crown, Star, ShieldCheck, UserCheck, Key, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import PaginationControls from '../../components/common/PaginationControls';

const ROLES = [
  { value: 'admin', label: 'SUPER ADMIN (Full Access)', color: 'badge-purple' },
  { value: 'management', label: 'MANAGEMENT', color: 'badge-blue' },
  { value: 'sales', label: 'SALES', color: 'badge-indigo' },
  { value: 'digital_marketing', label: 'DIGITAL MARKETING', color: 'badge-blue' },
  { value: 'development', label: 'DEVELOPMENT', color: 'badge-blue' },
  { value: 'hr', label: 'HUMAN RESOURCES (HR)', color: 'badge-purple' },
];

const DEPARTMENTS = ['All', 'Sales', 'Digital Marketing', 'Development', 'Human Resources', 'Management', 'Finance'];

export default function EmployeesPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [empPage, setEmpPage] = useState(1);

  useEffect(() => {
    setEmpPage(1);
  }, [search, departmentFilter]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassInModal, setShowPassInModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'sales',
    department: 'Sales',
    designation: '',
    employeeId: '',
    isDepartmentHead: false,
    reportingTo: '',
    joiningDate: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await usersAPI.getAll({ limit: 100 });
      setUsers(data.data.users || []);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setShowPassInModal(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'sales',
      department: departmentFilter !== 'All' ? departmentFilter : 'Sales',
      designation: '',
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      isDepartmentHead: false,
      reportingTo: '',
      joiningDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setShowPassInModal(false);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      phone: u.phone || '',
      role: u.role || 'sales',
      department: u.department || 'Sales',
      designation: u.designation || '',
      employeeId: u.employeeId || '',
      isDepartmentHead: !!u.isDepartmentHead,
      reportingTo: u.reportingTo?._id || u.reportingTo || '',
      joiningDate: u.joiningDate ? new Date(u.joiningDate).toISOString().split('T')[0] : '',
      isActive: u.isActive !== undefined ? u.isActive : true,
    });
    setError('');
    setShowModal(true);
  };

  const handleResetPassword = async (u) => {
    const { value: newPassword } = await Swal.fire({
      title: `Reset Password`,
      html: `<div style="text-align: left; font-size: 13px; margin-bottom: 8px; color: #475569;">
        Set a new login password for <b>${u.name}</b> (<span style="color: #016139;">${u.email}</span>):
      </div>`,
      input: 'text',
      inputLabel: 'New Login Password (min 6 chars)',
      inputPlaceholder: 'e.g. 123456 or password123',
      showCancelButton: true,
      confirmButtonColor: '#016139',
      confirmButtonText: 'Set New Password',
      inputValidator: (val) => {
        if (!val || val.trim().length < 6) {
          return 'Password must be at least 6 characters long!';
        }
      }
    });

    if (newPassword) {
      try {
        await usersAPI.resetPassword(u._id, newPassword.trim());
        Swal.fire({
          icon: 'success',
          title: 'Password Updated!',
          text: `Login password for ${u.name} has been set to "${newPassword.trim()}". The user can now log in immediately!`,
          confirmButtonColor: '#016139',
        });
        fetchUsers();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Reset Failed',
          text: err.response?.data?.message || 'Could not reset password',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const toggleDepartmentHead = async (u) => {
    const isPromoting = !u.isDepartmentHead;
    const res = await Swal.fire({
      title: isPromoting ? `Designate as ${u.department || u.role} Admin?` : `Remove Admin/Head Status?`,
      text: isPromoting
        ? `Make ${u.name} the Department Head / Sub-Admin for ${u.department || u.role}. Team members will report under them.`
        : `Remove Department Head status from ${u.name}.`,
      icon: isPromoting ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isPromoting ? '#016139' : '#EF4444',
      confirmButtonText: isPromoting ? 'Yes, Make Dept Admin' : 'Remove Status',
    });

    if (res.isConfirmed) {
      try {
        await usersAPI.update(u._id, { isDepartmentHead: isPromoting });
        Swal.fire({
          icon: 'success',
          title: isPromoting ? 'Department Admin Assigned!' : 'Status Updated',
          text: `${u.name} is now ${isPromoting ? `Head of ${u.department || u.role}` : 'a Team Member'}.`,
          timer: 1500,
          showConfirmButton: false
        });
        fetchUsers();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Update Failed', text: err.response?.data?.message || 'Could not update status' });
      }
    }
  };

  const toggleActive = async (u) => {
    try {
      await usersAPI.update(u._id, { isActive: !u.isActive });
      Swal.fire({
        icon: 'success',
        title: u.isActive ? 'Employee Deactivated' : 'Employee Activated',
        timer: 1200,
        showConfirmButton: false,
      });
      fetchUsers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to update employee status' });
    }
  };

  const handleDelete = async (id, name) => {
    const res = await Swal.fire({
      title: 'Delete Employee?',
      text: `Are you sure you want to delete ${name || 'this employee'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Delete',
    });

    if (res.isConfirmed) {
      try {
        await usersAPI.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        fetchUsers();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.message || 'Could not delete employee' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      const payload = { ...formData };
      payload.email = payload.email.trim().toLowerCase();
      if (editingUser) {
        if (!payload.password || payload.password.trim() === '') {
          delete payload.password;
        } else {
          payload.password = payload.password.trim();
        }
        if (!payload.reportingTo) payload.reportingTo = null;
        await usersAPI.update(editingUser._id, payload);
        Swal.fire({
          icon: 'success',
          title: 'Employee Updated!',
          text: `${formData.name} details have been updated successfully`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        if (!payload.reportingTo) delete payload.reportingTo;
        if (payload.password) payload.password = payload.password.trim();
        await usersAPI.create(payload);
        Swal.fire({
          icon: 'success',
          title: 'Employee Added!',
          text: `New employee ${formData.name} created successfully`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to save employee' });
    } finally {
      setSaving(false);
    }
  };

  // Potential Managers (Department Heads & Super Admins)
  const availableManagers = users.filter((u) => {
    if (editingUser && u._id === editingUser._id) return false;
    return u.role === 'admin' || u.role === 'management' || u.isDepartmentHead;
  });

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.designation?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.employeeId?.toLowerCase().includes(q);

    const matchesDept = departmentFilter === 'All' || u.department?.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">Employee Directory & Hierarchy</h1>
            <span className="badge" style={{ background: '#014D3B', color: '#ffffff', fontWeight: 800, fontSize: 11 }}>
              RBAC & SUB-ADMINS
            </span>
          </div>
          <p className="page-subtitle">Manage Super Admins, Department Team Leads / Sub-Admins, and Staff Members</p>
        </div>
        {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      {/* Department Tabs */}
      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <div className="status-tabs">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              className={`status-tab ${departmentFilter === dept ? 'active' : ''}`}
              onClick={() => setDepartmentFilter(dept)}
            >
              {dept === 'All' ? 'ALL DEPARTMENTS' : dept.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Search Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div className="search-box" style={{ maxWidth: 360, width: '100%' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, email, role, manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredUsers.length}</strong> Employees
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>EMPLOYEE & POSITION</th>
                  <th>ROLE & HIERARCHY</th>
                  <th>DEPARTMENT</th>
                  <th>REPORTS TO</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div className="loading-spinner" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No employees found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers
                    .slice((empPage - 1) * 7, empPage * 7)
                    .map((u) => {
                    const isSuperAdmin = u.role === 'admin';
                    const isDeptAdmin = u.isDepartmentHead;

                    return (
                      <tr key={u._id} style={{ background: isSuperAdmin ? '#F0FDF4' : isDeptAdmin ? '#FEFCE8' : 'transparent' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background: isSuperAdmin ? '#014D3B' : isDeptAdmin ? '#F59E0B' : 'var(--primary-light)',
                                color: isSuperAdmin || isDeptAdmin ? '#ffffff' : 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: 14,
                                flexShrink: 0
                              }}
                            >
                              {isSuperAdmin ? <Crown size={18} /> : isDeptAdmin ? <Star size={18} /> : u.name?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 14.5 }}>
                                  {u.name}
                                </span>
                                {isSuperAdmin && (
                                  <span style={{ fontSize: 10, background: '#014D3B', color: '#ffffff', padding: '1px 6px', borderRadius: 4, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    SUPER ADMIN <Crown size={10} />
                                  </span>
                                )}
                                {!isSuperAdmin && isDeptAdmin && (
                                  <span style={{ fontSize: 10, background: '#F59E0B', color: '#ffffff', padding: '1px 6px', borderRadius: 4, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    {u.department?.toUpperCase() || 'DEPT'} ADMIN <Star size={10} fill="#ffffff" />
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{u.email}</div>
                              {u.designation && (
                                <div style={{ fontSize: 11.5, color: '#016139', fontWeight: 600, marginTop: 2 }}>
                                  {u.designation}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className={`badge ${isSuperAdmin ? 'badge-purple' : 'badge-blue'}`} style={{ textTransform: 'uppercase', fontWeight: 700, width: 'fit-content' }}>
                              {u.role}
                            </span>
                            <span style={{ fontSize: 11, color: isSuperAdmin ? '#016139' : isDeptAdmin ? '#B45309' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              {isSuperAdmin ? (
                                <><Crown size={11} /> Full System Controller</>
                              ) : isDeptAdmin ? (
                                <><Star size={11} fill="#B45309" /> Department Head / Sub-Admin</>
                              ) : (
                                <><Users size={11} /> Team Member</>
                              )}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-heading)', fontSize: 13.5, fontWeight: 600 }}>
                          {u.department || 'General'}
                        </td>
                        <td>
                          {isSuperAdmin ? (
                            <span style={{ fontSize: 12, color: '#016139', fontWeight: 700 }}>Top Level (None)</span>
                          ) : u.reportingTo ? (
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
                                {u.reportingTo.name}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                {u.reportingTo.designation || u.reportingTo.role}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Direct (Super Admin)</span>
                          )}
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: u.isActive ? '#E9F8F1' : '#FFF0F0',
                              color: u.isActive ? '#10B981' : '#EF4444',
                              fontWeight: 700,
                            }}
                          >
                            {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Toggle Department Lead / Sub-Admin (Admin only) */}
                            {currentUser?.role === 'admin' && !isSuperAdmin && (
                              <button
                                onClick={() => toggleDepartmentHead(u)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  background: isDeptAdmin ? '#FEF3C7' : '#F1F5F9',
                                  border: `1px solid ${isDeptAdmin ? '#FCD34D' : '#CBD5E1'}`,
                                  color: isDeptAdmin ? '#92400E' : '#475569',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                                title={isDeptAdmin ? 'Remove Dept Admin Status' : 'Promote to Dept Admin'}
                              >
                                <Star size={13} fill={isDeptAdmin ? '#F59E0B' : 'none'} color={isDeptAdmin ? '#F59E0B' : '#64748B'} />
                                {isDeptAdmin ? 'Dept Admin' : 'Make Admin'}
                              </button>
                            )}

                            {/* Deactivate / Activate */}
                            {(currentUser?.role === 'admin' || currentUser?.role === 'hr' || currentUser?.role === 'management') && (
                              <button
                                onClick={() => toggleActive(u)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  background: 'transparent',
                                  border: '1px solid #CBD8D3',
                                  color: 'var(--text-body)',
                                  cursor: 'pointer',
                                }}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}

                            {/* Reset Password */}
                            {currentUser?.role === 'admin' && (
                              <button
                                onClick={() => handleResetPassword(u)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 6px', color: '#D97706' }}
                                title="Reset Login Password"
                              >
                                <Key size={15} />
                              </button>
                            )}

                            {/* Edit */}
                            {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
                              <button
                                onClick={() => openEditModal(u)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 6px' }}
                                title="Edit Details & Manager"
                              >
                                <Edit2 size={15} color="var(--primary)" />
                              </button>
                            )}

                            {/* Delete */}
                            {currentUser?.role === 'admin' && u._id !== currentUser._id && (
                              <button
                                onClick={() => handleDelete(u._id, u.name)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--red)', padding: '4px 6px' }}
                                title="Delete Employee"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={empPage}
            totalPages={Math.ceil(filteredUsers.length / 7) || 1}
            totalItems={filteredUsers.length}
            itemsPerPage={7}
            onPageChange={setEmpPage}
          />
        </div>
      </div>

      {/* Pop-up Centered Modal for Create / Edit Employee */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={20} color="var(--primary)" />
                <h3 className="modal-title">
                  {editingUser ? `Edit Employee Details (${editingUser.name})` : 'Add New Employee'}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && <div className="alert alert-error" style={{ margin: '16px 24px 0' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Full Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="user@hiverift.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {editingUser ? 'New Password (leave blank to keep current)' : 'Login Password *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassInModal ? 'text' : 'password'}
                        required={!editingUser}
                        className="form-input"
                        style={{ paddingRight: 38 }}
                        placeholder={editingUser ? 'Leave blank to keep existing' : 'Minimum 6 characters'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassInModal(!showPassInModal)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                        title={showPassInModal ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassInModal ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                      {editingUser ? 'Only fill if you want to change user\'s password' : 'Employee will use this password to log in'}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">System Role (RBAC)</label>
                    <select
                      required
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Department</label>
                    <select
                      className="form-select"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      {DEPARTMENTS.filter(d => d !== 'All').map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-Admin / Department Head Checkbox Card */}
                <div style={{
                  background: formData.isDepartmentHead ? '#FEFCE8' : '#F8FAFC',
                  border: `1.5px solid ${formData.isDepartmentHead ? '#F59E0B' : '#E2E8F0'}`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }} onClick={() => setFormData({ ...formData, isDepartmentHead: !formData.isDepartmentHead })}>
                  <input
                    type="checkbox"
                    checked={formData.isDepartmentHead}
                    onChange={(e) => setFormData({ ...formData, isDepartmentHead: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#016139', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" /> Designate as Department Head / Sub-Admin ({formData.department || 'Department'})
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Makes this user the main leader/admin for {formData.department}. New department team members will report under them.
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Reports To (Team Leader / Supervisor)</label>
                    <select
                      className="form-select"
                      value={formData.reportingTo}
                      onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                    >
                      <option value="">Direct to Super Admin</option>
                      {availableManagers.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.isDepartmentHead ? `${m.department} Head` : m.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation / Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sales Head / Tech Lead / Executive"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="EMP-1001"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Joining</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingUser ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
