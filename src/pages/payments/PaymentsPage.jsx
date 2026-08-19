import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentsAPI, clientsAPI, quotationsAPI } from '../../api';
import { CreditCard, Plus, CheckCircle2, Clock, AlertTriangle, Edit3, Trash2, Search, DollarSign, ArrowUpRight, Building, Check, RefreshCw, UserCheck, Eye, Printer, FileText, X, Phone } from 'lucide-react';
import Swal from 'sweetalert2';

const PAYMENT_STATUS_TABS = ['all', 'paid', 'partial', 'pending'];

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalInvoiced: 0, totalReceived: 0, totalPending: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [clients, setClients] = useState([]);

  // Mode in Update Modal: 'installment' (add to existing) vs 'direct' (edit total)
  const [updateMode, setUpdateMode] = useState('installment');
  const [additionalInstallment, setAdditionalInstallment] = useState('');

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
    } catch { }
  };

  // Set of client IDs that already have a payment record
  const recordedClientIds = new Set(
    payments
      .map(p => (typeof p.client === 'object' ? p.client?._id : p.client))
      .filter(Boolean)
  );

  // Clients that do NOT have a payment record yet (for New Payment Modal only)
  const unrecordedClients = clients.filter(c => !recordedClientIds.has(c._id));

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      let finalReceivedAmount = Number(formData.receivedAmount) || 0;
      let finalInvoiceAmount = Number(formData.invoiceAmount) || 0;

      if (editPayment && updateMode === 'installment') {
        finalReceivedAmount = (Number(editPayment.receivedAmount) || 0) + (Number(additionalInstallment) || 0);
      }

      const payload = {
        ...formData,
        invoiceAmount: finalInvoiceAmount,
        receivedAmount: finalReceivedAmount,
      };

      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });

      if (editPayment) {
        await paymentsAPI.update(editPayment._id, payload);
        Swal.fire({
          icon: 'success',
          title: 'Payment Ledger Updated!',
          text: `Payment updated for ${editPayment.client?.name || 'Client'}`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await paymentsAPI.create(payload);
        Swal.fire({
          icon: 'success',
          title: 'Payment Record Created!',
          text: 'New client payment entry recorded successfully',
          timer: 1500,
          showConfirmButton: false
        });
      }

      setShowModal(false);
      setEditPayment(null);
      setAdditionalInstallment('');
      setFormData({ client: '', invoiceAmount: '', receivedAmount: '', paymentMethod: 'bank_transfer', reference: '', notes: '' });
      fetchPayments();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Payment recording failed' });
    }
  };

  const handleOpenNew = () => {
    setEditPayment(null);
    setAdditionalInstallment('');
    setUpdateMode('direct');
    setFormData({
      client: unrecordedClients.length > 0 ? unrecordedClients[0]._id : '',
      invoiceAmount: '',
      receivedAmount: '',
      paymentMethod: 'bank_transfer',
      reference: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditPayment(p);
    setUpdateMode('installment');
    setAdditionalInstallment('');
    setFormData({
      client: p.client?._id || p.client || '',
      invoiceAmount: p.invoiceAmount || 0,
      receivedAmount: p.receivedAmount || 0,
      paymentMethod: p.paymentMethod || 'bank_transfer',
      reference: '',
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
      p.reference?.toLowerCase().includes(s) ||
      p.createdBy?.name?.toLowerCase().includes(s)
    );
  });

  // Calculate live preview values for modal
  const computedInvoice = Number(formData.invoiceAmount) || 0;
  const computedReceived = editPayment && updateMode === 'installment'
    ? (Number(editPayment.receivedAmount) || 0) + (Number(additionalInstallment) || 0)
    : Number(formData.receivedAmount) || 0;
  const computedPending = Math.max(0, computedInvoice - computedReceived);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'management';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments & Invoicing</h1>
          <p className="page-subtitle">
            {isAdminOrManager
              ? 'Track company-wide collections, update client payments, and manage outstanding balances'
              : 'Track your client collections, record payment installments, and manage account balances'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenNew}>
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
            <div className="kpi-growth positive">
              {isAdminOrManager ? 'Company Cleared Payments' : 'Your Cleared Collections'}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#D97706' }}>₹{summary.totalPending?.toLocaleString()}</div>
            <div className="kpi-label">Outstanding / Pending</div>
            <div className="kpi-growth negative">
              {isAdminOrManager ? 'Total to be collected' : 'Your pending receivables'}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#1E40AF' }}>₹{summary.totalInvoiced?.toLocaleString()}</div>
            <div className="kpi-label">Total Invoiced Value</div>
            <div className="kpi-growth positive">{summary.count || payments.length} {isAdminOrManager ? 'Total Receipts' : 'Your Receipts'}</div>
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
            <p>{isAdminOrManager ? 'Log received client amounts and track pending receivables easily.' : 'No payment records found for your account. Record a new payment or create a quotation.'}</p>
            <button className="btn btn-primary btn-sm" onClick={handleOpenNew}>
              <Plus size={14} /> Record Payment
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Client / Company</th>
                {isAdminOrManager && <th>Created By</th>}
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
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {p.client?.name || p.lead?.name || 'Valued Account'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {p.client?.company ? (
                        <span style={{ color: '#016139', fontWeight: 600 }}><Building size={11} /> {p.client.company}</span>
                      ) : p.lead?.company ? (
                        <span><FileText size={11} /> {p.lead.company}</span>
                      ) : 'Client Ledger'}
                      {p.quotation?.quotationNo && (
                        <span style={{ marginLeft: 6, fontSize: 11, background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, color: '#475569', fontWeight: 600 }}>
                          <FileText size={10} /> {p.quotation.quotationNo}
                        </span>
                      )}
                    </div>
                  </td>
                  {isAdminOrManager && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>
                          {p.createdBy?.name || 'Admin'}
                        </span>
                        {p.createdBy?.role && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: p.createdBy.role === 'admin' ? '#E9F8F1' : '#F1F5F9',
                            color: p.createdBy.role === 'admin' ? '#016139' : '#475569',
                            textTransform: 'uppercase'
                          }}>
                            {p.createdBy.role}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
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
                      {/* If Fully Paid: Show PREVIEW button. If Payment Pending: Show UPDATE button */}
                      {p.status === 'paid' || p.pendingAmount === 0 ? (
                        <button
                          className="btn btn-sm"
                          style={{
                            background: '#E9F8F1',
                            color: '#016139',
                            border: '1px solid #A7F3D0',
                            padding: '5px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: 700,
                          }}
                          title="View Paid Receipt"
                          onClick={() => setPreviewReceipt(p)}
                        >
                          <Eye size={13} /> Preview
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                          title="Update Received Payment / Add Installment"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit3 size={13} style={{ color: 'var(--primary)' }} /> Update
                        </button>
                      )}

                      {isAdminOrManager && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#EF4444', padding: '5px 8px' }}
                          title="Delete Receipt"
                          onClick={() => handleDelete(p._id, p.paymentNo)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
                {editPayment ? `Update Payment Ledger — ${editPayment.paymentNo}` : 'Record New Client Payment Entry'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">

                {/* EDIT MODE: Locked Client Profile Summary Card */}
                {editPayment ? (
                  <div style={{
                    background: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    marginBottom: 18,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                          Client Ledger Account
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                          {editPayment.client?.name || 'Client'}
                          {editPayment.client?.company && <span style={{ color: '#016139', marginLeft: 6 }}>({editPayment.client.company})</span>}
                        </div>
                      </div>
                      <span className={`badge badge-${editPayment.status === 'paid' ? 'won' : editPayment.status === 'partial' ? 'quotation' : 'lost'}`}>
                        Current: {editPayment.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0', fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Total Invoiced:</span>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>₹{editPayment.invoiceAmount?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Currently Cleared:</span>
                        <div style={{ fontWeight: 700, color: '#016139' }}>₹{editPayment.receivedAmount?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Pending Balance:</span>
                        <div style={{ fontWeight: 700, color: editPayment.pendingAmount > 0 ? '#DC2626' : '#10B981' }}>
                          ₹{editPayment.pendingAmount?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* NEW ENTRY MODE: Select from Unrecorded Clients */
                  <div className="form-group">
                    <label className="form-label required">Select Client (New Accounts Only)</label>
                    {unrecordedClients.length > 0 ? (
                      <select
                        className="form-select"
                        required
                        value={formData.client}
                        onChange={e => setFormData({ ...formData, client: e.target.value })}
                      >
                        <option value="">-- Choose New Client --</option>
                        {unrecordedClients.map(c => (
                          <option key={c._id} value={c._id}>
                            {c.name} {c.company ? `(${c.company})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{
                        padding: '12px 16px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: 8,
                        color: '#065F46',
                        fontSize: 13,
                        fontWeight: 600,
                      }}>
                        All registered clients already have payment ledgers created!
                        <div style={{ fontSize: 12, fontWeight: 400, color: '#047857', marginTop: 4 }}>
                          To log new installments, update balances, or edit payments, click the <strong>"Update"</strong> button on that client's row in the table below.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EDIT MODE: Toggle between Adding Installment vs Direct Adjustment */}
                {editPayment && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${updateMode === 'installment' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setUpdateMode('installment')}
                    >
                      + Add New Installment Payment
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${updateMode === 'direct' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setUpdateMode('direct')}
                    >
                      Edit Total Amounts Directly
                    </button>
                  </div>
                )}

                {/* Amount Fields based on Mode */}
                {editPayment && updateMode === 'installment' ? (
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label required">New Installment / Received Now (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        placeholder="e.g. 15000"
                        min="1"
                        value={additionalInstallment}
                        onChange={e => setAdditionalInstallment(e.target.value)}
                        style={{ fontSize: 15, fontWeight: 700, color: '#016139' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Total Invoice Amount (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        value={formData.invoiceAmount}
                        onChange={e => setFormData({ ...formData, invoiceAmount: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
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
                )}

                {/* Live balance preview */}
                {computedInvoice > 0 && (
                  <div style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Updated Cleared: <strong>₹{computedReceived.toLocaleString()}</strong></div>
                      <div style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>Calculated Remaining Balance:</div>
                    </div>
                    <span style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: computedPending === 0 ? '#10B981' : '#DC2626'
                    }}>
                      ₹{computedPending.toLocaleString()}
                      {computedPending === 0 && ' (FULLY PAID)'}
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
                      placeholder="e.g. UTR982183921 / Cheque #004"
                      value={formData.reference}
                      onChange={e => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Remarks</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Received 2nd milestone installment via NEFT transfer"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!editPayment && unrecordedClients.length === 0}
                >
                  {editPayment ? 'Update Payment Ledger' : 'Save Payment Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLY PAID RECEIPT PREVIEW MODAL */}
      {previewReceipt && (
        <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="modal" style={{ maxWidth: 640, width: '100%', padding: 0, overflow: 'hidden', borderRadius: 14 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#014D3B', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={20} />
                <h3 style={{ margin: 0, fontSize: 17, color: '#ffffff', fontWeight: 700 }}>
                  Official Payment Receipt: {previewReceipt.paymentNo}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#ffffff', color: '#016139', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
                  onClick={() => setPreviewReceipt(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div style={{ padding: '28px 32px', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #016139', paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#016139', margin: 0 }}>HiveRift Technologies</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Enterprise Software & CRM Solutions</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>PAYMENT RECEIPT</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#016139' }}>{previewReceipt.paymentNo}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className="badge badge-won" style={{ fontWeight: 800, fontSize: 11, padding: '3px 8px' }}>
                      PAID IN FULL
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>RECEIVED FROM (CLIENT):</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{previewReceipt.client?.name || 'Valued Client'}</div>
                {previewReceipt.client?.company && <div style={{ fontSize: 13, color: '#475569', marginTop: 1 }}><Building size={13} /> {previewReceipt.client.company}</div>}
                {previewReceipt.client?.phone && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}><Phone size={12} /> {previewReceipt.client.phone}</div>}
              </div>

              {/* Financial Breakdown Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f1f5f9', fontWeight: 600, fontSize: 13, color: '#334155' }}>
                  <span>Description</span>
                  <span>Amount (INR)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: 14 }}>
                  <span>Total Invoiced Contract Value</span>
                  <span style={{ fontWeight: 600 }}>₹{previewReceipt.invoiceAmount?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: 14, background: '#F0FDF4', color: '#166534' }}>
                  <span style={{ fontWeight: 700 }}>Total Amount Received & Cleared</span>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>₹{previewReceipt.receivedAmount?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: 14, background: '#f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Outstanding Balance Due</span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>₹0 (NIL)</span>
                </div>
              </div>

              {/* Payment Details Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 8, fontSize: 12, color: '#475569', marginBottom: 20 }}>
                <div>
                  <strong>Payment Method:</strong> <span style={{ textTransform: 'uppercase' }}>{previewReceipt.paymentMethod?.replace('_', ' ')}</span>
                </div>
                <div>
                  <strong>Reference / UTR:</strong> <span>{previewReceipt.reference || 'N/A'}</span>
                </div>
                <div>
                  <strong>Receipt Date:</strong> <span>{new Date(previewReceipt.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div>
                  <strong>Receipt Status:</strong> <span style={{ color: '#016139', fontWeight: 700 }}>Cleared & Verified</span>
                </div>
              </div>

              {previewReceipt.notes && (
                <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 16 }}>
                  <strong>Notes:</strong> {previewReceipt.notes}
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
                Thank you for your business! This is a system-generated official payment receipt.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
