import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsAPI, projectsAPI, paymentsAPI, renewalsAPI } from '../../api';
import { ArrowLeft, Building, Phone, Mail, FolderKanban, CreditCard, RefreshCw, Plus, FileText, Edit3, ShieldCheck, MapPin, FileCheck, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import PaginationControls from '../../components/common/PaginationControls';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const [projPage, setProjPage] = useState(1);
  const [payPage, setPayPage] = useState(1);
  const [renPage, setRenPage] = useState(1);

  const [formData, setFormData] = useState({
    name: '', company: '', phone: '', whatsapp: '', email: '', city: '', address: '', gstin: '', notes: '', status: 'active'
  });

  useEffect(() => {
    fetchClient360();
  }, [id]);

  const fetchClient360 = async () => {
    setLoading(true);
    try {
      const [cRes, prRes, payRes, renRes] = await Promise.all([
        clientsAPI.getOne(id),
        projectsAPI.getAll({ client: id }),
        paymentsAPI.getAll({ client: id }),
        renewalsAPI.getAll({ client: id }),
      ]);
      const clientData = cRes.data.data;
      setClient(clientData);
      setFormData({
        name: clientData.name || '',
        company: clientData.company || '',
        phone: clientData.phone || '',
        whatsapp: clientData.whatsapp || clientData.phone || '',
        email: clientData.email || '',
        city: clientData.city || '',
        address: clientData.address || '',
        gstin: clientData.gstin || '',
        notes: clientData.notes || '',
        status: clientData.status || 'active',
      });
      setProjects(prRes.data.data.projects || []);
      setPayments(payRes.data.data.payments || []);
      setRenewals(renRes.data.data.renewals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (client) {
      setFormData({
        name: client.name || '',
        company: client.company || '',
        phone: client.phone || '',
        whatsapp: client.whatsapp || client.phone || '',
        email: client.email || '',
        city: client.city || '',
        address: client.address || '',
        gstin: client.gstin || '',
        notes: client.notes || '',
        status: client.status || 'active',
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      await clientsAPI.update(id, payload);
      Swal.fire({
        icon: 'success',
        title: 'Client Details Updated!',
        text: `360° Account for ${formData.name || 'Client'} has been updated successfully.`,
        timer: 1500,
        showConfirmButton: false
      });
      setShowEditModal(false);
      fetchClient360();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err.response?.data?.message || 'Failed to update client details' });
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clients')} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Clients
      </button>

      {/* Header Profile */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="avatar avatar-lg" style={{ background: '#014D3B', color: 'white', fontWeight: 800 }}>
              {client.name?.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>{client.name}</h1>
                <span className="badge badge-won">{client.clientId}</span>
                <span className={`badge ${client.status === 'active' ? 'badge-won' : 'badge-lost'}`}>
                  {client.status ? client.status.toUpperCase() : 'ACTIVE'}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                <Building size={13} style={{ display: 'inline', marginRight: 4 }} />
                <strong>{client.company || 'Individual Client'}</strong> • {client.city || 'Location not set'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleOpenEdit}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Edit3 size={15} color="var(--primary)" /> Edit / Update Details
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/quotations?client=${client._id}`)}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FileText size={15} /> Create Quote
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/projects?client=${client._id}`)}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={16} /> Create Project
            </button>
          </div>
        </div>

        {/* Detailed Client Info Grid */}
        <div style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          background: '#f8fafc',
          padding: '14px 18px',
          borderRadius: 8
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Phone Number</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} color="var(--primary)" /> {client.phone || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Email Address</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} color="var(--primary)" /> {client.email || 'No email provided'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>City / Location</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} color="var(--primary)" /> {client.city || client.address || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>GSTIN / Tax ID</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileCheck size={13} color="var(--primary)" /> {client.gstin || 'Unregistered'}
            </div>
          </div>
        </div>

        {client.address && (
          <div style={{ marginTop: 12, fontSize: 12, color: '#475569' }}>
            <strong>Billing Address:</strong> {client.address}
          </div>
        )}

        {client.notes && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
            <strong>Client Notes / Requirements:</strong> {client.notes}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid-3" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Business Value</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>₹{client.totalBusiness?.toLocaleString() || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pending Payments</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: client.pendingAmount > 0 ? '#EF4444' : 'var(--text-muted)' }}>
              ₹{client.pendingAmount?.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active Services</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)', marginTop: 4 }}>
              {projects.length} Active Projects
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Sub-sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Projects section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Client Projects ({projects.length})</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>View All</button>
          </div>
          {projects.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 20px' }}>No projects assigned yet</p> : (
            <div className="table-wrapper">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Department</th>
                      <th>Assigned To</th>
                      <th>Progress</th>
                      <th>Deadline</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects
                      .slice((projPage - 1) * 7, projPage * 7)
                      .map(p => (
                      <tr key={p._id} onClick={() => navigate(`/projects/${p._id}`)}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.department?.replace('_', ' ').toUpperCase()}</td>
                        <td>{p.assignedTo?.name || 'Unassigned'}</td>
                        <td>
                          <div className="progress-bar-wrap" style={{ width: 100 }}>
                            <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.progress}%</span>
                        </td>
                        <td>{new Date(p.deadline).toLocaleDateString()}</td>
                        <td><span className={`badge badge-${p.status}`}>{p.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={projPage}
                totalPages={Math.ceil(projects.length / 7) || 1}
                totalItems={projects.length}
                itemsPerPage={7}
                onPageChange={setProjPage}
              />
            </div>
          )}
        </div>

        {/* Payments & Invoices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Payments & Invoices ({payments.length})</h3>
          </div>
          {payments.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 20px' }}>No payment history</p> : (
            <div className="table-wrapper">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Payment No</th>
                      <th>Invoice Amt</th>
                      <th>Received</th>
                      <th>Pending</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments
                      .slice((payPage - 1) * 7, payPage * 7)
                      .map(py => (
                      <tr key={py._id}>
                        <td style={{ fontWeight: 600 }}>{py.paymentNo}</td>
                        <td>₹{py.invoiceAmount?.toLocaleString()}</td>
                        <td style={{ color: '#10B981', fontWeight: 600 }}>₹{py.receivedAmount?.toLocaleString()}</td>
                        <td style={{ color: '#EF4444', fontWeight: 600 }}>₹{py.pendingAmount?.toLocaleString()}</td>
                        <td><span className={`badge badge-${py.status}`}>{py.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={payPage}
                totalPages={Math.ceil(payments.length / 7) || 1}
                totalItems={payments.length}
                itemsPerPage={7}
                onPageChange={setPayPage}
              />
            </div>
          )}
        </div>

        {/* Renewals */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Services & Renewals ({renewals.length})</h3>
          </div>
          {renewals.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 20px' }}>No renewal services setup</p> : (
            <div className="table-wrapper">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Start Date</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renewals
                      .slice((renPage - 1) * 7, renPage * 7)
                      .map(r => (
                      <tr key={r._id}>
                        <td style={{ fontWeight: 600 }}>{r.service}</td>
                        <td>{new Date(r.startDate).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600, color: 'var(--red)' }}>{new Date(r.expiryDate).toLocaleDateString()}</td>
                        <td><span className={`badge badge-${r.status}`}>{r.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={renPage}
                totalPages={Math.ceil(renewals.length / 7) || 1}
                totalItems={renewals.length}
                itemsPerPage={7}
                onPageChange={setRenPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pop-up Modal for Editing Client Details */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={18} color="var(--primary)" />
                <h3 className="modal-title">Update Client Profile — {client.clientId}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateClient}>
              <div className="modal-body">

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Client / Representative Name</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Entity Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Acme Corp Pvt Ltd"
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
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="client@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">ACTIVE</option>
                      <option value="inactive">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City / Region</label>
                    <input
                      className="form-input"
                      placeholder="e.g. New Delhi"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSTIN / Tax ID</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      value={formData.gstin}
                      onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Billing Address</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Enter full office / billing address..."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client Notes & Requirements</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Project notes, custom requests, contract terms..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Client Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
