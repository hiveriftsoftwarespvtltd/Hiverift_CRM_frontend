import { useState, useEffect } from 'react';
import { leadsAPI, usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, Search, Filter, Phone, Mail, MessageSquare, UserPlus,
  MoreVertical, Eye, Edit3, Trash2, Calendar, RotateCcw, X, ShieldCheck, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LEAD_STATUSES = ['all', 'new', 'assigned', 'contacted', 'interested', 'requirement', 'quotation', 'negotiation', 'won', 'lost'];
const LEAD_SOURCES = ['facebook', 'google', 'website', 'referral', 'calling', 'whatsapp', 'other'];

const getDateRange = (type) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (type === 'today') {
    return { startDate: todayStr, endDate: todayStr };
  }
  if (type === 'yesterday') {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yStr = y.toISOString().split('T')[0];
    return { startDate: yStr, endDate: yStr };
  }
  if (type === 'last_7_days') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
  }
  if (type === 'last_30_days') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
  }
  if (type === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: startOfMonth.toISOString().split('T')[0], endDate: todayStr };
  }
  return { startDate: '', endDate: '' };
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'management';

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [salesUsers, setSalesUsers] = useState([]);

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '', company: '', phone: '', whatsapp: '', email: '', city: '', requirement: '', source: 'website', estimatedValue: '', assignedTo: '', nextFollowup: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchSalesUsers();
  }, [statusTab, search, sourceFilter, dateFilter, customStartDate, customEndDate]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      if (search) params.search = search;
      if (sourceFilter) params.source = sourceFilter;

      // Date filtering
      if (dateFilter === 'custom') {
        if (customStartDate) params.startDate = customStartDate;
        if (customEndDate) params.endDate = customEndDate;
      } else if (dateFilter !== 'all') {
        const { startDate, endDate } = getDateRange(dateFilter);
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const { data } = await leadsAPI.getAll(params);
      setLeads(data.data.leads || []);
      setTotal(data.data.total || 0);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesUsers = async () => {
    try {
      const { data } = await usersAPI.getAll({ limit: 100 });
      setSalesUsers(data.data.users || []);
    } catch { }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSourceFilter('');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleOpenCreate = () => {
    setEditLead(null);
    setFormData({
      name: '', company: '', phone: '', whatsapp: '', email: '', city: '', requirement: '', source: 'website', estimatedValue: '',
      assignedTo: isAdminOrManager ? '' : (user?._id || ''),
      nextFollowup: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (lead, e) => {
    if (e) e.stopPropagation();
    setEditLead(lead);
    setFormData({
      name: lead.name || '',
      company: lead.company || '',
      phone: lead.phone || '',
      whatsapp: lead.whatsapp || '',
      email: lead.email || '',
      city: lead.city || '',
      requirement: lead.requirement || '',
      source: lead.source || 'website',
      status: lead.status || 'new',
      estimatedValue: lead.estimatedValue || '',
      assignedTo: lead.assignedTo?._id || lead.assignedTo || (isAdminOrManager ? '' : user?._id || ''),
      nextFollowup: lead.nextFollowup ? new Date(lead.nextFollowup).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });
      if (formData.estimatedValue) payload.estimatedValue = Number(formData.estimatedValue);

      // If normal sales employee, ensure assigned to self
      if (!isAdminOrManager && user?._id) {
        payload.assignedTo = user._id;
      }

      if (editLead) {
        await leadsAPI.update(editLead._id, payload);
        if (payload.status === 'won') {
          Swal.fire({
            icon: 'success',
            title: 'Deal Won! Client Created!',
            text: 'Lead marked as WON and converted into an active Client automatically.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({ icon: 'success', title: 'Lead Updated!', text: 'Contact details and profile updated successfully', timer: 1500, showConfirmButton: false });
        }
      } else {
        await leadsAPI.create(payload);
        Swal.fire({ icon: 'success', title: 'Lead Created!', text: 'Lead added successfully', timer: 1500, showConfirmButton: false });
      }

      setShowModal(false);
      setEditLead(null);
      setFormData({ name: '', company: '', phone: '', whatsapp: '', email: '', city: '', requirement: '', source: 'website', status: 'new', estimatedValue: '', assignedTo: '', nextFollowup: '' });
      fetchLeads();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to save lead' });
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    const res = await Swal.fire({
      title: 'Delete Lead?',
      text: `Are you sure you want to delete lead "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9AA7A3',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await leadsAPI.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        fetchLeads();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not delete lead' });
      }
    }
  };

  const isFiltered = search || sourceFilter || dateFilter !== 'all' || customStartDate || customEndDate;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Leads</h1>
          <p className="page-subtitle">Track, assign, edit, and nurture prospective business inquiries ({total} total)</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Status Tabs */}
      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <div className="status-tabs">
          {LEAD_STATUSES.map(s => (
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

      {/* Filters Bar with Date-Wise Filtering */}
      <div className="filters-bar" style={{ borderRadius: '12px 12px 0 0', border: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ minWidth: 240, flex: 1 }}>
          <Search />
          <input
            className="search-input"
            placeholder="Search leads by name, company, phone, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Source Filter */}
        <select
          className="form-select"
          style={{ maxWidth: 150 }}
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
        >
          <option value="">All Sources</option>
          {LEAD_SOURCES.map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>

        {/* Date Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            className="form-select"
            style={{ minWidth: 160, fontWeight: dateFilter !== 'all' ? 700 : 400, borderColor: dateFilter !== 'all' ? 'var(--primary)' : 'var(--border)' }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="custom">Custom Date Range...</option>
          </select>
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 130, padding: '3px 6px', fontSize: 12 }}
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 130, padding: '3px 6px', fontSize: 12 }}
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
            />
          </div>
        )}

        {/* Reset Filters Button */}
        {isFiltered && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px' }}
            onClick={handleResetFilters}
            title="Reset All Filters"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper" style={{ borderRadius: '0 0 12px 12px' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <UserPlus />
            <h3>No leads found</h3>
            <p>{isFiltered ? 'No leads match the selected date / filters. Try changing or resetting filters.' : 'Get started by adding your first lead to HiveRift CRM'}</p>
            {isFiltered ? (
              <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
                <RotateCcw size={13} /> Reset Filters
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
                <Plus size={14} /> Add Lead
              </button>
            )}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Lead ID & Date</th>
                <th>Name / Company</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Est. Value</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{lead.leadId}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <Calendar size={11} />
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{lead.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.company || 'Individual'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={12} /> {lead.phone}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={12} /> {lead.email || '-'}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-body)' }}>
                      {lead.source}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{lead.estimatedValue?.toLocaleString() || '0'}</td>
                  <td>{lead.assignedTo?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td>
                    <span className={`badge badge-${lead.status}`}>
                      {lead.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {/* View Button */}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead._id}`); }}
                        title="View Full Profile & Timeline"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Edit Button */}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
                        onClick={(e) => handleOpenEdit(lead, e)}
                        title="Edit Name, Email, Phone, Company"
                      >
                        <Edit3 size={13} style={{ color: 'var(--primary)' }} /> Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)', padding: '4px 6px' }}
                        onClick={(e) => handleDelete(lead._id, lead.name, e)}
                        title="Delete Lead"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Lead Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">
                {editLead ? `Edit Lead Details (${editLead.leadId || editLead.name})` : 'Create New Lead'}
              </h3>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditLead(null); }}>×</button>
            </div>
            <form onSubmit={handleSaveLead}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Contact Name</label>
                    <input
                      className="form-input"
                      required
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      className="form-input"
                      placeholder="Company Pvt Ltd"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Phone Number</label>
                    <input
                      className="form-input"
                      required
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      className="form-input"
                      placeholder="+91 9876543210"
                      value={formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="client@email.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      className="form-input"
                      placeholder="Mumbai / Delhi"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Requirement Details</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Specific services requested, technology stack, timeline..."
                    value={formData.requirement}
                    onChange={e => setFormData({ ...formData, requirement: e.target.value })}
                  />
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Lead Source</label>
                    <select
                      className="form-select"
                      value={formData.source}
                      onChange={e => setFormData({ ...formData, source: e.target.value })}
                    >
                      {LEAD_SOURCES.map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Deal Value (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 50000"
                      value={formData.estimatedValue}
                      onChange={e => setFormData({ ...formData, estimatedValue: e.target.value })}
                    />
                  </div>

                  {/* Assign Sales Exec: Dropdown for Admin/Management, Autofill Read-only for Sales Employee */}
                  {isAdminOrManager ? (
                    <div className="form-group">
                      <label className="form-label">Assign Sales Exec</label>
                      <select
                        className="form-select"
                        value={formData.assignedTo}
                        onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                      >
                        <option value="">Select Executive</option>
                        {salesUsers.map(u => (
                          <option key={u._id} value={u._id}>{u.name} ({u.role?.toUpperCase()})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Sales Executive (Self)</label>
                      <input
                        className="form-input"
                        disabled
                        value={`${user?.name || 'You'} (${user?.role?.toUpperCase() || 'Sales'})`}
                        style={{ background: '#f8fafc', color: '#016139', fontWeight: 700, borderColor: '#a7f3d0' }}
                      />
                    </div>
                  )}
                </div>

                {editLead && (
                  <div className="grid-2" style={{ marginTop: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Deal / Pipeline Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        style={{
                          fontWeight: 700,
                          color: formData.status === 'won' ? '#016139' : formData.status === 'lost' ? '#DC2626' : 'var(--text-heading)'
                        }}
                      >
                        {LEAD_STATUSES.filter(s => s !== 'all').map(s => (
                          <option key={s} value={s}>
                            {s.toUpperCase()} {s === 'won' ? '(Auto-Creates Client)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">First / Next Follow-up Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.nextFollowup}
                        onChange={e => setFormData({ ...formData, nextFollowup: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {!editLead && (
                  <div className="form-group">
                    <label className="form-label">First Follow-up Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.nextFollowup}
                      onChange={e => setFormData({ ...formData, nextFollowup: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditLead(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editLead ? 'Save Updated Lead' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
