import { useState, useEffect } from 'react';
import { callingAPI, usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  PhoneCall,
  Upload,
  UserCheck,
  Clock,
  CheckCircle2,
  Phone,
  Search,
  Users,
  Layers,
  ArrowLeftRight,
  Plus,
  Trash2,
  X,
  Award,
} from 'lucide-react';

const SUB_FILTERS = [
  { key: 'all', label: 'ALL NUMBERS' },
  { key: 'pending', label: 'PENDING (FRESH)' },
  { key: 'callback', label: 'CALLBACKS / FOLLOW-UPS' },
  { key: 'interested', label: 'INTERESTED (HOT)' },
  { key: 'ringing_no_answer', label: 'RINGING / NO ANSWER' },
  { key: 'not_interested', label: 'NOT INTERESTED' },
];

export default function CallingPage() {
  const { user } = useAuth();
  const isManagerOrAdmin = ['admin', 'management'].includes(user?.role);

  // Main Tabs: 'workspace' | 'team_tracker' | 'batches'
  const [mainTab, setMainTab] = useState('workspace');
  const [subFilter, setSubFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, callback: 0, interested: 0, not_interested: 0 });
  const [batches, setBatches] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [activeContact, setActiveContact] = useState(null);

  // Log Call form
  const [logStatus, setLogStatus] = useState('interested');
  const [logRemark, setLogRemark] = useState('');
  const [logCallbackTime, setLogCallbackTime] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  // Upload Batch form
  const [batchTitle, setBatchTitle] = useState('');
  const [rawNumbers, setRawNumbers] = useState('');
  const [selectedExecutives, setSelectedExecutives] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Re-assign form
  const [reassignBatchId, setReassignBatchId] = useState('');
  const [reassignTargetUsers, setReassignTargetUsers] = useState([]);
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (mainTab === 'workspace') {
      fetchMyQueue();
    } else if (mainTab === 'team_tracker') {
      fetchAllContactsAndStats();
    } else if (mainTab === 'batches') {
      fetchBatches();
    }
  }, [mainTab, subFilter]);

  const fetchInitialData = async () => {
    try {
      const [uRes, bRes] = await Promise.all([
        usersAPI.getAll({ limit: 100 }),
        callingAPI.getBatches(),
      ]);
      const allU = uRes.data.data.users || [];
      const sales = allU.filter((u) => ['sales', 'admin', 'management'].includes(u.role));
      setSalesUsers(sales);
      setBatches(bRes.data.data.batches || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyQueue = async () => {
    try {
      setLoading(true);
      const params = {};
      if (subFilter !== 'all') params.status = subFilter;
      if (search) params.search = search;

      const { data } = await callingAPI.getMyQueue(params);
      setContacts(data.data.contacts || []);
      setStats(data.data.stats || { total: 0, pending: 0, callback: 0, interested: 0, not_interested: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllContactsAndStats = async () => {
    try {
      setLoading(true);
      const { data } = await callingAPI.getAllContacts({ limit: 200 });
      setContacts(data.data.contacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data } = await callingAPI.getBatches();
      setBatches(data.data.batches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (mainTab === 'workspace') fetchMyQueue();
    else if (mainTab === 'team_tracker') fetchAllContactsAndStats();
  };

  const openLogModal = (contact) => {
    setActiveContact(contact);
    setLogStatus(contact.callStatus === 'pending' ? 'interested' : contact.callStatus);
    setLogRemark('');
    setLogCallbackTime('');
  };

  const saveCallLog = async (e) => {
    e.preventDefault();
    if (!activeContact) return;
    try {
      setSavingLog(true);
      await callingAPI.logCall(activeContact._id, {
        status: logStatus,
        remark: logRemark,
        callbackTime: logStatus === 'callback' && logCallbackTime ? logCallbackTime : undefined,
      });
      setActiveContact(null);
      if (mainTab === 'workspace') fetchMyQueue();
      else fetchAllContactsAndStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log call outcome');
    } finally {
      setSavingLog(false);
    }
  };

  const convertToLead = async (contactId) => {
    if (!window.confirm('Convert this prospect into an official CRM Lead?')) return;
    try {
      await callingAPI.convertToLead(contactId);
      alert('Converted to Lead successfully!');
      if (mainTab === 'workspace') fetchMyQueue();
      else fetchAllContactsAndStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert contact');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!rawNumbers.trim()) {
      setUploadError('Please provide contacts or phone numbers list');
      return;
    }

    try {
      setUploading(true);
      const lines = rawNumbers.split('\n').map((l) => l.trim()).filter(Boolean);
      const contactList = [];

      for (const line of lines) {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          contactList.push({
            name: parts[0],
            phone: parts[1],
            city: parts[2] || '',
            company: parts[3] || '',
            requirement: parts[4] || '',
          });
        } else if (parts.length === 1 && parts[0]) {
          contactList.push({
            name: 'Prospect',
            phone: parts[0],
          });
        }
      }

      if (contactList.length === 0) {
        setUploadError('No valid contacts detected');
        setUploading(false);
        return;
      }

      await callingAPI.uploadBatch({
        title: batchTitle || `Batch ${new Date().toLocaleDateString()}`,
        source: 'CSV Upload',
        contacts: contactList,
        splitAmongUsers: selectedExecutives.length > 0 ? selectedExecutives : undefined,
      });

      setShowUploadModal(false);
      setBatchTitle('');
      setRawNumbers('');
      setSelectedExecutives([]);
      fetchInitialData();
      if (mainTab === 'workspace') fetchMyQueue();
      else if (mainTab === 'batches') fetchBatches();
      else fetchAllContactsAndStats();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload and split batch');
    } finally {
      setUploading(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!reassignBatchId || reassignTargetUsers.length === 0) {
      alert('Please select a batch and at least one sales executive');
      return;
    }

    try {
      setReassigning(true);
      await callingAPI.assignContacts({
        batchId: reassignBatchId,
        assignToUsers: reassignTargetUsers,
        mode: 'equal_split',
      });
      setShowReassignModal(false);
      setReassignBatchId('');
      setReassignTargetUsers([]);
      fetchInitialData();
      if (mainTab === 'workspace') fetchMyQueue();
      else if (mainTab === 'batches') fetchBatches();
      else fetchAllContactsAndStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to re-allocate numbers');
    } finally {
      setReassigning(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Delete this batch and all its associated numbers?')) return;
    try {
      await callingAPI.deleteBatch(batchId);
      fetchBatches();
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete batch');
    }
  };

  const totalAssigned = stats.total || 0;
  const completedCalls = (stats.total || 0) - (stats.pending || 0);
  const progressPercent = totalAssigned > 0 ? Math.round((completedCalls / totalAssigned) * 100) : 0;

  const filteredContacts = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
            Telecalling & Lead Distribution
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, margin: 0 }}>
            Bulk upload phone numbers, auto-split equally across sales executives, and track live call conversions
          </p>
        </div>

        {isManagerOrAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              style={{ borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowReassignModal(true)}
            >
              <ArrowLeftRight size={15} /> Re-allocate Numbers
            </button>
            <button
              className="btn btn-primary"
              style={{ borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={15} /> Bulk Upload & Auto-Split
            </button>
          </div>
        )}
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* Card 1: My Pending Calls */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#EAF3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              flexShrink: 0,
            }}
          >
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1 }}>
              {stats.pending || 0}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              My Pending Calls
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', marginTop: 2 }}>
              Fresh Queue To Dial
            </div>
          </div>
        </div>

        {/* Card 2: Scheduled Callbacks */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#FFF0E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F97316',
              flexShrink: 0,
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1 }}>
              {stats.callback || 0}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              Scheduled Callbacks
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#F97316', marginTop: 2 }}>
              Follow-ups Scheduled
            </div>
          </div>
        </div>

        {/* Card 3: Interested Deals */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#E9F8F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              flexShrink: 0,
            }}
          >
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1 }}>
              {stats.interested || 0}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              Interested Deals
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#10B981', marginTop: 2 }}>
              Ready for Conversion
            </div>
          </div>
        </div>

        {/* Card 4: Queue Progress */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#EDE9FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8B5CF6',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1 }}>
              {progressPercent}%
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              Queue Progress
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#8B5CF6', marginTop: 2 }}>
              {completedCalls} / {totalAssigned} Completed
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs (Pills) */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setMainTab('workspace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: mainTab === 'workspace' ? '#016139' : '#FFFFFF',
            color: mainTab === 'workspace' ? '#FFFFFF' : '#42524E',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <span>📞</span> My Calling Workspace
        </button>

        {isManagerOrAdmin && (
          <>
            <button
              onClick={() => setMainTab('team_tracker')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: mainTab === 'team_tracker' ? '#016139' : '#FFFFFF',
                color: mainTab === 'team_tracker' ? '#FFFFFF' : '#42524E',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <span>👥</span> Team Allocation & Progress Tracker
            </button>

            <button
              onClick={() => setMainTab('batches')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: mainTab === 'batches' ? '#016139' : '#FFFFFF',
                color: mainTab === 'batches' ? '#FFFFFF' : '#42524E',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <span>📁</span> Campaign Batches ({batches.length})
            </button>
          </>
        )}
      </div>

      {/* Sub Filters (Horizontal Caps Bar) */}
      {mainTab === 'workspace' && (
        <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 16 }}>
          {SUB_FILTERS.map((f) => {
            const isActive = subFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setSubFilter(f.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  cursor: 'pointer',
                  color: isActive ? '#016139' : '#9AA7A3',
                  position: 'relative',
                  padding: '4px 0',
                }}
              >
                {f.label}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -11,
                      left: 0,
                      right: 0,
                      height: 2.5,
                      background: '#016139',
                      borderRadius: 2,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Search Bar */}
      {mainTab === 'workspace' && (
        <div style={{ marginBottom: 16 }}>
          <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#9AA7A3' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 34, height: 38, borderRadius: 8, fontSize: 13 }}
              placeholder="Search by prospect name, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
      )}

      {/* Main Tab: WORKSPACE */}
      {mainTab === 'workspace' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              Loading calling queue...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px' }}>
              <div style={{ opacity: 0.3, marginBottom: 12 }}>
                <PhoneCall size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                No Calling Contacts Found
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, margin: 0 }}>
                No numbers matching the current status filter. Select another filter or ask your admin to allocate a batch.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFBFB', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PROSPECT</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PHONE & DIAL</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>LOCATION / COMPANY</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>STATUS</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>LAST CALL / CALLBACK</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-heading)' }}>{c.name}</div>
                        {c.batchId?.batchNo && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.batchId.batchNo}</div>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <a
                            href={`tel:${c.phone}`}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6 }}
                          >
                            <Phone size={12} /> {c.phone}
                          </a>
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px', color: '#25D366', fontSize: 14 }}
                            title="WhatsApp Chat"
                          >
                            💬
                          </a>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13 }}>
                        <div>{c.city || '—'}</div>
                        {c.company && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.company}</div>}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background:
                              c.callStatus === 'interested'
                                ? '#E9F8F1'
                                : c.callStatus === 'callback'
                                ? '#FFF0E5'
                                : c.callStatus === 'not_interested'
                                ? '#FFF0F0'
                                : '#F1F5F9',
                            color:
                              c.callStatus === 'interested'
                                ? '#10B981'
                                : c.callStatus === 'callback'
                                ? '#F97316'
                                : c.callStatus === 'not_interested'
                                ? '#EF4444'
                                : '#64748B',
                          }}
                        >
                          {c.callStatus?.toUpperCase()?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 12.5 }}>
                        {c.callbackTime ? (
                          <div style={{ color: '#F97316', fontWeight: 600 }}>
                            📅 {new Date(c.callbackTime).toLocaleString()}
                          </div>
                        ) : c.callHistory?.length > 0 ? (
                          <div style={{ color: 'var(--text-muted)' }}>
                            {new Date(c.callHistory[c.callHistory.length - 1].calledAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Not called yet</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ borderRadius: 6, fontSize: 12 }}
                            onClick={() => openLogModal(c)}
                          >
                            Log Call
                          </button>
                          {c.callStatus === 'interested' && !c.isConvertedToLead && (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ borderRadius: 6, fontSize: 12, background: '#10B981', color: 'white' }}
                              onClick={() => convertToLead(c._id)}
                            >
                              <UserCheck size={13} /> Lead
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Tab: TEAM TRACKER */}
      {mainTab === 'team_tracker' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFBFB', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>SALES EXECUTIVE</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL ASSIGNED</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CALLED</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PENDING QUEUE</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>INTERESTED</th>
                <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PROGRESS</th>
              </tr>
            </thead>
            <tbody>
              {salesUsers.map((u) => {
                const uContacts = contacts.filter((c) => c.assignedTo?._id === u._id || c.assignedTo === u._id);
                const uTotal = uContacts.length;
                const uPending = uContacts.filter((c) => c.callStatus === 'pending').length;
                const uCalled = uTotal - uPending;
                const uInterested = uContacts.filter((c) => c.callStatus === 'interested').length;
                const uPct = uTotal > 0 ? Math.round((uCalled / uTotal) * 100) : 0;

                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700 }}>{uTotal}</td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: '#10B981', fontWeight: 600 }}>{uCalled}</td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: '#2563EB', fontWeight: 600 }}>{uPending}</td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: '#016139', fontWeight: 700 }}>{uInterested}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: '#E8EEEB', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${uPct}%`, height: '100%', background: '#016139', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, width: 35 }}>{uPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Main Tab: BATCHES */}
      {mainTab === 'batches' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {batches.map((b) => (
            <div key={b._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#EDE9FF',
                      color: '#4F46E5',
                    }}
                  >
                    {b.batchNo}
                  </span>
                  <h3 style={{ margin: '8px 0 2px 0', fontSize: 16, fontWeight: 700 }}>{b.title}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Uploaded {new Date(b.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBatch(b._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }}
                  title="Delete Batch"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Numbers</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{b.totalNumbers}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assigned</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#016139' }}>{b.assignedCount || b.totalNumbers}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <strong>Assigned Staff:</strong>{' '}
                {b.assignedTo?.length > 0 ? b.assignedTo.map((u) => u.name).join(', ') : 'Unassigned'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Call Modal */}
      {activeContact && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">Log Call Result</h2>
              <button className="modal-close-btn" onClick={() => setActiveContact(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCallLog}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{activeContact.name}</div>
                  <div style={{ fontSize: 13, color: '#016139', fontWeight: 600 }}>{activeContact.phone}</div>
                </div>

                <div>
                  <label className="form-label">Call Outcome *</label>
                  <select
                    className="form-select"
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value)}
                  >
                    <option value="interested">Interested (Hot Prospect)</option>
                    <option value="callback">Callback / Follow-up Scheduled</option>
                    <option value="ringing_no_answer">Ringing / No Answer</option>
                    <option value="busy">Line Busy</option>
                    <option value="switched_off">Switched Off</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="invalid_wrong_number">Wrong / Invalid Number</option>
                  </select>
                </div>

                {logStatus === 'callback' && (
                  <div>
                    <label className="form-label">Callback Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-input"
                      value={logCallbackTime}
                      onChange={(e) => setLogCallbackTime(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="form-label">Notes & Remarks</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Prospect wants pricing details by tomorrow..."
                    value={logRemark}
                    onChange={(e) => setLogRemark(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveContact(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingLog}>
                  {savingLog ? 'Saving...' : 'Save Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Batch Modal */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h2 className="modal-title">Bulk Upload & Auto-Split Numbers</h2>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>

            {uploadError && <div className="alert alert-error" style={{ margin: '14px 20px 0' }}>{uploadError}</div>}

            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Batch / Campaign Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Real Estate Delhi Leads"
                    value={batchTitle}
                    onChange={(e) => setBatchTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Paste Contacts (Name, Phone, City, Company) or Phone Numbers</label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    required
                    placeholder={`Amit Sharma, 9876543210, Delhi, ABC Corp\n9811122233\n9123456789`}
                    value={rawNumbers}
                    onChange={(e) => setRawNumbers(e.target.value)}
                  />
                  <small style={{ color: 'var(--text-muted)' }}>
                    Paste raw numbers (1 per line) or comma-separated contact details.
                  </small>
                </div>

                <div>
                  <label className="form-label">Auto-Split Equally Across Sales Team</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 130, overflowY: 'auto', border: '1px solid var(--border)', padding: 10, borderRadius: 6 }}>
                    {salesUsers.map((u) => {
                      const isChecked = selectedExecutives.includes(u._id);
                      return (
                        <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExecutives([...selectedExecutives, u._id]);
                              } else {
                                setSelectedExecutives(selectedExecutives.filter((id) => id !== u._id));
                              }
                            }}
                          />
                          {u.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload & Distribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-assign Modal */}
      {showReassignModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Re-allocate Batch Numbers</h2>
              <button className="modal-close-btn" onClick={() => setShowReassignModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Select Campaign Batch *</label>
                  <select
                    required
                    className="form-select"
                    value={reassignBatchId}
                    onChange={(e) => setReassignBatchId(e.target.value)}
                  >
                    <option value="">Choose batch to re-allocate...</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batchNo} - {b.title} ({b.totalNumbers} numbers)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Re-split Equally Among Executives *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', padding: 10, borderRadius: 6 }}>
                    {salesUsers.map((u) => {
                      const isChecked = reassignTargetUsers.includes(u._id);
                      return (
                        <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReassignTargetUsers([...reassignTargetUsers, u._id]);
                              } else {
                                setReassignTargetUsers(reassignTargetUsers.filter((id) => id !== u._id));
                              }
                            }}
                          />
                          {u.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReassignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={reassigning}>
                  {reassigning ? 'Re-allocating...' : 'Re-allocate Numbers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
