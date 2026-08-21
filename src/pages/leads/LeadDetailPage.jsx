import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsAPI, clientsAPI, usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Phone, Mail, MessageSquare, Calendar, User, FileText, ArrowLeft, Plus, Award, Edit3, MapPin, Building, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

const LEAD_STATUSES = ['new', 'assigned', 'contacted', 'interested', 'requirement', 'quotation', 'negotiation', 'won', 'lost'];
const LEAD_SOURCES = ['facebook', 'google', 'website', 'referral', 'calling', 'whatsapp', 'other'];

const normalizeMeetingMode = (mode) => {
  if (!mode) return 'online';
  const m = String(mode).toLowerCase().trim();
  if (m.includes('call') || m.includes('phone')) return 'call';
  if (m.includes('offline')) return 'offline';
  return 'online';
};

const extractMeetingMode = (lead) => {
  const req = lead?.requirement || '';
  if (req.includes('[MODE:offline]')) return 'offline';
  if (req.includes('[MODE:call]')) return 'call';
  if (req.includes('[MODE:online]')) return 'online';
  return normalizeMeetingMode(lead?.meetingMode || lead?.meeting_mode || lead?.meetingType);
};

const cleanRequirementText = (req) => {
  if (!req) return '';
  return req.replace(/\[MODE:(online|offline|call)\]/gi, '').trim();
};

