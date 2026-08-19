import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { quotationsAPI, leadsAPI, clientsAPI } from '../../api';
import { Plus, Search, FileText, Send, Eye, Edit3, Trash2, Building } from 'lucide-react';
import Swal from 'sweetalert2';
import ProposalCanvasModal from './ProposalCanvasModal';

const QUOTATION_STATUSES = ['all', 'draft', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected', 'expired'];

export default function QuotationsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const leadIdParam = searchParams.get('lead');
  const clientIdParam = searchParams.get('client');

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);

  // Proposal Canvas Modal State
  const [canvasModalOpen, setCanvasModalOpen] = useState(!!(leadIdParam || clientIdParam));
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [isModalEditing, setIsModalEditing] = useState(!!(leadIdParam || clientIdParam));

  useEffect(() => {
    fetchQuotations();
    fetchLeadsAndClients();
  }, [statusTab]);

  useEffect(() => {
    if (leadIdParam || clientIdParam) {
      setActiveQuotation(null);
      setIsModalEditing(true);
      setCanvasModalOpen(true);
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

  const getQuotationTemplateType = (q) => {
    if (q?.templateType === 'social_media') return 'social_media';
    if (q?.templateType === 'sales_standard') return 'sales_standard';
    const text = (q?.services || []).map(s => (s.name || '') + ' ' + (s.description || '')).join(' ').toLowerCase();
    if (text.includes('social') || text.includes('meta') || text.includes('reel') || text.includes('instagram') || text.includes('post') || text.includes('facebook')) {
      return 'social_media';
    }
    return 'sales_standard';
  };

  const handleOpenNew = () => {
    setActiveQuotation(null);
    setIsModalEditing(true);
    setCanvasModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setActiveQuotation(q);
    setIsModalEditing(true);
    setCanvasModalOpen(true);
  };

  const handleOpenPreview = (q) => {
    setActiveQuotation(q);
    setIsModalEditing(false);
    setCanvasModalOpen(true);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await quotationsAPI.updateStatus(id, status);
      Swal.fire({
        icon: 'success',
        title: `Status set to ${status.toUpperCase()}`,
        timer: 1200,
        showConfirmButton: false,
        iconColor: '#016139',
      });
      fetchQuotations();
      if (activeQuotation && activeQuotation._id === id) {
        setActiveQuotation(prev => ({ ...prev, status }));
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
      iconColor: '#EF4444',
    });
    if (res.isConfirmed) {
      try {
        await quotationsAPI.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false, iconColor: '#016139' });
        fetchQuotations();
        if (activeQuotation && activeQuotation._id === id) {
          setCanvasModalOpen(false);
          setActiveQuotation(null);
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not delete quotation' });
      }
    }
  };

  const handleSendEmail = async (id, quotationNo, recipientEmail) => {
    const res = await Swal.fire({
      title: 'Email Official Quotation?',
      html: `
        <div style="text-align: left; font-size: 14px; color: #334155;">
          <p><strong>Quotation:</strong> ${quotationNo || 'Proposal'}</p>
          <p><strong>Recipient:</strong> <span style="color:#016139; font-weight:700;">${recipientEmail || 'Lead / Client Email'}</span></p>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">An official proposal with itemized services, pricing breakdown, bank details and terms will be dispatched to their inbox.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#016139',
      confirmButtonText: 'Yes, Send Email Now',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
    });

    if (res.isConfirmed) {
      Swal.fire({
        title: 'Dispatching Email...',
        text: 'Connecting to mail server and sending proposal...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const response = await quotationsAPI.sendEmail(id);
        Swal.fire({
          icon: 'success',
          title: 'Quotation Emailed!',
          text: response.data?.message || `Proposal successfully dispatched to ${recipientEmail}`,
          confirmButtonColor: '#016139',
          timer: 2000,
          showConfirmButton: true,
        });
        fetchQuotations();
        setCanvasModalOpen(false);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Email Dispatch Failed',
          text: err.response?.data?.message || 'Could not send quotation email. Please verify lead/client email address.',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  const filteredQuotations = quotations.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.quotationNo?.toLowerCase().includes(s) ||
      q.lead?.name?.toLowerCase().includes(s) ||
      q.client?.name?.toLowerCase().includes(s) ||
      q.lead?.company?.toLowerCase().includes(s) ||
      q.client?.company?.toLowerCase().includes(s) ||
      q.createdBy?.name?.toLowerCase().includes(s)
    );
  });

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'management';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Quotations & Proposals</h1>
          <p className="page-subtitle">
            {isAdminOrManager
              ? 'Generate, review, and track quotations created across all sales teams'
              : 'Generate, edit, email, and track your commercial client proposals'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenNew}>
          <Plus size={16} /> Generate New Quotation
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
          <Search size={15} />
          <input
            className="search-input"
            placeholder="Search by quote #, client, lead company, creator..."
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
            <FileText size={36} />
            <h3>No Quotations Found</h3>
            <p>Generate formal commercial proposals for leads and client accounts.</p>
            <button className="btn btn-primary btn-sm" onClick={handleOpenNew}>
              <Plus size={14} /> Generate Quotation
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Client / Lead</th>
                {isAdminOrManager && <th>Created By</th>}
                <th>Format Template</th>
                <th>Total Proposal (₹)</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map(q => (
                <tr key={q._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--primary)' }}>
                      <FileText size={15} /> {q.quotationNo}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {q.client ? q.client.name : q.lead ? q.lead.name : 'N/A'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {q.client ? (
                        <span style={{ color: '#016139', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Building size={11} /> {q.client.company || 'Client Profile'}
                        </span>
                      ) : q.lead ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <FileText size={11} /> {q.lead.company || 'Lead Inquiry'}
                        </span>
                      ) : '-'}
                    </div>
                  </td>
                  {isAdminOrManager && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>
                          {q.createdBy?.name || 'Admin'}
                        </span>
                        {q.createdBy?.role && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: q.createdBy.role === 'admin' ? '#E9F8F1' : '#F1F5F9',
                            color: q.createdBy.role === 'admin' ? '#016139' : '#475569',
                            textTransform: 'uppercase'
                          }}>
                            {q.createdBy.role}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  <td>
                    {(() => {
                      const tplType = getQuotationTemplateType(q);
                      return (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: tplType === 'social_media' ? '#EFF6FF' : '#F0FDF4',
                          color: tplType === 'social_media' ? '#1D4ED8' : '#15803D',
                          border: `1px solid ${tplType === 'social_media' ? '#BFDBFE' : '#BBF7D0'}`
                        }}>
                          {tplType === 'social_media' ? 'Social Media & Ads' : 'IT Software'}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 14 }}>
                    ₹{q.totalAmount?.toLocaleString() || 0}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(q.validUntil).toLocaleDateString()}
                  </td>
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
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {/* Email Action */}
                      <button
                        className="btn btn-sm"
                        style={{ background: '#016139', color: '#ffffff', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                        onClick={() => handleSendEmail(q._id, q.quotationNo, q.client?.email || q.lead?.email)}
                        title="Send Proposal via Email"
                      >
                        <Send size={12} /> Email
                      </button>

                      {/* Preview Action */}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                        onClick={() => handleOpenPreview(q)}
                        title="View Full Proposal Document"
                      >
                        <Eye size={13} /> Preview
                      </button>

                      {/* Edit Action */}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                        onClick={() => handleOpenEdit(q)}
                        title="Edit Quotation in Document Canvas"
                      >
                        <Edit3 size={13} style={{ color: 'var(--primary)' }} /> Edit
                      </button>

                      {/* Delete Action */}
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)', padding: '4px 6px' }}
                        onClick={() => handleDelete(q._id, q.quotationNo)}
                        title="Delete Quotation"
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

      {/* UNIFIED PROPOSAL CANVAS MODAL (WYSIWYG DOCUMENT EDIT & PREVIEW) */}
      <ProposalCanvasModal
        isOpen={canvasModalOpen}
        onClose={() => {
          setCanvasModalOpen(false);
          setActiveQuotation(null);
        }}
        quotation={activeQuotation}
        initialIsEditing={isModalEditing}
        leads={leads}
        clients={clients}
        onSaved={(savedDoc) => {
          fetchQuotations();
          if (savedDoc) setActiveQuotation(savedDoc);
        }}
        onSendEmail={(id, quotationNo, recipientEmail) => {
          handleSendEmail(id, quotationNo, recipientEmail);
        }}
      />
    </div>
  );
}
