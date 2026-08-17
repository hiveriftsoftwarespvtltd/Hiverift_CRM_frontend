import { useState, useEffect } from 'react';
import { usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

const ROLES = [
  { value: 'admin', label: 'ADMIN', color: 'badge-purple' },
  { value: 'management', label: 'MANAGEMENT', color: 'badge-blue' },
  { value: 'sales', label: 'SALES', color: 'badge-indigo' },
  { value: 'digital_marketing', label: 'DIGITAL MARKETING', color: 'badge-blue' },
  { value: 'development', label: 'DEVELOPMENT', color: 'badge-blue' },
  { value: 'hr', label: 'HR', color: 'badge-purple' },
];

const DEPARTMENTS = ['Management', 'Sales', 'Digital Marketing', 'Development', 'Human Resources', 'Finance'];

export default function EmployeesPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'sales',
    department: 'Sales',
    designation: '',
    employeeId: '',
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
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'sales',
      department: 'Sales',
      designation: '',
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      joiningDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      phone: u.phone || '',
      role: u.role || 'sales',
      department: u.department || '',
      designation: u.designation || '',
      employeeId: u.employeeId || '',
      joiningDate: u.joiningDate ? new Date(u.joiningDate).toISOString().split('T')[0] : '',
      isActive: u.isActive !== undefined ? u.isActive : true,
    });
    setError('');
    setShowModal(true);
  };

  const toggleActive = async (u) => {
    try {
      await usersAPI.update(u._id, { isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await usersAPI.update(editingUser._id, payload);
      } else {
        await usersAPI.create(formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee account?')) return;
    try {
      await usersAPI.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const roleKey = role?.toLowerCase();
    const r = ROLES.find((item) => item.value === roleKey);
    const label = r ? r.label : role?.toUpperCase()?.replace('_', ' ');
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '3px 12px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.3px',
          background: '#EDE9FF',
          color: '#4F46E5',
        }}
      >
        {label}
      </span>
    );
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Employee Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, margin: 0 }}>
            User management & Role-Based Access Control (RBAC)
          </p>
        </div>
        {(currentUser?.role === 'admin' || currentUser?.role === 'hr' || currentUser?.role === 'management') && (
          <button
            className="btn btn-primary"
            style={{ borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={openCreateModal}
          >
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 12 }}>
        <div className="table-responsive">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FAFBFB', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>EMPLOYEE</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>ROLE</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>DEPARTMENT</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>DESIGNATION</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>STATUS</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>
                    Loading employee directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-heading)' }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>{getRoleBadge(u.role)}</td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-body)' }}>{u.department || 'N/A'}</td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-body)' }}>{u.designation || '—'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.3px',
                          background: u.isActive ? '#E9F8F1' : '#FFF0F0',
                          color: u.isActive ? '#10B981' : '#EF4444',
                        }}
                      >
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'hr' || currentUser?.role === 'management') && (
                          <button
                            onClick={() => toggleActive(u)}
                            style={{
                              padding: '4px 14px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 500,
                              background: 'transparent',
                              border: '1px solid #CBD8D3',
                              color: 'var(--text-body)',
                              cursor: 'pointer',
                            }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
                          <button
                            onClick={() => openEditModal(u)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: 4,
                            }}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {currentUser?.role === 'admin' && u._id !== currentUser._id && (
                          <button
                            onClick={() => handleDelete(u._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--red)',
                              cursor: 'pointer',
                              padding: 4,
                            }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingUser ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {error && <div className="alert alert-error" style={{ margin: '16px 24px 0' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">
                    {editingUser ? 'New Password (leave blank to keep)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    className="form-input"
                    placeholder={editingUser ? '••••••••' : 'Minimum 6 chars'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Role *</label>
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

                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Developer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
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