const formatRequirementWithMode = (reqText, mode) => {
  const clean = cleanRequirementText(reqText);
  const tag = `[MODE:${mode || 'online'}]`;
  return clean ? `${clean}\n${tag}` : tag;
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'management';

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Follow-up Modal
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupData, setFollowupData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'call',
    notes: '',
    outcome: '',
    nextAction: ''
  });

  // Notes
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchLead();
    fetchSalesUsers();
  }, [id]);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getOne(id);
      setLead(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesUsers = async () => {
    try {
      const { data } = await usersAPI.getAll({ limit: 100 });
      setSalesUsers(data.data.users || []);
    } catch { }
  };

  const handleOpenEdit = () => {
    if (!lead) return;
    const mode = extractMeetingMode(lead);
    const cleanReq = cleanRequirementText(lead.requirement);
    setEditFormData({
      name: lead.name || '',
      company: lead.company || '',
      phone: lead.phone || '',
      whatsapp: lead.whatsapp || '',
      email: lead.email || '',
      city: lead.city || '',
      requirement: cleanReq,
      source: lead.source || 'website',
      meetingMode: mode,
      estimatedValue: lead.estimatedValue || '',
      assignedTo: lead.assignedTo?._id || lead.assignedTo || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editFormData };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });
      if (editFormData.estimatedValue) payload.estimatedValue = Number(editFormData.estimatedValue);
      const chosenMode = editFormData.meetingMode || 'online';
      payload.meetingMode = chosenMode;
      payload.requirement = formatRequirementWithMode(editFormData.requirement, chosenMode);

      const res = await leadsAPI.update(id, payload);
      const updated = res.data?.data || res.data;
      if (updated) {
        setLead(prev => ({ ...prev, ...payload, ...updated }));
      }
      Swal.fire({ icon: 'success', title: 'Lead Updated!', text: 'Contact details updated successfully', timer: 1500, showConfirmButton: false });
      setShowEditModal(false);
      await fetchLead();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err.response?.data?.message || 'Could not update lead' });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await leadsAPI.updateStatus(id, newStatus);
      if (newStatus === 'won') {
        Swal.fire({
          icon: 'success',
          title: 'Deal Won! Client Created!',
          text: `Lead marked as WON and converted into an Active Client in Client Directory automatically.`,
          timer: 2500,
          showConfirmButton: true
        });
      } else {
        Swal.fire({ icon: 'success', title: 'Status Updated', timer: 1200, showConfirmButton: false });
      }
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
      Swal.fire({ icon: 'success', title: 'Note Added', timer: 1200, showConfirmButton: false });
      fetchLead();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not add note' });
    }
  };

  const handleMarkWonAndConvert = async () => {
    const res = await Swal.fire({
      title: 'Convert Lead to Active Client?',
      text: `Are you sure you want to mark "${lead.name}" as WON? This will automatically create an active client record.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Yes, Convert to Client',
    });
    if (res.isConfirmed) {
      try {
        await leadsAPI.updateStatus(id, 'won');
        Swal.fire({
          icon: 'success',
          title: 'Deal Won & Client Created!',
          text: 'Lead successfully converted to an Active Client.',
          timer: 2000,
          showConfirmButton: false
        });
        fetchLead();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Conversion Failed', text: err.response?.data?.message || 'Could not convert lead' });
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <h3>Lead Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>The lead you are looking for does not exist or has been removed.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/leads')}>Back to Leads</button>
      </div>
    );
  }

  const currentMeetingMode = extractMeetingMode(lead);

  return (
    <div>
      {/* Top Navigation */}
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/leads')} style={{ paddingLeft: 0, gap: 4 }}>
          <ArrowLeft size={16} /> Back to Sales Leads
        </button>
      </div>

      {/* Header Info Banner */}
      <div className="card" style={{ marginBottom: 20 }}>
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
                {currentMeetingMode === 'offline' ? (
                  <span className="badge" style={{ background: '#faf5ff', color: '#7e22ce', border: '1px solid #f3e8ff', fontWeight: 600, fontSize: 11 }}>
                    Offline Meeting
                  </span>
                ) : currentMeetingMode === 'call' ? (
                  <span className="badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 600, fontSize: 11 }}>
                    Phone Call
                  </span>
                ) : (
                  <span className="badge" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #e0f2fe', fontWeight: 600, fontSize: 11 }}>
                    Online Meeting
                  </span>
                )}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                {lead.company || 'Individual Lead'} • Source: <strong>{lead.source}</strong> {lead.city ? `• City: ${lead.city}` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Edit Lead Button */}
            <button className="btn btn-secondary" onClick={handleOpenEdit}>
              <Edit3 size={15} style={{ color: 'var(--primary)' }} /> Edit Lead
            </button>
            {lead.status !== 'won' && (
              <button className="btn btn-primary" style={{ background: '#10B981' }} onClick={handleMarkWonAndConvert}>
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
              <MessageSquare size={14} color="#10B981" /> WhatsApp: {lead.whatsapp}
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
              <Mail size={14} color="#8B5CF6" /> Email: {lead.email}
            </a>
          )}
        </div>

        {/* Status Lifecycle Change bar */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
            Update Status Lifecycle:
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {LEAD_STATUSES.map(s => (
              <button
                key={s}
                className={`btn btn-sm ${lead.status === s ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 11, padding: '4px 10px', textTransform: 'uppercase' }}
                onClick={() => handleStatusChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Details + Timeline & Notes */}
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
        {/* Left Column: Lead Info Profile */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Lead Profile & Requirements</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Contact Name</div>
              <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 15 }}>{lead.name}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Company</div>
              <div style={{ fontWeight: 500 }}>{lead.company || '-'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Phone & WhatsApp</div>
              <div style={{ fontWeight: 600, color: '#016139' }}>{lead.phone}</div>
              {lead.whatsapp && lead.whatsapp !== lead.phone && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>WA: {lead.whatsapp}</div>
              )}
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Email</div>
              <div style={{ fontWeight: 500 }}>{lead.email || '-'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>City / Location</div>
              <div style={{ fontWeight: 500 }}>{lead.city || '-'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Estimated Value</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
                ₹{lead.estimatedValue?.toLocaleString() || 0}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Assigned Sales Representative</div>
              <div style={{ fontWeight: 600 }}>{lead.assignedTo?.name || 'Unassigned'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Detailed Requirements</div>
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                marginTop: 4,
                lineHeight: 1.5,
                color: 'var(--text-heading)'
              }}>
                {cleanRequirementText(lead.requirement) || 'No detailed requirements provided yet.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Follow-ups & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Notes Section */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>Internal Collaboration Notes</h3>
            <form onSubmit={handleAddNote} style={{ marginBottom: 16 }}>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Add a quick note or update about this lead..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Add Note</button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lead.notes && lead.notes.length > 0 ? (
                lead.notes.map((note, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                    <div style={{ color: 'var(--text-heading)', whiteSpace: 'pre-wrap' }}>{note.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      By <strong>{note.createdBy?.name || 'Staff'}</strong> • {new Date(note.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 12 }}>No notes added yet.</div>
              )}
            </div>
          </div>

          {/* Follow-up Timeline */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="card-title" style={{ margin: 0 }}>Follow-up Activity Timeline</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowFollowupModal(true)}>
                <Plus size={14} /> Schedule Follow-up
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lead.followups && lead.followups.length > 0 ? (
                lead.followups.map((f, idx) => (
                  <div key={idx} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 12, paddingBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span>
                        <strong>{f.type?.toUpperCase()}</strong>
                        {f.createdBy?.name && <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>(by {f.createdBy.name})</span>}
                        {' '}• {new Date(f.date).toLocaleDateString()}
                      </span>
                      <span className={`badge badge-${f.status}`}>{f.status}</span>
                    </div>
                    {f.notes && <div style={{ fontSize: 13, marginTop: 4, color: 'var(--text-heading)' }}>{f.notes}</div>}
                    {f.nextAction && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2 }}>Next Action: {f.nextAction}</div>}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 12 }}>No follow-ups logged yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Edit Lead Details ({lead.leadId})</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Contact Name</label>
                    <input
                      className="form-input"
                      required
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      className="form-input"
                      value={editFormData.company}
                      onChange={e => setEditFormData({ ...editFormData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Phone Number</label>
                    <input
                      className="form-input"
                      required
                      value={editFormData.phone}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      className="form-input"
                      value={editFormData.whatsapp}
                      onChange={e => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City / Location</label>
                    <input
                      className="form-input"
                      value={editFormData.city}
                      onChange={e => setEditFormData({ ...editFormData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Requirement Details</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={editFormData.requirement}
                    onChange={e => setEditFormData({ ...editFormData, requirement: e.target.value })}
                  />
                </div>

                {/* Meeting Type / Mode Selection */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label required" style={{ fontWeight: 700 }}>Meeting Type / Mode</label>
                  {(() => {
                    const currentMode = normalizeMeetingMode(editFormData.meetingMode);
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, meetingMode: 'online' })}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: currentMode === 'online' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                            background: currentMode === 'online' ? '#f0f9ff' : '#ffffff',
                            color: currentMode === 'online' ? '#0369a1' : '#475569',
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          Online Meeting
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, meetingMode: 'offline' })}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: currentMode === 'offline' ? '1.5px solid #7e22ce' : '1px solid #cbd5e1',
                            background: currentMode === 'offline' ? '#faf5ff' : '#ffffff',
                            color: currentMode === 'offline' ? '#7e22ce' : '#475569',
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          Offline Meeting
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, meetingMode: 'call' })}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: currentMode === 'call' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                            background: currentMode === 'call' ? '#ecfdf5' : '#ffffff',
                            color: currentMode === 'call' ? '#047857' : '#475569',
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          Phone Call
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Lead Source</label>
                    <select
                      className="form-select"
                      value={editFormData.source}
                      onChange={e => setEditFormData({ ...editFormData, source: e.target.value })}
                    >
                      {LEAD_SOURCES.map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Value (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editFormData.estimatedValue}
                      onChange={e => setEditFormData({ ...editFormData, estimatedValue: e.target.value })}
                    />
                  </div>

                  {isAdminOrManager ? (
                    <div className="form-group">
                      <label className="form-label">Assign Sales Rep</label>
                      <select
                        className="form-select"
                        value={editFormData.assignedTo}
                        onChange={e => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
                      >
                        <option value="">Select Executive</option>
                        {salesUsers.map(u => (
                          <option key={u._id} value={u._id}>{u.name} ({u.role?.toUpperCase()})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Assigned Executive</label>
                      <input
                        className="form-input"
                        disabled
                        value={`${lead?.assignedTo?.name || user?.name || 'You'} (${lead?.assignedTo?.role?.toUpperCase() || 'Sales'})`}
                        style={{ background: '#f8fafc', color: '#016139', fontWeight: 700, borderColor: '#a7f3d0' }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {showFollowupModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Schedule Follow-up for {lead.name}</h3>
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
                    <label className="form-label">Interaction Type</label>
                    <select
                      className="form-select"
                      value={followupData.type}
                      onChange={e => setFollowupData({ ...followupData, type: e.target.value })}
                    >
                      <option value="call">Phone Call</option>
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
