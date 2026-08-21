import { useState, useEffect } from 'react';
import { renewalsAPI, clientsAPI } from '../../api';
import {
  RefreshCw, Plus, Calendar, AlertTriangle, CheckCircle, Clock,
  Eye, Trash2, Building, Phone, Mail, FileText, CheckCircle2,
  X, AlertCircle, DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';
import PaginationControls from '../../components/common/PaginationControls';

const RENEWAL_TABS = ['all', 'due_today', 'next_7_days', 'next_30_days', 'renewed', 'expired'];

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [renewalPage, setRenewalPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [previewRenewal, setPreviewRenewal] = useState(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    setRenewalPage(1);
  }, [statusTab]);

  const [formData, setFormData] = useState({
    client: '',
    service: 'Annual Domain & Hosting',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    amount: 15000,
    notes: ''
  });

  useEffect(() => {
    fetchRenewals();
    fetchClients();
  }, [statusTab]);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      const [rRes, dRes] = await Promise.all([
        renewalsAPI.getAll(params),
        renewalsAPI.getDashboard(),
      ]);
      setRenewals(rRes.data.data.renewals || []);
      setDashboard(dRes.data.data);
    } catch (err) {
      console.error('Error fetching renewals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await clientsAPI.getAll({ limit: 100 });
      setClients(data.data.clients || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleCreateRenewal = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: Number(formData.amount) || 0 };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      await renewalsAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Service Registered', text: 'Renewal record created successfully', timer: 1500, showConfirmButton: false });
      setShowModal(false);
      setFormData({
        client: '',
        service: 'Annual Domain & Hosting',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        amount: 15000,
        notes: ''
      });
      fetchRenewals();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to create renewal' });
    }
  };

  const handleRenewService = async (id, serviceName) => {
    const { value: formValues } = await Swal.fire({
      title: `Renew Service: ${serviceName}`,
      html: `
        <label style="display:block; text-align:left; font-size:13px; font-weight:600; margin-bottom:4px">New Expiry Date</label>
        <input id="swal-expiry" type="date" class="swal2-input" value="${new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]}" />
        <label style="display:block; text-align:left; font-size:13px; font-weight:600; margin-top:12px; margin-bottom:4px">Renewal Amount (₹)</label>
        <input id="swal-amount" type="number" class="swal2-input" placeholder="15000" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Process Renewal',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          newExpiryDate: document.getElementById('swal-expiry').value,
          amount: Number(document.getElementById('swal-amount').value) || 0,
        };
      }
    });

    if (formValues) {
      try {
        await renewalsAPI.renew(id, formValues);
        Swal.fire({ icon: 'success', title: 'Service Renewed!', timer: 1500, showConfirmButton: false });
        if (previewRenewal && previewRenewal._id === id) {
          setPreviewRenewal(null);
        }
        fetchRenewals();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Renewal processing failed' });
      }
    }
  };

  const handleDeleteRenewal = async (id, serviceName) => {
    const res = await Swal.fire({
      title: 'Delete Renewal Record?',
      text: `Are you sure you want to delete "${serviceName || 'this renewal record'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (res.isConfirmed) {
      try {
        await renewalsAPI.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted', text: 'Renewal record removed successfully', timer: 1200, showConfirmButton: false });
        if (previewRenewal && previewRenewal._id === id) {
          setPreviewRenewal(null);
        }
        fetchRenewals();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to delete renewal' });
      }
    }
  };

  const getStatusBadge = (status) => {
    const formatted = (status || 'active').replace(/_/g, ' ').toUpperCase();
    let badgeClass = 'badge-quotation';
    if (status === 'renewed') badgeClass = 'badge-won';
    else if (status === 'due_today' || status === 'expired') badgeClass = 'badge-lost';
    else if (status === 'next_7_days') badgeClass = 'badge-negotiation';
    return <span className={`badge ${badgeClass}`}>{formatted}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Renewals</h1>
          <p className="page-subtitle">Track recurring revenues & service expiration dates</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Service Renewal
        </button>
      </div>

      {/* KPI Cards for Renewal Dashboard */}
      <div className="grid-5" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#FFF0F0', color: '#EF4444' }}>
            <AlertTriangle />
          </div>
          <div>
            <div className="kpi-value">{dashboard?.dueToday || 0}</div>
            <div className="kpi-label">Due Today</div>
            <div className="kpi-growth negative">Urgent</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#FFF0E5', color: '#F97316' }}>
            <Clock />
          </div>
          <div>
            <div className="kpi-value">{dashboard?.next7Days || 0}</div>
            <div className="kpi-label">Next 7 Days</div>
            <div className="kpi-growth negative">Approaching</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
            <Calendar />
          </div>
          <div>
            <div className="kpi-value">{dashboard?.next30Days || 0}</div>
            <div className="kpi-label">Next 30 Days</div>
            <div className="kpi-growth">Upcoming</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
            <CheckCircle />
          </div>
          <div>
            <div className="kpi-value">{dashboard?.renewed || 0}</div>
            <div className="kpi-label">Renewed</div>
            <div className="kpi-growth positive">Success</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RefreshCw />
          </div>
          <div>
            <div className="kpi-value">{dashboard?.expired || 0}</div>
            <div className="kpi-label">Expired</div>
            <div className="kpi-growth">Lapsed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <div className="status-tabs">
          {RENEWAL_TABS.map(s => (
            <button
              key={s}
              className={`status-tab ${statusTab === s ? 'active' : ''}`}
              onClick={() => setStatusTab(s)}
            >
              {s.replace(/_/g, ' ').toUpperCase()}
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
        ) : renewals.length === 0 ? (
          <div className="empty-state">
            <RefreshCw />
            <h3>No Renewals Found</h3>
            <p>Maintain recurring client subscriptions like Hosting, SEO, Domains.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Service Name</th>
                    <th>Start Date</th>
                    <th>Expiry Date</th>
                    <th>Amount (₹)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renewals
                    .slice((renewalPage - 1) * 7, renewalPage * 7)
                    .map(r => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        <div>{r.client?.name || 'N/A'}</div>
                        {r.client?.company && (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.client.company}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.service}</div>
                        {r.notes && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 13 }}>{new Date(r.startDate).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600, color: r.status === 'expired' || r.status === 'due_today' ? 'var(--red)' : 'var(--text-heading)' }}>
                        {new Date(r.expiryDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{r.amount?.toLocaleString() || 0}</td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* Preview Button */}
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '4px 8px',
                              fontSize: 12,
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            onClick={() => setPreviewRenewal(r)}
                            title="View Full Renewal Details"
                          >
                            <Eye size={13} /> Preview
                          </button>

                          {/* Renew Now Button */}
                          {r.status !== 'renewed' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{
                                background: '#10B981',
                                padding: '4px 8px',
                                fontSize: 12,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              onClick={() => handleRenewService(r._id, r.service)}
                              title="Process Service Renewal"
                            >
                              <RefreshCw size={13} /> Renew
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--red)', padding: '4px 6px' }}
                            onClick={() => handleDeleteRenewal(r._id, r.service)}
                            title="Delete Renewal Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={renewalPage}
              totalPages={Math.ceil(renewals.length / 7) || 1}
              totalItems={renewals.length}
              itemsPerPage={7}
              onPageChange={setRenewalPage}
            />
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewRenewal && (
        <div className="modal-overlay" onClick={() => setPreviewRenewal(null)}>
          <div
            className="modal"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 className="modal-title">{previewRenewal.service}</h3>
                {getStatusBadge(previewRenewal.status)}
              </div>
              <button className="modal-close" onClick={() => setPreviewRenewal(null)}>×</button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {/* Client Info Card */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Client Profile
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {previewRenewal.client?.name || 'N/A'}
                </div>
                {previewRenewal.client?.company && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    <Building size={13} /> {previewRenewal.client.company}
                  </div>
                )}
                {previewRenewal.client?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    <Phone size={13} /> {previewRenewal.client.phone}
                  </div>
                )}
                {previewRenewal.client?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    <Mail size={13} /> {previewRenewal.client.email}
                  </div>
                )}
              </div>

              {/* Dates & Commercials */}
              <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>START DATE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>
                    {new Date(previewRenewal.startDate).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EXPIRY DATE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)', marginTop: 3 }}>
                    {new Date(previewRenewal.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ background: '#E9F8F1', border: '1px solid #A7F3D0', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#016139', fontWeight: 600 }}>ANNUAL SUBSCRIPTION AMOUNT</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#016139', marginTop: 2 }}>
                  ₹{previewRenewal.amount?.toLocaleString() || 0}
                </div>
              </div>

              {/* Notes */}
              {previewRenewal.notes && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Service Scope & Notes:
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-body)', background: '#fff', border: '1px solid var(--border)', padding: 10, borderRadius: 6 }}>
                    {previewRenewal.notes}
                  </div>
                </div>
              )}

              {/* Renewed Details if applicable */}
              {previewRenewal.renewedAt && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} /> Service Successfully Renewed
                  </div>
                  <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>
                    Renewed On: {new Date(previewRenewal.renewedAt).toLocaleDateString()}
                    {previewRenewal.newExpiryDate && ` • New Expiry: ${new Date(previewRenewal.newExpiryDate).toLocaleDateString()}`}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => handleDeleteRenewal(previewRenewal._id, previewRenewal.service)}
              >
                <Trash2 size={14} /> Delete Record
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreviewRenewal(null)}
                >
                  Close
                </button>
                {previewRenewal.status !== 'renewed' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => handleRenewService(previewRenewal._id, previewRenewal.service)}
                  >
                    <RefreshCw size={14} /> Renew Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Register Renewable Service</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateRenewal}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Client</label>
                    <select
                      className="form-select"
                      required
                      value={formData.client}
                      onChange={e => setFormData({ ...formData, client: e.target.value })}
                    >
                      <option value="">Select Client</option>
                      {clients.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.company ? `(${c.company})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Service Name</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Annual Domain & Hosting, SEO Maintenance"
                      value={formData.service}
                      onChange={e => setFormData({ ...formData, service: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label required">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.expiryDate}
                      onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Annual Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="15000"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Description</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Domain registrar, hosting server IP, SSL provider details..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Renewal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
