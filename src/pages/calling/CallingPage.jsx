import { useState, useEffect } from 'react';
import { callingAPI, usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
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
  Calendar,
  MessageSquare,
  History,
  TrendingUp,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  Zap,
  PhoneOff,
  PhoneIncoming,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  MessageCircle,
  Folder,
  Send,
  Save,
  Target,
  Sparkles
} from 'lucide-react';

import PaginationControls from '../../components/common/PaginationControls';

const SUB_FILTERS = [
  { key: 'all', label: 'ALL NUMBERS', Icon: Layers },
  { key: 'pending', label: 'PENDING (FRESH)', Icon: Zap },
  { key: 'callback', label: 'CALLBACKS / FOLLOW-UPS', Icon: Clock },
  { key: 'interested', label: 'INTERESTED (HOT)', Icon: Flame },
  { key: 'ringing_no_answer', label: 'RINGING / NO ANSWER', Icon: PhoneIncoming },
  { key: 'busy', label: 'LINE BUSY', Icon: Clock },
  { key: 'switched_off', label: 'SWITCHED OFF', Icon: PhoneOff },
  { key: 'not_interested', label: 'NOT INTERESTED', Icon: XCircle },
  { key: 'invalid_wrong_number', label: 'WRONG NUMBER', Icon: AlertTriangle },
];

