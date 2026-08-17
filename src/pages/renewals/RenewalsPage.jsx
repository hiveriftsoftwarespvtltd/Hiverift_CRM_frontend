import { useState, useEffect } from 'react';
import { renewalsAPI, clientsAPI } from '../../api';
import { RefreshCw, Plus, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

const RENEWAL_TABS = ['all', 'due_today', 'next_7_days', 'next_30_days', 'renewed', 'expired'];

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    client: '', service: 'Annual Domain & Hosting', startDate: new Date().toISOString().split('T')[0], expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0], amount: 15000, notes: ''
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await clientsAPI.getAll({ limit: 100 });
      setClients(data.data.clients || []);
    } catch {}
  };

  const handleCreateRenewal = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: Number(formData.amount) || 0 };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      await renewalsAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Service Registered', timer: 1500, showConfirmButton: false });
      setShowModal(false);
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
        Swal.fire({ icon: 'success', title: 'Service Renewed! 🚀', timer: 1500, showConfirmButton: false });
        fetchRenewals();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Renewal processing failed' });
      }
    }
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
              {s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : renewals.length === 0 ? (
          <div className="empty-state">
            <RefreshCw />
            <h3>No Renewals Found</h3>
            <p>Maintain recurring client subscriptions like Hosting, SEO, Domains.</p>
          </div>
        ) : (
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
              {renewals.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{r.client?.name || 'N/A'}</td>
                  <td>{r.service}</td>
                  <td style={{ fontSize: 13 }}>{new Date(r.startDate).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--red)' }}>{new Date(r.expiryDate).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{r.amount?.toLocaleString() || 0}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status.replace('_', ' ').toUpperCase()}</span></td>
                  <td>
                    {r.status !== 'renewed' && (
                      <button className="btn btn-primary btn-sm" style={{ background: '#10B981' }} onClick={() => handleRenewService(r._id, r.service)}>
                        <RefreshCw size={14} /> Renew Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                    <select className="form-select" required value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })}>
                      <option value="">Select Client</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Service Name</label>
                    <input className="form-input" required value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label required">Start Date</label>
                    <input type="date" className="form-input" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Expiry Date</label>
                    <input type="date" className="form-input" required value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Annual Amount (₹)</label>
                    <input type="number" className="form-input" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                  </div>
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
