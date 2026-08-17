import { useState, useEffect } from 'react';
import { clientsAPI } from '../../api';
import { UserCheck, Search, Plus, Eye, Phone, Mail, Building, Trash2, FolderKanban, FileText, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '', company: '', phone: '', whatsapp: '', email: '', city: '', address: '', gstin: '', notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, [search]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data } = await clientsAPI.getAll({ search });
      setClients(data.data.clients || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      await clientsAPI.create(payload);
      Swal.fire({
        icon: 'success',
        title: 'Client Profile Created! 🏢',
        text: 'Client is now active in your portfolio.',
        timer: 1500,
        showConfirmButton: false
      });
      setShowModal(false);
      setFormData({ name: '', company: '', phone: '', whatsapp: '', email: '', city: '', address: '', gstin: '', notes: '' });
      fetchClients();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error creating client profile' });
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    const res = await Swal.fire({
      title: 'Delete Client Profile?',
      text: `Remove client "${name}" from CRM portfolio?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await clientsAPI.delete(id);
        Swal.fire({ icon: 'success', title: 'Client Deleted', timer: 1200, showConfirmButton: false });
        fetchClients();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not delete client' });
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Portfolio</h1>
          <p className="page-subtitle">360° overview of converted business accounts, deliverables, and service contracts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add New Client
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#016139' }}>{clients.length}</div>
            <div className="kpi-label">Active Clients</div>
            <div className="kpi-growth positive">Total Converted Accounts</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
            <Building size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#1E40AF' }}>
              {clients.filter(c => c.company).length}
            </div>
            <div className="kpi-label">Corporate Entities</div>
            <div className="kpi-growth positive">Registered Enterprises</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#B45309' }}>
              ₹{clients.reduce((acc, c) => acc + (c.totalBusiness || c.totalRevenue || 0), 0).toLocaleString()}
            </div>
            <div className="kpi-label">Portfolio Value</div>
            <div className="kpi-growth positive">Lifetime Contract Worth</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar" style={{ borderRadius: '12px 12px 0 0', border: '1px solid var(--border)' }}>
        <div className="search-box" style={{ maxWidth: 360 }}>
          <Search size={14} />
          <input
            className="search-input"
            placeholder="Search by client name, company, phone, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper" style={{ borderRadius: '0 0 12px 12px' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <UserCheck />
            <h3>No Clients in Portfolio</h3>
            <p>Clients are automatically created when deals are won, or can be added manually above.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Client / Enterprise</th>
                <th>Contact Details</th>
                <th>Location</th>
                <th>Account Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c._id} onClick={() => navigate(`/clients/${c._id}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={16} /> {c.clientId}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      🏢 {c.company || 'Individual Client'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      📞 {c.phone}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      ✉️ {c.email || 'No email provided'}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {c.city || c.address || 'India'}
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-won' : 'badge-lost'}`}>
                      {c.status ? c.status.toUpperCase() : 'ACTIVE'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => navigate(`/clients/${c._id}`)}
                        title="View 360° Account"
                      >
                        <Eye size={13} /> 360° View
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => navigate(`/quotations?client=${c._id}`)}
                        title="Generate Quote for Client"
                      >
                        <FileText size={13} /> Quote
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)', padding: '4px 6px' }}
                        onClick={e => handleDelete(c._id, c.name, e)}
                        title="Delete Client"
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Create Client Profile</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateClient}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Client / Representative Name</label>
                    <input
                      className="form-input"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Entity Name</label>
                    <input
                      className="form-input"
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
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-input"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City / Region</label>
                    <input
                      className="form-input"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSTIN / Tax ID</label>
                    <input
                      className="form-input"
                      value={formData.gstin}
                      onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Billing Address / Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Client Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
