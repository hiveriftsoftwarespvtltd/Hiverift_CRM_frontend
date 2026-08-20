import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { quotationsAPI, leadsAPI, clientsAPI } from '../../api';
import { Plus, Search, FileText, Send, Eye, Edit3, Trash2, Building, CheckCircle, XCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import ProposalCanvasModal from './ProposalCanvasModal';

const QUOTATION_STATUSES = ['all', 'pending_approval', 'approved', 'rejected_approval', 'draft', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected', 'expired'];

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
    if (q?.templateType) return q.templateType;
    const text = (q?.services || []).map(s => (s.name || '') + ' ' + (s.description || '')).join(' ').toLowerCase();
    if (text.includes('social') || text.includes('meta') || text.includes('reel') || text.includes('instagram') || text.includes('post') || text.includes('facebook') || text.includes('ad')) {
      return 'social_media';
    }
    return 'custom_web_app';
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

  const handleApprove = async (id) => {
    try {
      await quotationsAPI.approve(id);
      Swal.fire({
        icon: 'success',
        title: 'Quotation Approved!',
        text: 'Proposal has been approved by SuperAdmin and is ready to email to the client.',
        confirmButtonColor: '#016139',
        timer: 2000,
      });
      fetchQuotations();
      if (activeQuotation && activeQuotation._id === id) {
        setActiveQuotation(prev => ({ ...prev, status: 'approved' }));
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Approval Failed', text: err.response?.data?.message || 'Could not approve quotation' });
    }
  };

  const handleReject = async (id) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Quotation Proposal?',
      input: 'text',
      inputLabel: 'Reason for rejection (sent to sales employee):',
      inputPlaceholder: 'e.g., Update pricing, add 18% GST, revise deliverables...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Reject Proposal',
    });

    if (reason !== undefined) {
      try {
        await quotationsAPI.reject(id, reason);
        Swal.fire({
          icon: 'info',
          title: 'Quotation Rejected',
          text: 'Sales employee notified to update quotation.',
          confirmButtonColor: '#016139',
          timer: 2000,
        });
        fetchQuotations();
        if (activeQuotation && activeQuotation._id === id) {
          setActiveQuotation(prev => ({ ...prev, status: 'rejected_approval', rejectionReason: reason }));
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Could not reject quotation' });
      }
    }
  };

  const handleRequestApproval = async (id) => {
    try {
      await quotationsAPI.requestApproval(id);
      Swal.fire({
        icon: 'success',
        title: 'Approval Requested!',
        text: 'Quotation submitted to SuperAdmin for verification.',
        confirmButtonColor: '#016139',
        timer: 2000,
      });
      fetchQuotations();
      if (activeQuotation && activeQuotation._id === id) {
        setActiveQuotation(prev => ({ ...prev, status: 'pending_approval' }));
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Could not request approval' });
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

  const handleSendEmail = async (q) => {
    const isSales = user?.role === 'sales';
    if (isSales && q.status !== 'approved' && q.status !== 'sent' && q.status !== 'viewed' && q.status !== 'accepted') {
      if (q.status === 'pending_approval') {
        return Swal.fire({
          icon: 'warning',
          title: 'Approval Pending',
          text: 'This quotation is currently PENDING SuperAdmin approval. You cannot send it to the client until SuperAdmin approves it.',
          confirmButtonColor: '#016139'
        });
      } else if (q.status === 'rejected_approval') {
        return Swal.fire({
          icon: 'error',
          title: 'Approval Rejected',
          text: `SuperAdmin rejected this quotation: "${q.rejectionReason || 'Requires revision'}". Please edit and request approval again.`,
          confirmButtonColor: '#016139'
        });
      } else {
        const reqRes = await Swal.fire({
          icon: 'question',
          title: 'SuperAdmin Approval Required',
          text: 'This quotation must be approved by SuperAdmin before emailing to client. Submit for approval now?',
          showCancelButton: true,
          confirmButtonColor: '#016139',
          confirmButtonText: 'Submit for Approval'
        });
        if (reqRes.isConfirmed) {
          handleRequestApproval(q._id);
        }
        return;
      }
    }

    const recipientEmail = q.client?.email || q.lead?.email;
    const res = await Swal.fire({
      title: 'Email Official Quotation?',
      html: `
        <div style="text-align: left; font-size: 14px; color: #334155;">
          <p><strong>Quotation:</strong> ${q.quotationNo || 'Proposal'}</p>
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
        const response = await quotationsAPI.sendEmail(q._id);
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
          text: err.response?.data?.message || 'Could not connect to SMTP server',
          confirmButtonColor: '#016139',
        });
      }
    }
  };

  const filteredQuotations = quotations.filter(q => {
    if (!search) return true;
    const term = search.toLowerCase();
    const targetName = (q.client?.name || q.lead?.name || '').toLowerCase();
    const targetComp = (q.client?.company || q.lead?.company || '').toLowerCase();
    const creatorName = (q.createdBy?.name || '').toLowerCase();
    const qNo = (q.quotationNo || '').toLowerCase();
    return qNo.includes(term) || targetName.includes(term) || targetComp.includes(term) || creatorName.includes(term);
  });

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'management';

  const renderStatusBadge = (status, rejectionReason) => {
    switch (status) {
      case 'pending_approval':
        return (
          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> PENDING APPROVAL
          </span>
        );
      case 'approved':
        return (
          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={11} /> APPROVED
          </span>
        );
      case 'rejected_approval':
        return (
          <span title={rejectionReason ? `Reason: ${rejectionReason}` : ''} style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
            <XCircle size={11} /> REJECTED
          </span>
        );
      case 'sent':
        return <span className="status-pill status-active">SENT</span>;
      case 'viewed':
        return <span className="status-pill status-contacted">VIEWED</span>;
      case 'accepted':
        return <span className="status-pill status-won">ACCEPTED</span>;
      case 'rejected':
        return <span className="status-pill status-lost">REJECTED</span>;
      default:
        return <span className="status-pill status-new">{status?.toUpperCase() || 'DRAFT'}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Quotations & Proposals</h1>
          <p className="page-subtitle">
            {isAdminOrManager
              ? 'Review, approve, and track commercial proposals created by sales representatives'
              : 'Generate proposals, request SuperAdmin approval, and track client dispatches'}
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
              {s.replace('_', ' ').toUpperCase()}
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
                <th>Quotation #</th>
                <th>Target Lead / Client</th>
                {isAdminOrManager && <th>Created By</th>}
                <th>Domain Category</th>
                <th>Total Value</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map(q => (
                <tr key={q._id}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13.5 }}>
                      {q.quotationNo}
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong style={{ color: 'var(--text-heading)', fontSize: 13.5 }}>
                        {q.customClientHeading || q.client?.company || q.lead?.company || q.client?.name || q.lead?.name || 'Valued Prospect'}
                      </strong>
                      {(q.client?.email || q.lead?.email) && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {q.client?.email || q.lead?.email}
                        </div>
                      )}
                    </div>
                  </td>
                  {isAdminOrManager && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>
                          {q.createdBy?.name || 'Admin'}
                        </span>
                      </div>
                    </td>
                  )}
                  <td>
                    {(() => {
                      const tplType = getQuotationTemplateType(q);
                      const isAds = /social|meta|ads|seo|google/i.test(tplType);
                      return (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: isAds ? '#EFF6FF' : '#F0FDF4',
                          color: isAds ? '#1D4ED8' : '#15803D',
                          border: `1px solid ${isAds ? '#BFDBFE' : '#BBF7D0'}`
                        }}>
                          {isAds ? '📣 Social Media & Ads' : '🌐 Web & Software'}
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
                    {renderStatusBadge(q.status, q.rejectionReason)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'flex-end' }}>
                      {/* SuperAdmin Approval Buttons for Pending Quotations */}
                      {isAdminOrManager && q.status === 'pending_approval' && (
                        <>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#10B981', color: '#ffffff', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 11 }}
                            onClick={() => handleApprove(q._id)}
                            title="Approve Quotation"
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#EF4444', color: '#ffffff', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 11 }}
                            onClick={() => handleReject(q._id)}
                            title="Reject Quotation"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </>
                      )}

                      {/* Sales Employee Request Approval Button */}
                      {!isAdminOrManager && (q.status === 'draft' || q.status === 'rejected_approval') && (
                        <button
                          className="btn btn-sm"
                          style={{ background: '#F59E0B', color: '#ffffff', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 11 }}
                          onClick={() => handleRequestApproval(q._id)}
                          title="Submit to SuperAdmin for Approval"
                        >
                          <Clock size={12} /> Request Approval
                        </button>
                      )}

                      {/* Email Action */}
                      <button
                        className="btn btn-sm"
                        style={{
                          background: q.status === 'approved' || q.status === 'sent' || isAdminOrManager ? '#016139' : '#94a3b8',
                          color: '#ffffff',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 600,
                          cursor: !isAdminOrManager && q.status === 'pending_approval' ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => handleSendEmail(q)}
                        title={q.status === 'pending_approval' && !isAdminOrManager ? 'Pending SuperAdmin Approval' : 'Send Proposal via Email'}
                      >
                        <Send size={12} /> Email
                      </button>

                      {/* Preview / Download Action */}
                      <button
                        className="btn btn-sm"
                        style={{ background: '#0284C7', color: '#ffffff', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                        onClick={() => handleOpenPreview(q)}
                        title="Download / View Proposal Document"
                      >
                        <FileText size={13} /> Download / View
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
                      {isAdminOrManager && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--red)', padding: '4px 6px' }}
                          onClick={() => handleDelete(q._id, q.quotationNo)}
                          title="Delete Quotation"
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
