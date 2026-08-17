import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { quotationsAPI, leadsAPI, clientsAPI } from '../../api';
import { Plus, Search, FileText, Download, Send, CheckCircle2, Eye, Trash2, Printer, X, Building, Mail, Phone, Calendar, ShieldCheck, UserCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const QUOTATION_STATUSES = ['all', 'draft', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected', 'expired'];

export default function QuotationsPage() {
  const [searchParams] = useSearchParams();
  const leadIdParam = searchParams.get('lead');
  const clientIdParam = searchParams.get('client');

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(!!(leadIdParam || clientIdParam));
  const [previewQuotation, setPreviewQuotation] = useState(null);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);

  const [targetType, setTargetType] = useState(clientIdParam ? 'client' : 'lead'); // 'lead' | 'client'

  // Form State
  const [formData, setFormData] = useState({
    lead: leadIdParam || '',
    client: clientIdParam || '',
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    discount: 0,
    taxPercent: 18,
    notes: '',
    services: [{ name: 'E-commerce Website Development', description: 'React + Node.js Custom Solution', quantity: 1, rate: 40000, amount: 40000 }]
  });

  useEffect(() => {
    fetchQuotations();
    fetchLeadsAndClients();
  }, [statusTab]);

  useEffect(() => {
    if (leadIdParam) {
      setTargetType('lead');
      setFormData(p => ({ ...p, lead: leadIdParam, client: '' }));
      setShowModal(true);
    } else if (clientIdParam) {
      setTargetType('client');
      setFormData(p => ({ ...p, client: clientIdParam, lead: '' }));
      setShowModal(true);
    }
  }, [leadIdParam, clientIdParam]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      const { data } = await quotationsAPI.getAll(params);
      setQuotations(data.data.quotations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadsAndClients = async () => {
    try {
      const [lRes, cRes] = await Promise.all([
        leadsAPI.getAll({ limit: 100 }),
        clientsAPI.getAll({ limit: 100 }),
      ]);
      setLeads(lRes.data.data.leads || []);
      setClients(cRes.data.data.clients || []);
    } catch {}
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...formData.services];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = (Number(updated[index].quantity) || 0) * (Number(updated[index].rate) || 0);
    }
    setFormData({ ...formData, services: updated });
  };

  const addServiceRow = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeServiceRow = (index) => {
    if (formData.services.length === 1) return;
    setFormData({ ...formData, services: formData.services.filter((_, i) => i !== index) });
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (targetType === 'lead') {
        delete payload.client;
        if (!payload.lead) {
          return Swal.fire({ icon: 'warning', title: 'Please select a Lead' });
        }
      } else {
        delete payload.lead;
        if (!payload.client) {
          return Swal.fire({ icon: 'warning', title: 'Please select a Client' });
        }
      }

      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });

      await quotationsAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Quotation Created!', text: 'Quotation generated successfully', timer: 1500, showConfirmButton: false });
      setShowModal(false);
      fetchQuotations();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to create quotation' });
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await quotationsAPI.updateStatus(id, status);
      Swal.fire({
        icon: 'success',
        title: status === 'sent' ? 'Quotation Sent via Email 📧' : `Status set to ${status.toUpperCase()}`,
        text: status === 'sent' ? 'Official proposal email dispatched to client' : '',
        timer: 1500,
        showConfirmButton: false
      });
      fetchQuotations();
      if (previewQuotation && previewQuotation._id === id) {
        setPreviewQuotation(prev => ({ ...prev, status }));
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Status update failed' });
    }
  };

  const handleDelete = async (id, quotationNo) => {
    const res = await Swal.fire({
      title: 'Delete Quotation?',
      text: `Are you sure you want to delete ${quotationNo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await quotationsAPI.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        fetchQuotations();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not delete quotation' });
      }
    }
  };

  const calculateSubtotal = () => formData.services.reduce((s, row) => s + (row.amount || 0), 0);
  const calculateTax = () => ((calculateSubtotal() - (Number(formData.discount) || 0)) * (Number(formData.taxPercent) || 0)) / 100;
  const calculateTotal = () => calculateSubtotal() - (Number(formData.discount) || 0) + calculateTax();

  const filteredQuotations = quotations.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.quotationNo?.toLowerCase().includes(s) ||
      q.lead?.name?.toLowerCase().includes(s) ||
      q.client?.name?.toLowerCase().includes(s) ||
      q.lead?.company?.toLowerCase().includes(s) ||
      q.client?.company?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Quotations</h1>
          <p className="page-subtitle">Create, manage, preview, and track professional client proposals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Generate Quotation
        </button>
      </div>

      {/* Status Tabs */}
      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <div className="status-tabs">
          {QUOTATION_STATUSES.map(s => (
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

      {/* Filters Bar */}
      <div className="filters-bar" style={{ borderRadius: '12px 12px 0 0', border: '1px solid var(--border)' }}>
        <div className="search-box">
          <Search />
          <input
            className="search-input"
            placeholder="Search by quote #, client, lead..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper" style={{ borderRadius: '0 0 12px 12px' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : filteredQuotations.length === 0 ? (
          <div className="empty-state">
            <FileText />
            <h3>No Quotations Found</h3>
            <p>Generate formal price quotations and proposals for your leads or converted clients.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Client / Lead</th>
                <th>Total Value</th>
                <th>Valid Until</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map(q => (
                <tr key={q._id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={16} /> {q.quotationNo}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {q.client ? q.client.name : q.lead ? q.lead.name : 'N/A'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {q.client ? (
                        <span style={{ color: '#016139', fontWeight: 600 }}>🏢 {q.client.company || 'Client Profile'}</span>
                      ) : q.lead ? (
                        <span>🎯 {q.lead.company || 'Lead Inquiry'}</span>
                      ) : '-'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                    ₹{q.totalAmount?.toLocaleString() || 0}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(q.validUntil).toLocaleDateString()}
                  </td>
                  <td>{q.createdBy?.name || 'Sales Staff'}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '3px 8px', fontSize: 12, width: 'auto', fontWeight: 600 }}
                      value={q.status}
                      onChange={e => handleStatusUpdate(q._id, e.target.value)}
                    >
                      {QUOTATION_STATUSES.filter(s => s !== 'all').map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                        onClick={() => setPreviewQuotation(q)}
                        title="Preview & Print Proposal"
                      >
                        <Eye size={13} /> Preview
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)', padding: '4px 6px' }}
                        onClick={() => handleDelete(q._id, q.quotationNo)}
                        title="Delete Quotation"
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

      {/* Preview Modal */}
      {previewQuotation && (
        <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="modal modal-xl" style={{
            maxWidth: 880,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderRadius: 14,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header Actions Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 24px',
              background: '#014D3B',
              color: '#ffffff',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={20} />
                <h3 style={{ margin: 0, fontSize: 17, color: '#ffffff', fontWeight: 700 }}>
                  Quotation Proposal: {previewQuotation.quotationNo}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#ffffff', color: '#016139', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print / PDF
                </button>
                {previewQuotation.status === 'draft' && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#10B981', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => handleStatusUpdate(previewQuotation._id, 'sent')}
                  >
                    <Send size={14} /> Send to Client
                  </button>
                )}
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: 20, padding: '0 4px', lineHeight: 1 }}
                  onClick={() => setPreviewQuotation(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Proposal Document Body with Smooth Scroll */}
            <div style={{
              padding: '28px 36px',
              background: '#ffffff',
              flex: 1,
              overflowY: 'auto',
            }}>
              {/* Proposal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #016139', paddingBottom: 18, marginBottom: 22 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#016139', margin: 0 }}>HiveRift Technologies</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Enterprise Software & IT Solutions</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>support@hiverift.com | +91 (800) 600-0000</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>PROPOSAL / QUOTATION</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#016139', marginTop: 2 }}>{previewQuotation.quotationNo}</div>
                  <div style={{ marginTop: 6 }}>
                    <span className={`badge badge-${previewQuotation.status}`}>
                      {previewQuotation.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill To & Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                    PROPOSAL PREPARED FOR:
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    {previewQuotation.client?.name || previewQuotation.lead?.name || 'Valued Client'}
                  </div>
                  {(previewQuotation.client?.company || previewQuotation.lead?.company) && (
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                      🏢 {previewQuotation.client?.company || previewQuotation.lead?.company}
                    </div>
                  )}
                  {(previewQuotation.client?.email || previewQuotation.lead?.email) && (
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                      ✉️ {previewQuotation.client?.email || previewQuotation.lead?.email}
                    </div>
                  )}
                  {(previewQuotation.client?.phone || previewQuotation.lead?.phone) && (
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                      📞 {previewQuotation.client?.phone || previewQuotation.lead?.phone}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                    <strong>Date Created:</strong> {new Date(previewQuotation.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                    <strong>Valid Until:</strong> <span style={{ color: '#016139', fontWeight: 700 }}>{new Date(previewQuotation.validUntil).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    <strong>Prepared By:</strong> {previewQuotation.createdBy?.name || 'Sales Department'}
                  </div>
                </div>
              </div>

              {/* Service Line Items Table */}
              <div style={{ marginBottom: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '10px 12px', borderRadius: '6px 0 0 0' }}>#</th>
                      <th style={{ padding: '10px 12px' }}>Service / Scope</th>
                      <th style={{ padding: '10px 12px' }}>Description</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Unit Rate</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewQuotation.services?.map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{s.name}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{s.description || '-'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>{s.quantity}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>₹{s.rate?.toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#016139' }}>
                          ₹{s.amount?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Breakdown */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <div style={{ width: 320, background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{previewQuotation.subtotal?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    <span>Discount:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>-₹{previewQuotation.discount?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 10 }}>
                    <span>GST Tax ({previewQuotation.taxPercent}%):</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>+₹{previewQuotation.taxAmount?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#016139',
                    borderTop: '2px solid #cbd5e1',
                    paddingTop: 10
                  }}>
                    <span>Grand Total:</span>
                    <span>₹{previewQuotation.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Footer */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, fontSize: 12, color: '#64748b' }}>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>Terms & Conditions:</div>
                <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                  <li>This proposal is valid until {new Date(previewQuotation.validUntil).toLocaleDateString()}.</li>
                  <li>Standard 50% advance required upon formal acceptance to commence milestone delivery.</li>
                  <li>All deliverables are backed by HiveRift CRM warranty & SLA support.</li>
                </ol>
              </div>
            </div>

            {/* Fixed Modal Bottom Footer */}
            <div className="modal-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 24px', flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewQuotation(null)}>
                Close Preview
              </button>
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-xl">
            <div className="modal-header">
              <h3 className="modal-title">Generate New Quotation</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateQuotation}>
              <div className="modal-body">
                {/* Target Type Selector: Client vs Lead */}
                <div style={{ marginBottom: 16, background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: 8 }}>Quotation Prepared For:</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                      <input
                        type="radio"
                        name="targetType"
                        checked={targetType === 'client'}
                        onChange={() => setTargetType('client')}
                      />
                      🏢 Converted Client ({clients.length} in Portfolio)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                      <input
                        type="radio"
                        name="targetType"
                        checked={targetType === 'lead'}
                        onChange={() => setTargetType('lead')}
                      />
                      🎯 Sales Lead ({leads.length} Active Inquiries)
                    </label>
                  </div>
                </div>

                <div className="grid-2">
                  {targetType === 'client' ? (
                    <div className="form-group">
                      <label className="form-label required">Select Client</label>
                      <select
                        className="form-select"
                        required
                        value={formData.client}
                        onChange={e => setFormData({ ...formData, client: e.target.value, lead: '' })}
                      >
                        <option value="">-- Choose Client --</option>
                        {clients.map(c => (
                          <option key={c._id} value={c._id}>
                            {c.clientId} - {c.name} ({c.company || 'Individual'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label required">Select Lead</label>
                      <select
                        className="form-select"
                        required
                        value={formData.lead}
                        onChange={e => setFormData({ ...formData, lead: e.target.value, client: '' })}
                      >
                        <option value="">-- Choose Lead --</option>
                        {leads.map(l => (
                          <option key={l._id} value={l._id}>
                            {l.leadId} - {l.name} ({l.company || 'Individual'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label required">Valid Until Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.validUntil}
                      onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                {/* Service Items Table */}
                <div style={{ margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="form-label required" style={{ margin: 0 }}>Service Line Items</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addServiceRow}>+ Add Item</button>
                  </div>

                  {formData.services.map((row, idx) => (
                    <div key={idx} className="grid-4" style={{ gridTemplateColumns: '2fr 2fr 1fr 1.5fr 40px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <input
                        className="form-input"
                        placeholder="Service Name"
                        required
                        value={row.name}
                        onChange={e => handleServiceChange(idx, 'name', e.target.value)}
                      />
                      <input
                        className="form-input"
                        placeholder="Description (Optional)"
                        value={row.description}
                        onChange={e => handleServiceChange(idx, 'description', e.target.value)}
                      />
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Qty"
                        required
                        min="1"
                        value={row.quantity}
                        onChange={e => handleServiceChange(idx, 'quantity', e.target.value)}
                      />
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Rate (₹)"
                        required
                        value={row.rate}
                        onChange={e => handleServiceChange(idx, 'rate', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)' }}
                        onClick={() => removeServiceRow(idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Calculation Summary Footer */}
                <div className="grid-3" style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Discount Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.discount}
                      onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">GST Tax (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.taxPercent}
                      onChange={e => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                    />
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Estimated Grand Total</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#016139' }}>
                      ₹{calculateTotal().toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Additional Notes / Proposal Scope</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="E.g., 50% advance upon contract signing..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
