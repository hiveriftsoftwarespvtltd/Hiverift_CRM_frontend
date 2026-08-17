import { useState, useEffect } from 'react';
import { paymentsAPI, clientsAPI, quotationsAPI } from '../../api';
import { CreditCard, Plus, CheckCircle2, Clock, AlertTriangle, Edit3, Trash2, Search, DollarSign, ArrowUpRight, Building } from 'lucide-react';
import Swal from 'sweetalert2';

const PAYMENT_STATUS_TABS = ['all', 'paid', 'partial', 'pending', 'overdue'];

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalInvoiced: 0, totalReceived: 0, totalPending: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [clients, setClients] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    client: '',
    invoiceAmount: '',
    receivedAmount: '',
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchClients();
  }, [statusTab]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      const [pRes, sRes] = await Promise.all([
        paymentsAPI.getAll(params),
        paymentsAPI.getSummary(),
      ]);
      setPayments(pRes.data.data.payments || []);
      if (sRes.data.data) {
        setSummary(sRes.data.data);
      }
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

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        invoiceAmount: Number(formData.invoiceAmount) || 0,
        receivedAmount: Number(formData.receivedAmount) || 0,
      };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });

      if (editPayment) {
        await paymentsAPI.update(editPayment._id, payload);
        Swal.fire({ icon: 'success', title: 'Payment Updated! 💳', timer: 1400, showConfirmButton: false });
      } else {
        await paymentsAPI.create(payload);
        Swal.fire({ icon: 'success', title: 'Payment Receipt Saved! 💳', timer: 1400, showConfirmButton: false });
      }

      setShowModal(false);
      setEditPayment(null);
      setFormData({ client: '', invoiceAmount: '', receivedAmount: '', paymentMethod: 'bank_transfer', reference: '', notes: '' });
      fetchPayments();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Payment recording failed' });
    }
  };

  const handleOpenEdit = (p) => {
    setEditPayment(p);
    setFormData({
      client: p.client?._id || p.client || '',
      invoiceAmount: p.invoiceAmount || '',
      receivedAmount: p.receivedAmount || '',
      paymentMethod: p.paymentMethod || 'bank_transfer',
      reference: p.reference || '',
      notes: p.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id, paymentNo) => {
    const res = await Swal.fire({
      title: 'Delete Payment?',
      text: `Are you sure you want to delete receipt ${paymentNo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await paymentsAPI.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        fetchPayments();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not delete payment' });
      }
    }
  };

  const filteredPayments = payments.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.paymentNo?.toLowerCase().includes(s) ||
      p.client?.name?.toLowerCase().includes(s) ||
      p.client?.company?.toLowerCase().includes(s) ||
      p.reference?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments & Invoicing</h1>
          <p className="page-subtitle">Track collections, update client payments, and manage outstanding balances</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditPayment(null);
            setFormData({ client: '', invoiceAmount: '', receivedAmount: '', paymentMethod: 'bank_transfer', reference: '', notes: '' });
            setShowModal(true);
          }}
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#016139' }}>₹{summary.totalReceived?.toLocaleString()}</div>
            <div className="kpi-label">Total Received / Collected</div>
            <div className="kpi-growth positive">Cleared Payments</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#D97706' }}>₹{summary.totalPending?.toLocaleString()}</div>
            <div className="kpi-label">Outstanding / Pending</div>
            <div className="kpi-growth negative">To be collected</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#1E40AF' }}>₹{summary.totalInvoiced?.toLocaleString()}</div>
            <div className="kpi-label">Total Invoiced Value</div>
            <div className="kpi-growth positive">{summary.count || payments.length} Total Receipts</div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div className="status-tabs">
          {PAYMENT_STATUS_TABS.map(s => (
            <button
              key={s}
              className={`status-tab ${statusTab === s ? 'active' : ''}`}
              onClick={() => setStatusTab(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="search-box" style={{ width: 260 }}>
          <Search size={15} />
          <input
            className="search-input"
            placeholder="Search receipt, client, UTR..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <CreditCard />
            <h3>No Payment Receipts Found</h3>
            <p>Log received client amounts and track pending receivables easily.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Record Payment
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Client / Company</th>
                <th>Invoice Amt</th>
                <th>Received Amt</th>
                <th>Pending Balance</th>
                <th>Method / Reference</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.paymentNo}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{p.client?.name || 'N/A'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {p.client?.company || '-'} • {p.client?.phone || ''}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{p.invoiceAmount?.toLocaleString()}</td>
                  <td style={{ color: '#016139', fontWeight: 700, fontSize: 14 }}>₹{p.receivedAmount?.toLocaleString()}</td>
                  <td style={{ color: p.pendingAmount > 0 ? '#DC2626' : '#10B981', fontWeight: 700 }}>
                    ₹{p.pendingAmount?.toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-heading)' }}>
                      {p.paymentMethod?.replace('_', ' ')}
                    </div>
                    {p.reference && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Ref: {p.reference}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${p.status === 'paid' ? 'won' : p.status === 'partial' ? 'quotation' : 'lost'}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                        title="Update Received Payment"
                        onClick={() => handleOpenEdit(p)}
                      >
                        <Edit3 size={13} style={{ color: 'var(--primary)' }} /> Update
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#EF4444', padding: '5px 8px' }}
                        title="Delete Receipt"
                        onClick={() => handleDelete(p._id, p.paymentNo)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record / Update Payment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">
                {editPayment ? `Update Payment (${editPayment.paymentNo})` : 'Record New Payment Receipt'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">Select Client</label>
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

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Total Invoice Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      placeholder="e.g. 50000"
                      value={formData.invoiceAmount}
                      onChange={e => setFormData({ ...formData, invoiceAmount: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Total Amount Received (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      placeholder="e.g. 25000"
                      value={formData.receivedAmount}
                      onChange={e => setFormData({ ...formData, receivedAmount: e.target.value })}
                    />
                  </div>
                </div>

                {/* Live balance preview */}
                {formData.invoiceAmount && (
                  <div style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Calculated Pending Balance:</span>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: Math.max(0, (Number(formData.invoiceAmount) || 0) - (Number(formData.receivedAmount) || 0)) === 0 ? '#10B981' : '#DC2626'
                    }}>
                      ₹{Math.max(0, (Number(formData.invoiceAmount) || 0) - (Number(formData.receivedAmount) || 0)).toLocaleString()}
                      {Math.max(0, (Number(formData.invoiceAmount) || 0) - (Number(formData.receivedAmount) || 0)) === 0 && ' (FULLY PAID 🎉)'}
                    </span>
                  </div>
                )}

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                      <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="online">Online Gateway (Razorpay/Stripe)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Transaction Reference / UTR No</label>
                    <input
                      className="form-input"
                      placeholder="e.g. UTR123456789 / Cheque #004"
                      value={formData.reference}
                      onChange={e => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Remarks</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Advance 50% milestone payment received via NEFT"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editPayment ? 'Update Payment Record' : 'Save Payment Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
