import { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Printer, Mail, Edit2, Trash2,
  DollarSign, CheckCircle2, Clock, Eye, Send, X, Building
} from 'lucide-react';
import { invoicesAPI, clientsAPI } from '../../api';
import InvoiceEditorModal from './InvoiceEditorModal';
import InvoicePrintView from './InvoicePrintView';
import Swal from 'sweetalert2';
import PaginationControls from '../../components/common/PaginationControls';

const INVOICE_STATUS_TABS = [
  { id: 'all', label: 'All Invoices' },
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'partially_paid', label: 'Partial' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoicePage, setInvoicePage] = useState(1);

  useEffect(() => {
    setInvoicePage(1);
  }, [search, statusFilter]);

  // Modals
  const [editorOpen, setEditorOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [emailModalInvoice, setEmailModalInvoice] = useState(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailCustomMessage, setEmailCustomMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, statsRes, clientRes] = await Promise.all([
        invoicesAPI.getAll({ search, status: statusFilter, limit: 100 }),
        invoicesAPI.getStats(),
        clientsAPI.getAll({ limit: 200 }),
      ]);
      setInvoices(invRes.data?.data?.invoices || []);
      setStats(statsRes.data?.data || null);
      setClients(clientRes.data?.data?.clients || []);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setInvoiceToEdit(null);
    setEditorOpen(true);
  };

  const handleEdit = (inv) => {
    setInvoiceToEdit(inv);
    setEditorOpen(true);
  };

  const handleDelete = async (inv) => {
    const result = await Swal.fire({
      title: 'Delete Invoice?',
      text: `Are you sure you want to delete Invoice #${inv.invoiceNo}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Delete',
    });

    if (result.isConfirmed) {
      try {
        await invoicesAPI.delete(inv._id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: `Invoice #${inv.invoiceNo} has been deleted.`,
          timer: 1500,
          showConfirmButton: false,
          iconColor: '#016139',
        });
        fetchData();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete invoice', 'error');
      }
    }
  };

  const handleOpenEmailModal = (inv) => {
    setEmailModalInvoice(inv);
    let defaultEmail = inv.client?.email || '';
    if (!defaultEmail) {
      const match = (inv.billTo || '').match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
      if (match && match.length > 0) defaultEmail = match[0];
    }
    setEmailTo(defaultEmail);
    setEmailCustomMessage(`Please find attached Invoice #${inv.invoiceNo} for your reference. Kindly process the payment before the due date.`);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailTo.trim()) {
      Swal.fire('Email Required', 'Please enter a recipient email address', 'warning');
      return;
    }

    setSendingEmail(true);
    try {
      await invoicesAPI.sendEmail(emailModalInvoice._id, {
        email: emailTo.trim(),
        customMessage: emailCustomMessage.trim(),
      });
      Swal.fire({
        icon: 'success',
        title: 'Invoice Sent!',
        text: `Invoice #${emailModalInvoice.invoiceNo} has been emailed to ${emailTo}.`,
        timer: 1800,
        showConfirmButton: false,
        iconColor: '#016139',
      });
      setEmailModalInvoice(null);
      fetchData();
    } catch (err) {
      Swal.fire('Failed', err.response?.data?.message || 'Could not send invoice email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'paid':
        return <span className="badge badge-won">PAID</span>;
      case 'partially_paid':
        return <span className="badge badge-requirement">PARTIAL</span>;
      case 'sent':
        return <span className="badge badge-new">SENT</span>;
      case 'overdue':
        return <span className="badge badge-lost">OVERDUE</span>;
      default:
        return <span className="badge badge-todo">DRAFT</span>;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices Management</h1>
          <p className="page-subtitle">
            Generate, track, print, and email official client invoices with live balance tracking.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleCreateNew}>
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Top KPI Metric Cards (Grid 4 matching HiveRift CRM system) */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#EAF3FF', color: '#2563EB' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="kpi-value">{stats?.totalInvoices || 0}</div>
            <div className="kpi-label">Total Invoices</div>
            <div className="kpi-growth positive">
              {stats?.paidCount || 0} Paid • {stats?.draftCount || 0} Draft
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#EDE9FF', color: '#8B5CF6' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#4F46E5' }}>
              ₹{(stats?.totalInvoiced || 0).toLocaleString()}
            </div>
            <div className="kpi-label">Total Invoiced Value</div>
            <div className="kpi-growth positive">Gross Billing Amount</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#E9F8F1', color: '#10B981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#016139' }}>
              ₹{(stats?.totalPaid || 0).toLocaleString()}
            </div>
            <div className="kpi-label">Total Collected</div>
            <div className="kpi-growth positive">Cleared Receipts</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#FFF7DD', color: '#F59E0B' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: (stats?.totalBalanceDue || 0) > 0 ? '#D97706' : '#016139' }}>
              ₹{(stats?.totalBalanceDue || 0).toLocaleString()}
            </div>
            <div className="kpi-label">Balance Due</div>
            <div className={`kpi-growth ${(stats?.totalBalanceDue || 0) > 0 ? 'negative' : 'positive'}`}>
              {(stats?.totalBalanceDue || 0) > 0 ? 'Outstanding Receivables' : 'All Cleared'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div className="status-tabs">
          {INVOICE_STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`status-tab ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search />
          <input
            className="search-input"
            type="text"
            placeholder="Search by invoice #, bill to, or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Invoices Register Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 20px', color: 'var(--text-muted)' }}>
            <FileText size={44} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 6px 0' }}>
              No Invoices Found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Generate formal tax invoices for your clients and track payment receipts.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleCreateNew}>
              <Plus size={14} /> Create First Invoice
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Bill To / Client</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                    <th>Total Amount (₹)</th>
                    <th>Paid (₹)</th>
                    <th>Balance Due (₹)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices
                    .slice((invoicePage - 1) * 7, invoicePage * 7)
                    .map((inv) => {
                    const curr = inv.currency || '₹';
                    return (
                      <tr key={inv._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--primary)' }}>
                            <FileText size={15} /> #{inv.invoiceNo}
                          </div>
                          {inv.poNumber && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PO: {inv.poNumber}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 13, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {inv.billTo?.split('\n')[0] || 'Unknown Recipient'}
                          </div>
                          {inv.client?.company && (
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Building size={11} /> {inv.client.company}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {inv.date ? new Date(inv.date).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'Due on Receipt'}
                        </td>
                        <td style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>
                          {curr}{Number(inv.total || 0).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600, fontSize: 13, color: '#166534' }}>
                          {curr}{Number(inv.amountPaid || 0).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 800, fontSize: 13, color: (inv.balanceDue || 0) > 0 ? '#D97706' : '#016139' }}>
                          {curr}{Number(inv.balanceDue || 0).toLocaleString()}
                        </td>
                        <td>{getStatusBadge(inv.status)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => setPrintInvoice(inv)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px' }}
                              title="Print / Save PDF"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEmailModal(inv)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', color: '#2563EB' }}
                              title="Email Invoice to Client"
                            >
                              <Mail size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(inv)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px' }}
                              title="Edit Invoice"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(inv)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', color: '#EF4444' }}
                              title="Delete Invoice"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={invoicePage}
              totalPages={Math.ceil(invoices.length / 7) || 1}
              totalItems={invoices.length}
              itemsPerPage={7}
              onPageChange={setInvoicePage}
            />
          </>
        )}
      </div>

      {/* Interactive Invoice Editor Modal */}
      {editorOpen && (
        <InvoiceEditorModal
          isOpen={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setInvoiceToEdit(null);
          }}
          invoiceToEdit={invoiceToEdit}
          onSaved={() => fetchData()}
          clients={clients}
        />
      )}

      {/* Printable Invoice View */}
      {printInvoice && (
        <InvoicePrintView
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}

      {/* Quick Email Dispatch Modal */}
      {emailModalInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && setEmailModalInvoice(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#ffffff',
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              animation: 'slideUp 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EAF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Send size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>
                  Email Invoice #{emailModalInvoice.invoiceNo}
                </h3>
              </div>
              <button
                onClick={() => setEmailModalInvoice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendEmail}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">
                  Recipient Email Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="client@company.com"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">
                  Custom Message (optional)
                </label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  value={emailCustomMessage}
                  onChange={(e) => setEmailCustomMessage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEmailModalInvoice(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="btn btn-primary"
                >
                  {sendingEmail ? (
                    <>
                      <div className="loading-spinner" style={{ width: 14, height: 14 }} /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Send Invoice Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
