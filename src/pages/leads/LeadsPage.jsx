import { useState, useEffect } from 'react';
import { leadsAPI, usersAPI } from '../../api';
import { Plus, Search, Filter, Phone, Mail, MessageSquare, UserPlus, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LEAD_STATUSES = ['all', 'new', 'assigned', 'contacted', 'interested', 'requirement', 'quotation', 'negotiation', 'won', 'lost'];
const LEAD_SOURCES = ['facebook', 'google', 'website', 'referral', 'calling', 'whatsapp', 'other'];

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [salesUsers, setSalesUsers] = useState([]);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', company: '', phone: '', whatsapp: '', email: '', city: '', requirement: '', source: 'website', estimatedValue: '', assignedTo: '', nextFollowup: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchSalesUsers();
  }, [statusTab, search, sourceFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      if (search) params.search = search;
      if (sourceFilter) params.source = sourceFilter;

      const { data } = await leadsAPI.getAll(params);
      setLeads(data.data.leads || []);
      setTotal(data.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesUsers = async () => {
    try {
      const { data } = await usersAPI.getAll({ limit: 100 });
      setSalesUsers(data.data.users || []);
    } catch {}
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });
      if (formData.estimatedValue) payload.estimatedValue = Number(formData.estimatedValue);

      await leadsAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Lead Created!', text: 'Lead added successfully', timer: 1500, showConfirmButton: false });
      setShowModal(false);
      setFormData({ name: '', company: '', phone: '', whatsapp: '', email: '', city: '', requirement: '', source: 'website', estimatedValue: '', assignedTo: '', nextFollowup: '' });
      fetchLeads();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to create lead' });
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

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Management</h1>
          <p className="page-subtitle">Track, follow up, and convert potential clients ({total} total leads)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Lead
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
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar" style={{ borderRadius: '12px 12px 0 0', border: '1px solid var(--border)' }}>
        <div className="search-box">
          <Search />
          <input
            className="search-input"
            placeholder="Search lead, company, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 160, padding: '7px 12px' }}
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
        >
          <option value="">All Sources</option>
          {LEAD_SOURCES.map(src => (
            <option key={src} value={src}>{src.toUpperCase()}</option>
          ))}
        </select>
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
            <p>Get started by adding your first lead to HiveRift CRM</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add Lead
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Lead ID</th>
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
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{lead.leadId}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{lead.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.company || 'Individual'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{lead.phone}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.email || '-'}</div>
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
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead._id}`); }}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)' }}
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

      {/* Create Lead Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Create New Lead</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateLead}>
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

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Lead Source</label>
                    <select
                      className="form-select"
                      value={formData.source}
                      onChange={e => setFormData({ ...formData, source: e.target.value })}
                    >
                      {LEAD_SOURCES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Value (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="150000"
                      value={formData.estimatedValue}
                      onChange={e => setFormData({ ...formData, estimatedValue: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Sales User</label>
                    <select
                      className="form-select"
                      value={formData.assignedTo}
                      onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                    >
                      <option value="">Select Sales Person</option>
                      {salesUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Requirement Details</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Client needs E-commerce website with payment gateway and admin panel..."
                    value={formData.requirement}
                    onChange={e => setFormData({ ...formData, requirement: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
