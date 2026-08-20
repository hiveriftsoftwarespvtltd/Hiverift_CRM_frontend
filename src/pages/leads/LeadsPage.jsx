import { useState, useEffect } from 'react';
import { leadsAPI, usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, Search, Filter, Phone, Mail, MessageSquare, UserPlus,
  MoreVertical, Eye, Edit3, Trash2, Calendar, RotateCcw, X, ShieldCheck, UserCheck,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
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
  const [assignedFilter, setAssignedFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [salesUsers, setSalesUsers] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '', company: '', phone: '', whatsapp: '', email: '', city: '', requirement: '', source: 'website', estimatedValue: '', assignedTo: '', nextFollowup: ''
  });

  useEffect(() => {
    fetchLeads();
  }, [page, limit, statusTab, search, sourceFilter, assignedFilter, dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    fetchSalesUsers();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };
      if (statusTab !== 'all') params.status = statusTab;
      if (search) params.search = search;
      if (sourceFilter) params.source = sourceFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

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
    setAssignedFilter('');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusTab(status);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSourceChange = (val) => {
    setSourceFilter(val);
    setPage(1);
  };

  const handleAssignedChange = (val) => {
    setAssignedFilter(val);
    setPage(1);
  };

  const handleDateFilterChange = (val) => {
    setDateFilter(val);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
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
              onClick={() => handleStatusChange(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar with Date-Wise & Assigned Staff Filtering */}
      <div className="filters-bar" style={{ borderRadius: '12px 12px 0 0', border: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ minWidth: 240, flex: 1 }}>
          <Search />
          <input
            className="search-input"
            placeholder="Search by name, company, phone, email, or assigned staff (e.g. Harsh)..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Assigned Staff Filter (for Admin/Managers) */}
        {isAdminOrManager && (
          <select
            className="form-select"
            style={{ maxWidth: 170, fontWeight: assignedFilter ? 700 : 400, borderColor: assignedFilter ? 'var(--primary)' : 'var(--border)' }}
            value={assignedFilter}
            onChange={e => handleAssignedChange(e.target.value)}
          >
            <option value="">All Assigned Staff</option>
            {salesUsers.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </select>
        )}

        {/* Source Filter */}
        <select
          className="form-select"
          style={{ maxWidth: 140 }}
          value={sourceFilter}
          onChange={e => handleSourceChange(e.target.value)}
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
            style={{ minWidth: 150, fontWeight: dateFilter !== 'all' ? 700 : 400, borderColor: dateFilter !== 'all' ? 'var(--primary)' : 'var(--border)' }}
            value={dateFilter}
            onChange={e => handleDateFilterChange(e.target.value)}
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
              onChange={e => { setCustomStartDate(e.target.value); setPage(1); }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 130, padding: '3px 6px', fontSize: 12 }}
              value={customEndDate}
              onChange={e => { setCustomEndDate(e.target.value); setPage(1); }}
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
      <div className="table-wrapper" style={{ borderRadius: total > 0 ? 0 : '0 0 12px 12px', borderBottom: total > 0 ? 'none' : '1px solid var(--border)' }}>
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
                      {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{lead.name}</div>
                    {lead.company && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{lead.company}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                      <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} style={{ color: 'inherit' }}>{lead.phone}</a>
                    </div>
                    {lead.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        <Mail size={11} />
                        <span>{lead.email}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                      {lead.source}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {lead.estimatedValue ? `₹${Number(lead.estimatedValue).toLocaleString('en-IN')}` : '₹0'}
                  </td>
                  <td>
                    {lead.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700
                        }}>
                          {lead.assignedTo.name?.charAt(0)}
                        </div>
                        <span style={{ fontSize: 12 }}>{lead.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${lead.status}`}>
                      {lead.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions" onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 4 }}>
                      {/* WhatsApp Button */}
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#25D366', padding: '4px 6px' }}
                        onClick={(e) => handleQuickWhatsApp(lead, e)}
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={15} />
                      </button>

                      {/* Convert to Client Button */}
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#016139', padding: '4px 6px' }}
                        onClick={(e) => handleConvertToClient(lead, e)}
                        title="Convert directly to Client"
                      >
                        <UserCheck size={15} />
                      </button>

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

      {/* Pagination Bar */}
      {total > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14
        }}>
          {/* Left: Summary Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Showing <strong style={{ color: 'var(--text-heading)' }}>{((page - 1) * limit) + 1}</strong> to{' '}
              <strong style={{ color: 'var(--text-heading)' }}>{Math.min(page * limit, total)}</strong> of{' '}
              <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{total}</strong> leads
            </span>

            {/* Limit Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Per page:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '4px 8px', fontSize: 12, fontWeight: 600, borderRadius: 6 }}
                value={limit}
                onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* First Page */}
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              style={{ padding: '6px 8px', opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                fontSize: 12.5,
                opacity: page <= 1 ? 0.4 : 1,
                cursor: page <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {/* Page Number Pills */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return <span key={`ellipsis-${idx}`} style={{ padding: '0 6px', color: 'var(--text-muted)' }}>...</span>;
                }
                const isActive = p === page;
                return (
                  <button
                    key={`page-${p}`}
                    type="button"
                    onClick={() => setPage(p)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isActive ? 'var(--primary)' : '#ffffff',
                      color: isActive ? '#ffffff' : 'var(--text-heading)',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                fontSize: 12.5,
                opacity: page >= totalPages ? 0.4 : 1,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next <ChevronRight size={14} />
            </button>

            {/* Last Page */}
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              style={{ padding: '6px 8px', opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

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