export default function CallingPage() {
  const { user } = useAuth();
  const isManagerOrAdmin = ['admin', 'management'].includes(user?.role);

  // Main Tabs: 'workspace' | 'team_tracker' | 'batches'
  const [mainTab, setMainTab] = useState('workspace');
  const [subFilter, setSubFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [contactPage, setContactPage] = useState(1);

  useEffect(() => {
    setContactPage(1);
  }, [search, subFilter, mainTab]);

  // Dynamic Data States
  const [contacts, setContacts] = useState([]);
  const [workspaceStats, setWorkspaceStats] = useState({
    total: 0,
    pending: 0,
    callback: 0,
    interested: 0,
    not_interested: 0,
    ringing_no_answer: 0,
    busy: 0,
    switched_off: 0,
    invalid_wrong_number: 0,
  });
  const [overallStats, setOverallStats] = useState({
    overview: { totalContacts: 0, totalCalled: 0, totalPending: 0, totalInterested: 0, totalBatches: 0, conversionRate: '0.0' },
    agentBreakdown: [],
  });
  const [batches, setBatches] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);

  // Modals & Active Items
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const [historyModalContact, setHistoryModalContact] = useState(null);

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

  // Re-assign form
  const [reassignBatchId, setReassignBatchId] = useState('');
  const [reassignTargetUsers, setReassignTargetUsers] = useState([]);
  const [reassigning, setReassigning] = useState(false);

  // Load Sales Users & Batches on Mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch dynamic data whenever Main Tab or Sub-filter changes
  useEffect(() => {
    if (mainTab === 'workspace') {
      fetchMyQueue();
    } else if (mainTab === 'team_tracker') {
      fetchTeamStatsAndContacts();
    } else if (mainTab === 'batches') {
      fetchBatches();
    }
  }, [mainTab, subFilter]);

  const fetchInitialData = async () => {
    try {
      const [uRes, bRes, sRes] = await Promise.all([
        usersAPI.getAll({ limit: 100 }),
        callingAPI.getBatches(),
        callingAPI.getStats().catch(() => ({ data: { data: { overview: {}, agentBreakdown: [] } } })),
      ]);

      const allU = uRes.data?.data?.users || [];
      const sales = allU.filter((u) => ['sales', 'admin', 'management'].includes(u.role));
      setSalesUsers(sales);
      setBatches(bRes.data?.data?.batches || []);
      if (sRes.data?.data) {
        setOverallStats(sRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching initial telecalling data:', err);
    }
  };

  const fetchMyQueue = async () => {
    try {
      setLoading(true);
      const params = { limit: 150 };
      if (subFilter !== 'all') params.status = subFilter;
      if (search) params.search = search;

      const { data } = await callingAPI.getMyQueue(params);
      setContacts(data?.data?.contacts || []);
      if (data?.data?.stats) {
        setWorkspaceStats(data.data.stats);
      }
    } catch (err) {
      console.error('Error fetching calling queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStatsAndContacts = async () => {
    try {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        callingAPI.getAllContacts({ limit: 200, status: subFilter !== 'all' ? subFilter : undefined }),
        callingAPI.getStats(),
      ]);
      setContacts(cRes.data?.data?.contacts || []);
      if (sRes.data?.data) {
        setOverallStats(sRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching team stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data } = await callingAPI.getBatches();
      setBatches(data?.data?.batches || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (mainTab === 'workspace') fetchMyQueue();
    else if (mainTab === 'team_tracker') fetchTeamStatsAndContacts();
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

      Swal.fire({
        icon: 'success',
        title: 'Call Logged Successfully!',
        text: `Outcome updated to: ${logStatus.toUpperCase().replace(/_/g, ' ')}`,
        timer: 1400,
        showConfirmButton: false,
      });

      setActiveContact(null);
      if (mainTab === 'workspace') fetchMyQueue();
      else fetchTeamStatsAndContacts();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Log Call',
        text: err.response?.data?.message || 'Error updating call record.',
      });
    } finally {
      setSavingLog(false);
    }
  };

  const convertToLead = async (contact) => {
    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Convert to CRM Sales Lead?',
      text: `Promote prospect "${contact.name || contact.phone}" to an official active Sales Lead in CRM pipeline.`,
      showCancelButton: true,
      confirmButtonColor: '#016139',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Yes, Convert to Lead',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await callingAPI.convertToLead(contact._id);
      Swal.fire({
        icon: 'success',
        title: 'Prospect Converted!',
        text: res.data?.data?.message || 'Added to CRM Sales Leads pipeline!',
        timer: 1600,
        showConfirmButton: false,
      });

      if (mainTab === 'workspace') fetchMyQueue();
      else fetchTeamStatsAndContacts();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Conversion Failed',
        text: err.response?.data?.message || 'Error converting prospect to lead.',
      });
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!rawNumbers.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Input Required', text: 'Please paste contacts or phone numbers list' });
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
        setUploading(false);
        return Swal.fire({ icon: 'warning', title: 'Invalid List', text: 'No valid phone numbers found to upload.' });
      }

      await callingAPI.uploadBatch({
        title: batchTitle || `Campaign Batch - ${new Date().toLocaleDateString('en-GB')}`,
        source: 'CSV Bulk Upload',
        contacts: contactList,
        splitAmongUsers: selectedExecutives.length > 0 ? selectedExecutives : undefined,
      });

      Swal.fire({
        icon: 'success',
        title: 'Batch Uploaded & Distributed!',
        text: `Uploaded ${contactList.length} numbers and auto-distributed across ${
          selectedExecutives.length > 0 ? `${selectedExecutives.length} sales executives` : 'sales queue'
        }.`,
      });

      setShowUploadModal(false);
      setBatchTitle('');
      setRawNumbers('');
      setSelectedExecutives([]);
      fetchInitialData();
      if (mainTab === 'workspace') fetchMyQueue();
      else if (mainTab === 'batches') fetchBatches();
      else fetchTeamStatsAndContacts();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.response?.data?.message || 'Failed to upload and split batch',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!reassignBatchId || reassignTargetUsers.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Selection Required',
        text: 'Please select a batch and at least one sales executive to re-allocate.',
      });
    }

    try {
      setReassigning(true);
      const res = await callingAPI.assignContacts({
        batchId: reassignBatchId,
        assignToUsers: reassignTargetUsers,
        mode: 'equal_split',
      });

      Swal.fire({
        icon: 'success',
        title: 'Numbers Re-allocated!',
        text: res.data?.data?.message || 'Numbers distributed equally across selected executives.',
        timer: 1500,
        showConfirmButton: false,
      });

      setShowReassignModal(false);
      setReassignBatchId('');
      setReassignTargetUsers([]);
      fetchInitialData();
      if (mainTab === 'workspace') fetchMyQueue();
      else if (mainTab === 'batches') fetchBatches();
      else fetchTeamStatsAndContacts();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Re-allocation Failed',
        text: err.response?.data?.message || 'Failed to re-allocate numbers',
      });
    } finally {
      setReassigning(false);
    }
  };

  const handleDeleteBatch = async (batch) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: `Delete Batch "${batch.title}"?`,
      text: `This will permanently delete ${batch.totalNumbers} numbers and calling history in this campaign batch.`,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Yes, Delete Permanently',
    });

    if (!confirm.isConfirmed) return;

    try {
      await callingAPI.deleteBatch(batch._id);
      Swal.fire({ icon: 'success', title: 'Batch Deleted', timer: 1200, showConfirmButton: false });
      fetchBatches();
      fetchInitialData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.response?.data?.message || 'Could not delete batch' });
    }
  };

  const handleDeleteContact = async (contact) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: `Delete ${contact.name || contact.phone}?`,
      text: 'Remove this prospect from calling queue.',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Delete',
    });

    if (!confirm.isConfirmed) return;

    try {
      await callingAPI.deleteContact(contact._id);
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1000, showConfirmButton: false });
      if (mainTab === 'workspace') fetchMyQueue();
      else fetchTeamStatsAndContacts();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Could not delete contact' });
    }
  };

  // KPI Calculations
  const isWorkspaceView = mainTab === 'workspace';
  const totalAssigned = workspaceStats.total || 0;
  const completedCalls = (workspaceStats.total || 0) - (workspaceStats.pending || 0);
  const progressPercent = totalAssigned > 0 ? Math.round((completedCalls / totalAssigned) * 100) : 0;

  // Filter contacts by search query
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

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'interested':
        return { bg: '#E9F8F1', color: '#10B981', border: '#A3E6C5', label: 'INTERESTED (HOT)', Icon: Flame };
      case 'callback':
        return { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA', label: 'CALLBACK SCHEDULED', Icon: Clock };
      case 'ringing_no_answer':
        return { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A', label: 'RINGING / NO ANSWER', Icon: PhoneIncoming };
      case 'busy':
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', label: 'LINE BUSY', Icon: Clock };
      case 'switched_off':
        return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: 'SWITCHED OFF', Icon: PhoneOff };
      case 'not_interested':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'NOT INTERESTED', Icon: XCircle };
      case 'invalid_wrong_number':
        return { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', label: 'WRONG NUMBER', Icon: AlertTriangle };
      default:
        return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', label: 'PENDING FRESH', Icon: Zap };
    }
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Telecalling & Lead Pipeline
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
                background: '#E9F8F1',
                color: '#016139',
                border: '1px solid #A3E6C5',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <PhoneCall size={12} /> LIVE CRM MODULE
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, margin: 0 }}>
            Bulk upload prospects, auto-distribute numbers equally across sales team, log call feedback, and convert directly to CRM Sales Leads.
          </p>
        </div>

        {isManagerOrAdmin && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              style={{ borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowReassignModal(true)}
            >
              <ArrowLeftRight size={15} /> Re-allocate Batches
            </button>
            <button
              className="btn btn-primary"
              style={{ borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={15} /> Bulk Upload & Auto-Split
            </button>
          </div>
        )}
      </div>

      {/* Top 4 Dynamic KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {isWorkspaceView ? (
          <>
            {/* Card 1: My Pending Calls */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
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
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>
                  {workspaceStats.pending || 0}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                  My Pending Queue
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', marginTop: 2 }}>
                  Fresh Numbers to Dial
                </div>
              </div>
            </div>

            {/* Card 2: Scheduled Callbacks */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
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
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>
                  {workspaceStats.callback || 0}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Follow-ups / Callbacks
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#F97316', marginTop: 2 }}>
                  Scheduled Calls
                </div>
              </div>
            </div>

            {/* Card 3: Interested Deals */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
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
                <div style={{ fontSize: 24, fontWeight: 800, color: '#016139', lineHeight: 1 }}>
                  {workspaceStats.interested || 0}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Interested Prospects
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#10B981', marginTop: 2 }}>
                  Ready for Lead Conversion
                </div>
              </div>
            </div>

            {/* Card 4: Queue Progress */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
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
                <div style={{ fontSize: 24, fontWeight: 800, color: '#6D28D9', lineHeight: 1 }}>
                  {progressPercent}%
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Dialing Progress
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#8B5CF6', marginTop: 2 }}>
                  {completedCalls} / {totalAssigned} Completed
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Company Overview: Card 1 */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EAF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                <Layers size={20} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>
                  {overallStats.overview?.totalContacts || 0}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Total Number Database
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', marginTop: 2 }}>
                  Across {overallStats.overview?.totalBatches || batches.length} Batches
                </div>
              </div>
            </div>

            {/* Company Overview: Card 2 */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#E9F8F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                <PhoneCall size={20} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#016139', lineHeight: 1 }}>
                  {overallStats.overview?.totalCalled || 0}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Total Calls Dialed
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#10B981', marginTop: 2 }}>
                  {overallStats.overview?.totalPending || 0} Pending
                </div>
              </div>
            </div>

            {/* Company Overview: Card 3 */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFF0E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', flexShrink: 0 }}>
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#C2410C', lineHeight: 1 }}>
                  {overallStats.overview?.totalInterested || 0}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Hot Converted Deals
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#EA580C', marginTop: 2 }}>
                  Qualified Opportunities
                </div>
              </div>
            </div>

            {/* Company Overview: Card 4 */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EDE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', flexShrink: 0 }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#6D28D9', lineHeight: 1 }}>
                  {overallStats.overview?.conversionRate || '0.0'}%
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Team Conversion Rate
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#8B5CF6', marginTop: 2 }}>
                  Calls to Hot Interest
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Tabs (Navigation Pills) */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setMainTab('workspace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 20px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: mainTab === 'workspace' ? '#016139' : '#FFFFFF',
            color: mainTab === 'workspace' ? '#FFFFFF' : '#42524E',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'all 0.15s ease',
          }}
        >
          <Phone size={15} /> My Calling Workspace ({workspaceStats.total || 0})
        </button>

        {isManagerOrAdmin && (
          <>
            <button
              onClick={() => setMainTab('team_tracker')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 20px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: mainTab === 'team_tracker' ? '#016139' : '#FFFFFF',
                color: mainTab === 'team_tracker' ? '#FFFFFF' : '#42524E',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={15} /> Team Allocation & Performance Tracker
            </button>

            <button
              onClick={() => setMainTab('batches')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 20px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: mainTab === 'batches' ? '#016139' : '#FFFFFF',
                color: mainTab === 'batches' ? '#FFFFFF' : '#42524E',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
            >
              <Folder size={15} /> Campaign Batches ({batches.length})
            </button>
          </>
        )}
      </div>

      {/* Sub Filters (Horizontal Caps Bar) */}
      {mainTab === 'workspace' && (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 16 }}>
          {SUB_FILTERS.map((f) => {
            const isActive = subFilter === f.key;
            const FilterIcon = f.Icon;
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
                  color: isActive ? '#016139' : '#64748B',
                  position: 'relative',
                  padding: '4px 6px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FilterIcon size={14} /> {f.label}
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
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#9AA7A3' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 34, height: 38, borderRadius: 8, fontSize: 13 }}
              placeholder="Search prospect by name, phone, city, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>
            Showing <strong>{filteredContacts.length}</strong> live calling prospects
          </span>
        </div>
      )}

      {/* ================= MAIN TAB 1: WORKSPACE ================= */}
      {mainTab === 'workspace' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading calling queue...</div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px' }}>
              <div style={{ opacity: 0.3, marginBottom: 12 }}>
                <PhoneCall size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                No Calling Numbers in this Filter
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, margin: 0 }}>
                {search
                  ? `No prospects matched search query "${search}".`
                  : 'Your calling queue for this filter is complete. Select "ALL NUMBERS" or upload fresh leads.'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFBFB', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PROSPECT & CAMPAIGN</th>
                      <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PHONE & DIAL</th>
                      <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>LOCATION & COMPANY</th>
                      <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CALL STATUS</th>
                      <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>FOLLOW-UP / LAST CALL</th>
                      <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts
                      .slice((contactPage - 1) * 7, contactPage * 7)
                      .map((c) => {
                      const badge = getStatusBadgeStyle(c.callStatus);
                      const StatusIcon = badge.Icon;
                      const lastHistory = c.callHistory && c.callHistory.length > 0 ? c.callHistory[c.callHistory.length - 1] : null;

                      return (
                        <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                          {/* Prospect & Campaign */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>
                              {c.name || 'Prospect'}
                            </div>
                            {c.batchId?.batchNo ? (
                              <div style={{ fontSize: 11, color: '#016139', fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Folder size={11} /> {c.batchId.batchNo} • {c.batchId.title || 'Campaign'}
                              </div>
                            ) : (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Direct Entry</div>
                            )}
                          </td>

                          {/* Phone & Direct Dial */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <a
                                href={`tel:${c.phone}`}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '5px 12px', fontSize: 12.5, fontWeight: 700, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                title="Click to dial number"
                              >
                                <Phone size={12} /> {c.phone}
                              </a>
                              <a
                                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${c.name || ''}, this is regarding IT & Software solutions from HiveRift Softwares.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 8px', color: '#16A34A', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                title="Send WhatsApp Message"
                              >
                                <MessageCircle size={14} /> WhatsApp
                              </a>
                            </div>
                          </td>

                          {/* Location & Company */}
                          <td style={{ padding: '16px 20px', fontSize: 13 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{c.city || '—'}</div>
                            {c.company && (
                              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Building2 size={11} /> {c.company}
                              </div>
                            )}
                            {c.requirement && (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {c.requirement}
                              </div>
                            )}
                          </td>

                          {/* Call Status Badge */}
                          <td style={{ padding: '16px 20px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 10px',
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                              }}
                            >
                              <StatusIcon size={12} /> {badge.label}
                            </span>
                          </td>

                          {/* Follow-up / Last Call Details */}
                          <td style={{ padding: '16px 20px', fontSize: 12.5 }}>
                            {c.callbackTime ? (
                              <div style={{ color: '#EA580C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} /> {new Date(c.callbackTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                            ) : lastHistory ? (
                              <div>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} /> Called: {new Date(lastHistory.calledAt).toLocaleDateString()}
                                </div>
                                {lastHistory.remark && (
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    "{lastHistory.remark}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Fresh (Not called yet)</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 6, fontSize: 12, fontWeight: 700, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
                                onClick={() => openLogModal(c)}
                              >
                                <FileText size={13} /> Log Call
                              </button>

                              {c.callStatus === 'interested' && !c.isConvertedToLead && (
                                <button
                                  className="btn btn-sm"
                                  style={{ borderRadius: 6, fontSize: 12, fontWeight: 700, background: '#10B981', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px' }}
                                  onClick={() => convertToLead(c)}
                                >
                                  <Target size={13} /> Convert Lead
                                </button>
                              )}

                              {c.callHistory?.length > 0 && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '5px 8px', fontSize: 11, fontWeight: 600, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}
                                  title="View Call History Logs"
                                  onClick={() => setHistoryModalContact(c)}
                                >
                                  <History size={12} /> ({c.callHistory.length})
                                </button>
                              )}

                              {isManagerOrAdmin && (
                                <button
                                  onClick={() => handleDeleteContact(c)}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                                  title="Delete Contact"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={contactPage}
                totalPages={Math.ceil(filteredContacts.length / 7) || 1}
                totalItems={filteredContacts.length}
                itemsPerPage={7}
                onPageChange={setContactPage}
              />
            </>
          )}
        </div>
      )}

      {/* ================= MAIN TAB 2: TEAM ALLOCATION & PERFORMANCE TRACKER ================= */}
      {mainTab === 'team_tracker' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-heading)' }}>
              Sales Team Telecalling Breakdown & Live Progress
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Live metrics aggregated from MongoDB
            </span>
          </div>

          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFBFB', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>SALES EXECUTIVE</th>
                  <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL ASSIGNED</th>
                  <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CALLS DIALED</th>
                  <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PENDING QUEUE</th>
                  <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>INTERESTED DEALS</th>
                  <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>CONVERSION RATE</th>
                  <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>PROGRESS</th>
                </tr>
              </thead>
              <tbody>
                {salesUsers.map((u) => {
                  const agentData = (overallStats.agentBreakdown || []).find(
                    (a) => a.user?._id === u._id || a.user?._id?.toString() === u._id?.toString()
                  );

                  const uTotal = agentData?.assigned ?? contacts.filter((c) => c.assignedTo?._id === u._id || c.assignedTo === u._id).length;
                  const uPending = agentData?.pending ?? contacts.filter((c) => (c.assignedTo?._id === u._id || c.assignedTo === u._id) && c.callStatus === 'pending').length;
                  const uCalled = agentData?.called ?? (uTotal - uPending);
                  const uInterested = agentData?.interested ?? contacts.filter((c) => (c.assignedTo?._id === u._id || c.assignedTo === u._id) && c.callStatus === 'interested').length;
                  const uConv = agentData?.conversionRate ?? (uCalled > 0 ? ((uInterested / uCalled) * 100).toFixed(1) : '0.0');
                  const uPct = uTotal > 0 ? Math.round((uCalled / uTotal) * 100) : 0;

                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 15, fontWeight: 800 }}>{uTotal}</td>
                      <td style={{ padding: '16px 20px', fontSize: 15, color: '#10B981', fontWeight: 800 }}>{uCalled}</td>
                      <td style={{ padding: '16px 20px', fontSize: 15, color: '#2563EB', fontWeight: 800 }}>{uPending}</td>
                      <td style={{ padding: '16px 20px', fontSize: 15, color: '#016139', fontWeight: 800 }}>{uInterested}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, background: '#E9F8F1', color: '#016139', fontWeight: 700, fontSize: 12 }}>
                          {uConv}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                          <div style={{ flex: 1, height: 7, background: '#E8EEEB', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${uPct}%`, height: '100%', background: '#016139', borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 800, width: 35 }}>{uPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MAIN TAB 3: CAMPAIGN BATCHES ================= */}
      {mainTab === 'batches' && (
        batches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Layers size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ fontSize: 17, fontWeight: 800 }}>No Campaign Batches Uploaded Yet</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Upload your first contact batch to auto-split numbers across your telecalling team.
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 14, fontWeight: 700 }}
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={14} /> Upload First Batch
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
            {batches.map((b) => {
              const called = b.calledCount || 0;
              const total = b.totalNumbers || 1;
              const pct = Math.round((called / total) * 100);

              return (
                <div key={b._id} className="card" style={{ padding: 22, border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                          background: '#EDE9FF',
                          color: '#4F46E5',
                        }}
                      >
                        {b.batchNo}
                      </span>
                      <h3 style={{ margin: '8px 0 2px 0', fontSize: 16, fontWeight: 800, color: 'var(--text-heading)' }}>
                        {b.title}
                      </h3>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Uploaded {new Date(b.createdAt).toLocaleDateString()} • Source: {b.source || 'Bulk CSV'}
                      </div>
                    </div>
                    {isManagerOrAdmin && (
                      <button
                        onClick={() => handleDeleteBatch(b)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                        title="Delete Batch"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Batch Stats Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ background: '#F8FAFC', padding: 8, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Total Numbers</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-heading)', marginTop: 2 }}>{b.totalNumbers}</div>
                    </div>
                    <div style={{ background: '#E9F8F1', padding: 8, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#016139', fontWeight: 600 }}>Calls Dialed</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#016139', marginTop: 2 }}>{b.calledCount || 0}</div>
                    </div>
                    <div style={{ background: '#FFF0E5', padding: 8, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#C2410C', fontWeight: 600 }}>Hot Deals</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#C2410C', marginTop: 2 }}>{b.interestedCount || 0}</div>
                    </div>
                  </div>

                  {/* Batch Progress Bar */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <span>Batch Dialing Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#016139', borderRadius: 3 }} />
                    </div>
                  </div>

                  {/* Assigned Staff */}
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Assigned Executives:</strong>{' '}
                    {b.assignedTo?.length > 0 ? b.assignedTo.map((u) => u.name).join(', ') : 'All Sales Team'}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ================= MODAL 1: LOG CALL OUTCOME ================= */}
      {activeContact && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Log Call Result</h2>
              <button className="modal-close-btn" onClick={() => setActiveContact(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCallLog}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-heading)' }}>
                    {activeContact.name || 'Prospect'}
                  </div>
                  <div style={{ fontSize: 13, color: '#016139', fontWeight: 700, marginTop: 2 }}>
                    {activeContact.phone} {activeContact.city && `• ${activeContact.city}`}
                  </div>
                </div>

                <div>
                  <label className="form-label">Call Outcome / Status *</label>
                  <select
                    className="form-select"
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value)}
                    style={{ fontWeight: 700 }}
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
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                )}

                <div>
                  <label className="form-label">Discussion Notes & Remarks</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Prospect inquired about Custom Web Application pricing, asked to call back tomorrow..."
                    value={logRemark}
                    onChange={(e) => setLogRemark(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveContact(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingLog} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={14} /> {savingLog ? 'Saving...' : 'Save Call Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CALL HISTORY LOGS ================= */}
      {historyModalContact && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">Call History Timeline</h2>
              <button className="modal-close-btn" onClick={() => setHistoryModalContact(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{historyModalContact.name || 'Prospect'}</div>
                <div style={{ fontSize: 13, color: '#016139', fontWeight: 700 }}>{historyModalContact.phone}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                {(historyModalContact.callHistory || []).slice().reverse().map((h, i) => (
                  <div key={i} style={{ padding: 10, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#016139', textTransform: 'uppercase' }}>
                        {h.status?.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {new Date(h.calledAt).toLocaleString()}
                      </span>
                    </div>
                    {h.remark && (
                      <div style={{ fontSize: 12, color: 'var(--text-heading)', marginTop: 4 }}>
                        "{h.remark}"
                      </div>
                    )}
                    {h.callbackTime && (
                      <div style={{ fontSize: 11, color: '#EA580C', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> Follow-up Set for: {new Date(h.callbackTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setHistoryModalContact(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: BULK UPLOAD & AUTO-SPLIT ================= */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h2 className="modal-title">Bulk Upload & Auto-Distribute Numbers</h2>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Batch / Campaign Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. IT Software Leads - Delhi NCR August"
                    value={batchTitle}
                    onChange={(e) => setBatchTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Paste Numbers (1 per line) or CSV format (Name, Phone, City, Company)</label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    required
                    placeholder={`Amit Sharma, 9876543210, Delhi, TechCorp\nPooja Verma, 9811122233, Mumbai, Solar Ltd\n9988776655\n9123456789`}
                    value={rawNumbers}
                    onChange={(e) => setRawNumbers(e.target.value)}
                  />
                  <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Tip: Paste raw phone numbers or comma-separated name, phone, city, company.
                  </small>
                </div>

                <div>
                  <label className="form-label">Auto-Split Equally Across Sales Executives (Round Robin)</label>
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
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>
                    If none selected, batch will be placed in the general unassigned queue.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Upload size={14} /> {uploading ? 'Distributing...' : 'Upload & Auto-Split'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: RE-ALLOCATE BATCH NUMBERS ================= */}
      {showReassignModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Re-allocate Campaign Batch</h2>
              <button className="modal-close-btn" onClick={() => setShowReassignModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Select Campaign Batch to Re-distribute *</label>
                  <select
                    required
                    className="form-select"
                    value={reassignBatchId}
                    onChange={(e) => setReassignBatchId(e.target.value)}
                    style={{ fontWeight: 600 }}
                  >
                    <option value="">Choose campaign batch...</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batchNo} - {b.title} ({b.totalNumbers} numbers)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Select Sales Executives to Distribute Numbers *</label>
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
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
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
                <button type="submit" className="btn btn-primary" disabled={reassigning} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeftRight size={14} /> {reassigning ? 'Re-allocating...' : 'Re-distribute Numbers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
