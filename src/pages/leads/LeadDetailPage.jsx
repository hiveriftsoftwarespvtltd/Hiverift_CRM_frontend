import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsAPI, clientsAPI } from '../../api';
import { Phone, Mail, MessageSquare, Calendar, User, FileText, ArrowLeft, Plus, Award } from 'lucide-react';
import Swal from 'sweetalert2';

const LEAD_STATUSES = ['new', 'assigned', 'contacted', 'interested', 'requirement', 'quotation', 'negotiation', 'won', 'lost'];

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // Follow-up Modal
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupData, setFollowupData] = useState({
    date: new Date().toISOString().split('T')[0], type: 'call', notes: '', outcome: '', nextAction: ''
  });

  // Note State
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getOne(id);
      setLead(data.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load lead details' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await leadsAPI.updateStatus(id, newStatus);
      Swal.fire({ icon: 'success', title: 'Status Updated', timer: 1200, showConfirmButton: false });
      fetchLead();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Status update failed' });
    }
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...followupData };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      await leadsAPI.addFollowup(id, payload);
      Swal.fire({ icon: 'success', title: 'Follow-up Scheduled', timer: 1500, showConfirmButton: false });
      setShowFollowupModal(false);
      setFollowupData({ date: new Date().toISOString().split('T')[0], type: 'call', notes: '', outcome: '', nextAction: '' });
      fetchLead();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Failed to schedule follow-up' });
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await leadsAPI.addNote(id, noteText);
      setNoteText('');
      fetchLead();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Note could not be saved' });
    }
  };

  const handleConvertToClient = async () => {
    const res = await Swal.fire({
      title: 'Convert Lead to Client? 🎉',
      text: `Mark deal as WON and create Client profile for "${lead.company || lead.name}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Yes, Convert to Client',
    });

    if (res.isConfirmed) {
      try {
        const clientRes = await clientsAPI.create({
          name: lead.name,
          company: lead.company,
          phone: lead.phone,
          whatsapp: lead.whatsapp,
          email: lead.email,
          city: lead.city,
          leadRef: lead._id,
          assignedSales: lead.assignedTo?._id,
          notes: lead.requirement,
        });

        await leadsAPI.updateStatus(id, 'won');
        const createdClient = clientRes.data.data;

        // Post-Sale Won Guided Wizard
        const wizardRes = await Swal.fire({
          icon: 'success',
          title: '🎉 DEAL WON & CLIENT CREATED!',
          html: `
            <p style="font-size:14px; color:#42524E; margin-bottom:16px">
              Client profile for <strong>${createdClient.name}</strong> is now active.
            </p>
            <div style="display:flex; flex-direction:column; gap:10px">
              <button id="btn-wizard-payment" class="swal2-confirm swal2-styled" style="background:#10B981; margin:0">
                💳 Record Advance Payment
              </button>
              <button id="btn-wizard-project" class="swal2-confirm swal2-styled" style="background:#016139; margin:0">
                📁 Create Project & Assign Tech Team
              </button>
            </div>
          `,
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: 'Go to Client Portfolio',
          didOpen: () => {
            document.getElementById('btn-wizard-payment')?.addEventListener('click', () => {
              Swal.close();
              navigate(`/payments?client=${createdClient._id}`);
            });
            document.getElementById('btn-wizard-project')?.addEventListener('click', () => {
              Swal.close();
              navigate(`/projects?client=${createdClient._id}&lead=${lead._id}`);
            });
          }
        });

        if (wizardRes.isDismissed) {
          navigate(`/clients/${createdClient._id}`);
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Conversion Failed', text: err.response?.data?.message || 'Error converting lead' });
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="loading-spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (!lead) return <div>Lead not found</div>;

  return (
    <div>
      {/* Back button */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Leads
      </button>

      {/* Header card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="avatar avatar-lg" style={{ fontSize: 20 }}>
              {lead.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-heading)' }}>{lead.name}</h1>
                <span className={`badge badge-${lead.status}`}>{lead.status.toUpperCase()}</span>
                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--primary)', fontWeight: 700 }}>
                  {lead.leadId}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                {lead.company || 'Individual Lead'} • Source: <strong>{lead.source}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {lead.status !== 'won' && (
              <button className="btn btn-primary" style={{ background: '#10B981' }} onClick={handleConvertToClient}>
                <Award size={16} /> Mark Won & Convert
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => navigate(`/quotations?lead=${lead._id}`)}>
              <FileText size={16} /> Create Quotation
            </button>
            <button className="btn btn-primary" onClick={() => setShowFollowupModal(true)}>
              <Plus size={16} /> Add Follow-up
            </button>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <a href={`tel:${lead.phone}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            <Phone size={14} color="#2563EB" /> Call: {lead.phone}
          </a>
          {lead.whatsapp && (
            <a href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
              <MessageSquare size={14} color="#10B981" /> WhatsApp
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
              <Mail size={14} color="#8B5CF6" /> Email
            </a>
          )}
        </div>

        {/* Status Lifecycle Change bar */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
            Update Status Lifecycle:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LEAD_STATUSES.map(st => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`btn btn-sm ${lead.status === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, textTransform: 'capitalize' }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left column — Timeline & Requirement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Requirement */}
          <div className="card">
            <h3 className="card-title">Requirement Overview</h3>
            <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6, margin: '8px 0 0' }}>
              {lead.requirement || 'No specific requirement details provided yet.'}
            </p>
          </div>

          {/* Follow-up Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Follow-up History & Timeline</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowFollowupModal(true)}>+ Add</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {lead.followups?.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No follow-ups recorded yet.</p>
              ) : lead.followups.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: i < lead.followups.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>
                        {f.type?.toUpperCase()} Follow-up
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(f.date).toLocaleDateString()}
                      </span>
                    </div>
                    {f.notes && <p style={{ fontSize: 13, color: 'var(--text-body)', margin: '4px 0 0' }}>{f.notes}</p>}
                    {f.outcome && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>Outcome: {f.outcome}</div>}
                    {f.nextAction && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2 }}>Next: {f.nextAction}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>Sales Notes</h3>
            <form onSubmit={handleAddNote} style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
              <input
                className="form-input"
                placeholder="Add a internal note..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">Add Note</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lead.notes?.map((n, i) => (
                <div key={i} style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                  <div style={{ color: 'var(--text-body)' }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Key Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>Lead Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Estimated Deal Value</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{lead.estimatedValue?.toLocaleString() || '0'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Assigned Sales Person</div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                  {lead.assignedTo?.name || 'Unassigned'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>City / Location</div>
                <div style={{ fontWeight: 500 }}>{lead.city || 'Not specified'}</div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Next Follow-up Date</div>
                <div style={{ fontWeight: 600, color: lead.nextFollowup ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {lead.nextFollowup ? new Date(lead.nextFollowup).toLocaleDateString() : 'None Scheduled'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Created Date</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(lead.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Followup Modal */}
      {showFollowupModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Schedule Follow-up</h3>
              <button className="modal-close" onClick={() => setShowFollowupModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddFollowup}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Follow-up Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={followupData.date}
                      onChange={e => setFollowupData({ ...followupData, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Call Type</label>
                    <select
                      className="form-select"
                      value={followupData.type}
                      onChange={e => setFollowupData({ ...followupData, type: e.target.value })}
                    >
                      <option value="call">Call</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Discussion Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Client wants detailed quote by tomorrow..."
                    value={followupData.notes}
                    onChange={e => setFollowupData({ ...followupData, notes: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Outcome</label>
                    <input
                      className="form-input"
                      placeholder="Positive / Interested"
                      value={followupData.outcome}
                      onChange={e => setFollowupData({ ...followupData, outcome: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Action Item</label>
                    <input
                      className="form-input"
                      placeholder="Send Quotation PDF"
                      value={followupData.nextAction}
                      onChange={e => setFollowupData({ ...followupData, nextAction: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFollowupModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Follow-up</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
