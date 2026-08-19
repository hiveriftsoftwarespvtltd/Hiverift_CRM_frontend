import { useState, useEffect } from 'react';
import {
  FileText, Printer, Send, Edit3, Eye, Trash2, Plus, X, Building, User, Mail, Phone, Calendar, Check, Save, Sparkles
} from 'lucide-react';
import { quotationsAPI } from '../../api';
import Swal from 'sweetalert2';

export const TEMPLATE_OPTIONS = [
  {
    id: 'sales_standard',
    title: 'IT & Custom Software Proposal',
    headerTitle: 'CUSTOM SOFTWARE DEVELOPMENT & IT SOLUTIONS PROPOSAL',
    subTitle: 'Enterprise Web, Mobile & Software Engineering Solutions',
    defaultServices: [
      {
        name: 'Custom Web & CRM Software Solution',
        description: 'Fullstack React, Node.js, MongoDB Application with RBAC & API integrations',
        quantity: 1,
        rate: 45000,
        amount: 45000
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. is pleased to present this comprehensive technical proposal to Valued Client. Our enterprise software engineering approach blends modular architecture, modern frontend/backend performance, enterprise database reliability, and responsive design to deliver scalable digital infrastructure tailored to your business operations.',
    defaultNotes: '1. Standard payment schedule: 50% advance upon contract signing, 30% after beta milestone, 20% on final deployment.\n2. Quotation is valid for 15 days from issue date.\n3. Complimentary 30 days bug-fixing & technical support included.',
    defaultTerms: '1. Warranty & Bug Fixing: 30 days of complimentary technical warranty post-deployment to address any bugs or defects.\n2. Intellectual Property: 100% intellectual property, proprietary assets, and custom source code transferred to client upon final payment settlement.\n3. Change Requests: Additional feature requirements outside the agreed scope will be estimated separately as a milestone addendum.\n4. Confidentiality: Strict Non-Disclosure Agreement (NDA) protects all proprietary business data, workflows, and user credentials.',
    defaultQuote: '"Empowering Growing Businesses Through Cutting-Edge Enterprise Software Engineering"'
  },
  {
    id: 'social_media',
    title: 'Social Media & Meta Ads Proposal',
    headerTitle: 'SOCIAL MEDIA MANAGEMENT + META ADS PROPOSAL',
    subTitle: 'Social Media Management + Meta Ads Campaign & Digital Growth',
    defaultServices: [
      {
        name: 'Social Media Management (15 Posts + 5 Reels/mo)',
        description: 'Graphic Design, Video Editing, Captions, Hashtags & Community Management',
        quantity: 1,
        rate: 4000,
        amount: 4000
      },
      {
        name: 'Meta Ads Campaign Management',
        description: 'Lead Generation, Brand Awareness, Retargeting, A/B Testing & Daily Optimization',
        quantity: 1,
        rate: 2000,
        amount: 2000
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. offers end-to-end digital growth and performance marketing designed to elevate brand authority and generate qualified business leads through hyper-targeted Meta advertising funnels, creative visual branding, and data-driven audience optimization.',
    defaultNotes: '1. Monthly Management Fee is payable 100% in advance.\n2. Recommended minimum commitment of 3 months for measurable lead generation results.\n3. Ad spend / Meta budget is not included and will be billed separately as per client budget.\n4. Client will provide high-res logo, photos/videos and Meta Ad account access.',
    defaultTerms: '1. Payment: Monthly management fee is payable 100% in advance.\n2. Minimum Commitment: Recommended 3 months commitment for measurable digital growth & audience optimization.\n3. Content Materials: Client to provide product/service photos, raw videos, and access to brand assets.\n4. Ad Spend: Meta ads budget is not included in the management fee and is managed per client\'s budget.\n5. Account Access: Client will provide manager access to Facebook Page, Instagram & Meta Ad Account.\n6. Dedicated Support: Transparent monthly reports and continuous strategy optimization.',
    defaultQuote: '"Empowering Growing Businesses Through Targeted Digital & Social Growth"'
  }
];

export default function ProposalCanvasModal({
  isOpen,
  onClose,
  quotation,
  initialIsEditing = false,
  leads = [],
  clients = [],
  onSaved,
  onSendEmail,
}) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [saving, setSaving] = useState(false);

  // Template State
  const [templateType, setTemplateType] = useState('sales_standard');
  const [targetType, setTargetType] = useState('lead'); // 'lead' | 'client'
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  // Editable Headings & Subtitles
  const [headerTitle, setHeaderTitle] = useState(TEMPLATE_OPTIONS[0].headerTitle);
  const [subTitle, setSubTitle] = useState(TEMPLATE_OPTIONS[0].subTitle);
  const [customClientHeading, setCustomClientHeading] = useState('');

  // Editable Section Titles
  const [section1Title, setSection1Title] = useState('1. EXECUTIVE SUMMARY & OBJECTIVES');
  const [section2Title, setSection2Title] = useState('2. SCOPE OF WORK & COMMERCIAL DELIVERABLES');
  const [section3Title, setSection3Title] = useState('3. OFFICIAL BANK DETAILS FOR WIRE / UPI TRANSFER');
  const [section4Title, setSection4Title] = useState('4. TERMS & CONDITIONS');
  const [section5Title, setSection5Title] = useState('5. ACCEPTANCE & AUTHORIZATION');

  // Editable Content Blocks
  const [executiveSummary, setExecutiveSummary] = useState(TEMPLATE_OPTIONS[0].defaultExecutiveSummary);
  const [notes, setNotes] = useState(TEMPLATE_OPTIONS[0].defaultNotes);
  const [termsAndConditions, setTermsAndConditions] = useState(TEMPLATE_OPTIONS[0].defaultTerms);
  const [footerQuote, setFooterQuote] = useState(TEMPLATE_OPTIONS[0].defaultQuote);

  // Editable Dates & Financials
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(18);
  const [services, setServices] = useState(TEMPLATE_OPTIONS[0].defaultServices.map(s => ({ ...s })));

  const [lastLoadedId, setLastLoadedId] = useState(null);

  // Load quotation data or defaults
  useEffect(() => {
    if (!isOpen) {
      setLastLoadedId(null);
      return;
    }

    const currentId = quotation?._id || 'new';
    if (lastLoadedId !== currentId) {
      setLastLoadedId(currentId);
      setIsEditing(initialIsEditing || !quotation);

      if (quotation) {
        const isClient = !!quotation.client;
        setTargetType(isClient ? 'client' : 'lead');
        setSelectedLeadId(quotation.lead?._id || quotation.lead || '');
        setSelectedClientId(quotation.client?._id || quotation.client || '');

        // Detect template type
        const isSocial = quotation.templateType === 'social_media' || (quotation.services || []).some(s =>
          /social|meta|reel|post|ad\s*campaign/i.test(s.name || '')
        );
        const currentTpl = isSocial ? 'social_media' : 'sales_standard';
        const tplDefaults = currentTpl === 'social_media' ? TEMPLATE_OPTIONS[1] : TEMPLATE_OPTIONS[0];

        setTemplateType(currentTpl);
        setHeaderTitle(quotation.headerTitle || tplDefaults.headerTitle);
        setSubTitle(quotation.subTitle || tplDefaults.subTitle);
        setCustomClientHeading(
          quotation.customClientHeading ||
          (isClient ? quotation.client?.company || quotation.client?.name : quotation.lead?.company || quotation.lead?.name) ||
          ''
        );

        setSection1Title(quotation.section1Title || '1. EXECUTIVE SUMMARY & OBJECTIVES');
        setSection2Title(quotation.section2Title || '2. SCOPE OF WORK & COMMERCIAL DELIVERABLES');
        setSection3Title(quotation.section3Title || '3. OFFICIAL BANK DETAILS FOR WIRE / UPI TRANSFER');
        setSection4Title(quotation.section4Title || '4. TERMS & CONDITIONS');
        setSection5Title(quotation.section5Title || '5. ACCEPTANCE & AUTHORIZATION');

        setExecutiveSummary(quotation.executiveSummary || tplDefaults.defaultExecutiveSummary);
        setNotes(quotation.notes || tplDefaults.defaultNotes);
        setTermsAndConditions(quotation.termsAndConditions || tplDefaults.defaultTerms);
        setFooterQuote(quotation.footerQuote || tplDefaults.defaultQuote);

        setValidUntil(quotation.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '');
        setDiscount(quotation.discount || 0);
        setTaxPercent(quotation.taxPercent !== undefined ? quotation.taxPercent : 18);

        if (quotation.services && quotation.services.length > 0) {
          setServices(quotation.services.map(s => ({
            name: s.name || '',
            description: s.description || '',
            quantity: Number(s.quantity) || 1,
            rate: Number(s.rate) || 0,
            amount: Number(s.amount) || ((Number(s.quantity) || 1) * (Number(s.rate) || 0))
          })));
        } else {
          setServices(tplDefaults.defaultServices.map(s => ({ ...s })));
        }
      } else {
        // New proposal defaults
        setTemplateType('sales_standard');
        setTargetType('lead');
        setSelectedLeadId('');
        setSelectedClientId('');
        setHeaderTitle(TEMPLATE_OPTIONS[0].headerTitle);
        setSubTitle(TEMPLATE_OPTIONS[0].subTitle);
        setCustomClientHeading('');
        setSection1Title('1. EXECUTIVE SUMMARY & OBJECTIVES');
        setSection2Title('2. SCOPE OF WORK & COMMERCIAL DELIVERABLES');
        setSection3Title('3. OFFICIAL BANK DETAILS FOR WIRE / UPI TRANSFER');
        setSection4Title('4. TERMS & CONDITIONS');
        setSection5Title('5. ACCEPTANCE & AUTHORIZATION');
        setExecutiveSummary(TEMPLATE_OPTIONS[0].defaultExecutiveSummary);
        setNotes(TEMPLATE_OPTIONS[0].defaultNotes);
        setTermsAndConditions(TEMPLATE_OPTIONS[0].defaultTerms);
        setFooterQuote(TEMPLATE_OPTIONS[0].defaultQuote);
        setValidUntil(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
        setDiscount(0);
        setTaxPercent(18);
        setServices(TEMPLATE_OPTIONS[0].defaultServices.map(s => ({ ...s })));
      }
    }
  }, [isOpen, quotation, initialIsEditing, lastLoadedId]);

  if (!isOpen) return null;

  // Real-time calculations
  const subtotal = services.reduce((acc, s) => acc + ((Number(s.quantity) || 0) * (Number(s.rate) || 0)), 0);
  const discountVal = Number(discount) || 0;
  const taxableSubtotal = Math.max(0, subtotal - discountVal);
  const taxAmount = Math.round(taxableSubtotal * ((Number(taxPercent) || 0) / 100));
  const totalAmount = taxableSubtotal + taxAmount;

  // Selected Target Info
  const selectedLead = leads.find(l => l._id === selectedLeadId);
  const selectedClient = clients.find(c => c._id === selectedClientId);

  const autoTargetName = targetType === 'client'
    ? (selectedClient?.name || quotation?.client?.name || 'Valued Client')
    : (selectedLead?.name || quotation?.lead?.name || 'Valued Client');

  const autoTargetCompany = targetType === 'client'
    ? (selectedClient?.company || quotation?.client?.company || '')
    : (selectedLead?.company || quotation?.lead?.company || '');

  const displayClientHeading = customClientHeading || autoTargetCompany || autoTargetName;

  const targetEmail = targetType === 'client'
    ? (selectedClient?.email || quotation?.client?.email || '')
    : (selectedLead?.email || quotation?.lead?.email || '');

  const targetPhone = targetType === 'client'
    ? (selectedClient?.phone || quotation?.client?.phone || '')
    : (selectedLead?.phone || quotation?.lead?.phone || '');

  // Handle template switch
  const handleSwitchTemplate = (type) => {
    setTemplateType(type);
    const tpl = TEMPLATE_OPTIONS.find(t => t.id === type) || TEMPLATE_OPTIONS[0];
    setHeaderTitle(tpl.headerTitle);
    setSubTitle(tpl.subTitle);
    setServices(tpl.defaultServices.map(s => ({ ...s })));
    setNotes(tpl.defaultNotes);
    setExecutiveSummary(tpl.defaultExecutiveSummary);
    setTermsAndConditions(tpl.defaultTerms);
    setFooterQuote(tpl.defaultQuote);
  };

  // Row operations
  const handleServiceChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const q = Number(field === 'quantity' ? value : updated[index].quantity) || 0;
      const r = Number(field === 'rate' ? value : updated[index].rate) || 0;
      updated[index].amount = q * r;
    }
    setServices(updated);
  };

  const handleAddService = () => {
    setServices([...services, { name: '', description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveService = (index) => {
    if (services.length === 1) return;
    setServices(services.filter((_, i) => i !== index));
  };

  // Save handler
  const handleSave = async () => {
    if (targetType === 'lead' && !selectedLeadId) {
      return Swal.fire({ icon: 'warning', title: 'Please select a Sales Lead', confirmButtonColor: '#016139' });
    }
    if (targetType === 'client' && !selectedClientId) {
      return Swal.fire({ icon: 'warning', title: 'Please select a Converted Client', confirmButtonColor: '#016139' });
    }
    if (services.length === 0 || !services[0].name.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Please add at least one deliverable item', confirmButtonColor: '#016139' });
    }

    setSaving(true);
    try {
      const payload = {
        templateType,
        headerTitle: headerTitle.trim(),
        subTitle: subTitle.trim(),
        customClientHeading: customClientHeading.trim(),
        section1Title: section1Title.trim(),
        section2Title: section2Title.trim(),
        section3Title: section3Title.trim(),
        section4Title: section4Title.trim(),
        section5Title: section5Title.trim(),
        executiveSummary: executiveSummary.trim(),
        notes: notes.trim(),
        termsAndConditions: termsAndConditions.trim(),
        footerQuote: footerQuote.trim(),
        validUntil,
        discount: Number(discount) || 0,
        taxPercent: Number(taxPercent) || 0,
        services: services.map(s => ({
          name: s.name.trim(),
          description: s.description ? s.description.trim() : '',
          quantity: Number(s.quantity) || 1,
          rate: Number(s.rate) || 0,
          amount: (Number(s.quantity) || 1) * (Number(s.rate) || 0)
        }))
      };

      if (targetType === 'lead') {
        payload.lead = selectedLeadId;
      } else {
        payload.client = selectedClientId;
      }

      let savedDoc;
      if (quotation?._id) {
        const { data } = await quotationsAPI.update(quotation._id, payload);
        savedDoc = data.data || data;
        Swal.fire({
          icon: 'success',
          title: 'Proposal Updated!',
          text: `Quotation ${quotation.quotationNo} has been updated successfully.`,
          timer: 1500,
          showConfirmButton: false,
          iconColor: '#016139',
        });
      } else {
        const { data } = await quotationsAPI.create(payload);
        savedDoc = data.data || data;
        Swal.fire({
          icon: 'success',
          title: 'Proposal Generated!',
          text: 'New quotation proposal created & synced to Payments.',
          timer: 1500,
          showConfirmButton: false,
          iconColor: '#016139',
        });
      }

      if (onSaved) onSaved(savedDoc);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.response?.data?.message || 'Failed to save proposal',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSaving(false);
    }
  };

  const currentTemplateObj = TEMPLATE_OPTIONS.find(t => t.id === templateType) || TEMPLATE_OPTIONS[0];

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '94vh',
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Top Sticky Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            background: '#014D3B',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText size={20} color="#34d399" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                {quotation ? quotation.quotationNo : 'Generate New Proposal'}
              </div>
              <div style={{ fontSize: 11, color: '#A7F3D0', fontWeight: 600 }}>
                {currentTemplateObj.title} {isEditing ? '• [Full Canvas Edit Mode]' : '• [Document Preview Mode]'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mode Switcher */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: isEditing ? '#34d399' : 'rgba(255, 255, 255, 0.15)',
                color: isEditing ? '#014D3B' : '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
            >
              {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
              {isEditing ? 'View Clean Preview' : '✏️ Edit Content & Headings'}
            </button>

            {/* Save Button in Edit Mode */}
            {isEditing && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: '#10B981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 16px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Save size={14} />
                {saving ? 'Saving...' : quotation ? 'Update Proposal' : 'Save & Generate'}
              </button>
            )}

            {/* Print / Save PDF in View Mode */}
            {!isEditing && (
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: '#ffffff',
                  color: '#016139',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            )}

            {/* Email in View Mode */}
            {!isEditing && quotation && onSendEmail && (
              <button
                type="button"
                onClick={() => onSendEmail(quotation._id, quotation.quotationNo, targetEmail)}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Send size={13} /> Send Email
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 22,
                padding: '2px 6px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas Container */}
        <div
          style={{
            background: '#f1f5f9',
            flex: 1,
            overflowY: 'auto',
            padding: '24px 16px',
            boxSizing: 'border-box',
          }}
        >
          {/* A4 Sheet Container */}
          <div
            id="printable-proposal-sheet"
            style={{
              maxWidth: 860,
              margin: '0 auto',
              background: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              fontFamily: `'Segoe UI', Arial, sans-serif`,
              color: '#212121',
              boxSizing: 'border-box',
            }}
          >
            {/* Top Emerald Accent Bar */}
            <div style={{ height: 8, background: '#198754' }} />

            {/* Company Legal Header */}
            <div style={{ padding: '24px 36px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #198754' }}>
              <div>
                <img
                  src="/logo.png"
                  alt="HiveRift Logo"
                  style={{ maxHeight: 52, maxWidth: 200, objectFit: 'contain', display: 'block' }}
                  onError={(e) => { e.target.src = 'https://hiverift.com/logo.png'; }}
                />
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#334155', lineHeight: 1.45 }}>
                <strong style={{ fontSize: 12.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  HIVERIFT SOFTWARES PRIVATE LIMITED
                </strong><br />
                CIN U63999DL2025PTC460443<br />
                2nd Floor, House No. 8577 (New) Plot No. XVI/6501 (Old), New Rohtak Road<br />
                Karol Bagh, New Delhi - 110005, India
              </div>
            </div>

            {/* Document Body Area */}
            <div style={{ padding: '28px 44px' }}>

              {/* Template Switcher Bar in Edit Mode */}
              {isEditing && (
                <div style={{ marginBottom: 20, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                    Preset Format Quick-Switch:
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {TEMPLATE_OPTIONS.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSwitchTemplate(tpl.id)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 6,
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                          border: templateType === tpl.id ? '2px solid #198754' : '1px solid #cbd5e1',
                          background: templateType === tpl.id ? '#e9f7ef' : '#ffffff',
                          color: templateType === tpl.id ? '#198754' : '#334155',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Main Proposal Heading (Editable) */}
              {isEditing ? (
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>
                    Proposal Main Heading:
                  </label>
                  <input
                    type="text"
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    placeholder="Proposal Heading..."
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: 18,
                      fontWeight: 800,
                      color: '#111',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      padding: '6px 10px',
                      border: '1px dashed #198754',
                      borderRadius: 6,
                      background: '#f8fafc',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : (
                <h1
                  style={{
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    margin: '0 0 6px 0',
                    color: '#111',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {headerTitle}
                </h1>
              )}

              {/* 2. Client / Target Title Heading (Editable) */}
              {isEditing ? (
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>
                    Client / Target Name:
                  </label>
                  <input
                    type="text"
                    value={customClientHeading}
                    onChange={(e) => setCustomClientHeading(e.target.value)}
                    placeholder={autoTargetCompany || autoTargetName || 'Target Client Name'}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#198754',
                      padding: '5px 10px',
                      border: '1px dashed #198754',
                      borderRadius: 6,
                      background: '#f8fafc',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : (
                <h2
                  style={{
                    textAlign: 'center',
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#198754',
                    margin: '0 0 4px 0',
                  }}
                >
                  {displayClientHeading}
                </h2>
              )}

              {/* 3. Subtitle / Service Scope line (Editable) */}
              {isEditing ? (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>
                    Proposal Subtitle / Category:
                  </label>
                  <input
                    type="text"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="Subtitle..."
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#555',
                      padding: '4px 10px',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 6,
                      background: '#f8fafc',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#555',
                    margin: '0 0 22px 0',
                  }}
                >
                  {displayClientHeading ? `${displayClientHeading} – ` : ''}{subTitle}
                </p>
              )}

              {/* Key Info Meta Table */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: 24,
                  fontSize: 13,
                  border: '1px solid #198754',
                }}
              >
                <tbody>
                  {/* Submitted To Row */}
                  <tr>
                    <th
                      style={{
                        width: '24%',
                        border: '1px solid #198754',
                        padding: '10px 12px',
                        background: '#e9f7ef',
                        fontWeight: 700,
                        textAlign: 'left',
                        verticalAlign: 'top',
                      }}
                    >
                      Submitted To
                    </th>
                    <td style={{ border: '1px solid #198754', padding: '10px 12px', lineHeight: 1.6 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {/* Category Radio */}
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#016139', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="targetTypeRadio"
                                checked={targetType === 'lead'}
                                onChange={() => setTargetType('lead')}
                              />
                              Sales Lead (Prospect)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#016139', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="targetTypeRadio"
                                checked={targetType === 'client'}
                                onChange={() => setTargetType('client')}
                              />
                              Client Profile
                            </label>
                          </div>

                          {/* Select Dropdown */}
                          {targetType === 'lead' ? (
                            <select
                              value={selectedLeadId}
                              onChange={(e) => setSelectedLeadId(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                                fontSize: 13,
                                outline: 'none',
                                background: '#f8fafc',
                                color: '#0f172a',
                                fontWeight: 600,
                              }}
                            >
                              <option value="">-- Select Sales Lead --</option>
                              {leads.map(l => (
                                <option key={l._id} value={l._id}>
                                  {l.name} {l.company ? `(${l.company})` : ''} - {l.email || l.phone || ''}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={selectedClientId}
                              onChange={(e) => setSelectedClientId(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                                fontSize: 13,
                                outline: 'none',
                                background: '#f8fafc',
                                color: '#0f172a',
                                fontWeight: 600,
                              }}
                            >
                              <option value="">-- Select Converted Client --</option>
                              {clients.map(c => (
                                <option key={c._id} value={c._id}>
                                  {c.name} {c.company ? `(${c.company})` : ''} - {c.email || c.phone || ''}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Live Target Summary Preview */}
                          <div style={{ fontSize: 12, color: '#334155', background: '#f1f5f9', padding: '6px 10px', borderRadius: 4, lineHeight: 1.5 }}>
                            <strong>Company:</strong> {displayClientHeading || 'N/A'} | <strong>Contact:</strong> {autoTargetName} | <strong>Email:</strong> {targetEmail || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <strong>{displayClientHeading}</strong><br />
                          <strong>Client Contact:</strong> {autoTargetName}<br />
                          {targetPhone && <><strong>Mobile:</strong> {targetPhone}<br /></>}
                          {targetEmail && <><strong>Email:</strong> {targetEmail}<br /></>}
                          <strong>Quotation Reference:</strong> {quotation ? quotation.quotationNo : 'NEW PROPOSAL'}
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Submitted By Row */}
                  <tr>
                    <th
                      style={{
                        border: '1px solid #198754',
                        padding: '10px 12px',
                        background: '#e9f7ef',
                        fontWeight: 700,
                        textAlign: 'left',
                        verticalAlign: 'top',
                      }}
                    >
                      Submitted By
                    </th>
                    <td style={{ border: '1px solid #198754', padding: '10px 12px', lineHeight: 1.6 }}>
                      <strong>HiveRift Softwares Pvt. Ltd.</strong><br />
                      Website Development | Custom CRM/ERP | Fullstack Web Apps | Cloud & Automation Solutions<br />
                      <strong>Contact:</strong> +91 88149 30229 • <strong>Email:</strong> info@hiverift.com<br />
                      <strong>Website:</strong> <a href="https://www.hiverift.com" target="_blank" rel="noreferrer" style={{ color: '#198754', fontWeight: 'bold', textDecoration: 'none' }}>www.hiverift.com</a>
                    </td>
                  </tr>

                  {/* Date & Validity Row */}
                  <tr>
                    <th
                      style={{
                        border: '1px solid #198754',
                        padding: '10px 12px',
                        background: '#e9f7ef',
                        fontWeight: 700,
                        textAlign: 'left',
                      }}
                    >
                      Date & Validity
                    </th>
                    <td style={{ border: '1px solid #198754', padding: '10px 12px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span><strong>Issue Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <strong>Valid Until:</strong>
                            <input
                              type="date"
                              value={validUntil}
                              onChange={(e) => setValidUntil(e.target.value)}
                              style={{
                                padding: '4px 8px',
                                fontSize: 12,
                                border: '1px solid #cbd5e1',
                                borderRadius: 4,
                                outline: 'none',
                              }}
                            />
                          </span>
                        </div>
                      ) : (
                        <div>
                          <strong>Issue Date:</strong> {new Date(quotation?.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • <strong>Valid Until:</strong> {new Date(validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 1. EXECUTIVE SUMMARY & OBJECTIVES */}
              <div style={{ marginBottom: 12 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 18, background: '#198754' }} />
                    <input
                      type="text"
                      value={section1Title}
                      onChange={(e) => setSection1Title(e.target.value)}
                      placeholder="Section 1 Heading"
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#111',
                        border: '1px dashed #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 8px',
                        outline: 'none',
                        width: '100%',
                        background: '#f8fafc',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 24,
                      marginBottom: 10,
                      paddingLeft: 10,
                      borderLeft: '5px solid #198754',
                      color: '#111',
                    }}
                  >
                    {section1Title}
                  </div>
                )}

                {isEditing ? (
                  <textarea
                    rows={4}
                    value={executiveSummary}
                    onChange={(e) => setExecutiveSummary(e.target.value)}
                    placeholder="Enter executive proposal summary..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 13,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      outline: 'none',
                      lineHeight: 1.6,
                      color: '#334155',
                      boxSizing: 'border-box',
                      marginBottom: 20,
                    }}
                  />
                ) : (
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 20px 0', textAlign: 'justify' }}>
                    {executiveSummary}
                  </p>
                )}
              </div>

              {/* 2. SCOPE OF WORK & COMMERCIAL DELIVERABLES */}
              <div style={{ marginBottom: 12 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <div style={{ width: 5, height: 18, background: '#198754' }} />
                      <input
                        type="text"
                        value={section2Title}
                        onChange={(e) => setSection2Title(e.target.value)}
                        placeholder="Section 2 Heading"
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#111',
                          border: '1px dashed #cbd5e1',
                          borderRadius: 4,
                          padding: '3px 8px',
                          outline: 'none',
                          width: '70%',
                          background: '#f8fafc',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddService}
                      style={{
                        background: '#198754',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Plus size={13} /> Add Deliverable Row
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 24,
                      marginBottom: 10,
                      paddingLeft: 10,
                      borderLeft: '5px solid #198754',
                      color: '#111',
                    }}
                  >
                    {section2Title}
                  </div>
                )}
              </div>

              {/* Deliverables Table */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: 20,
                  fontSize: 13.5,
                  border: '1px solid #198754',
                }}
              >
                <thead>
                  <tr style={{ background: '#e9f7ef' }}>
                    <th style={{ width: '40px', border: '1px solid #198754', padding: '10px 8px', textAlign: 'center' }}>#</th>
                    <th style={{ border: '1px solid #198754', padding: '10px 12px', textAlign: 'left' }}>Deliverable Description & Scope</th>
                    <th style={{ width: '70px', border: '1px solid #198754', padding: '10px 8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '120px', border: '1px solid #198754', padding: '10px 10px', textAlign: 'right' }}>Unit Rate (₹)</th>
                    <th style={{ width: '120px', border: '1px solid #198754', padding: '10px 10px', textAlign: 'right' }}>Amount (₹)</th>
                    {isEditing && <th style={{ width: '36px', border: '1px solid #198754', padding: '10px 4px', textAlign: 'center' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {services.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #198754', padding: '8px', textAlign: 'center', fontWeight: 700 }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: '1px solid #198754', padding: '8px 10px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                              placeholder="Deliverable Name / Title"
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: 13,
                                fontWeight: 700,
                                border: '1px solid #cbd5e1',
                                borderRadius: 4,
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                            <textarea
                              rows={2}
                              value={item.description}
                              onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                              placeholder="Scope specifications, tech stack, deliverables..."
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: 12,
                                border: '1px solid #cbd5e1',
                                borderRadius: 4,
                                outline: 'none',
                                color: '#475569',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        ) : (
                          <div>
                            <strong>{item.name}</strong>
                            {item.description && (
                              <div style={{ fontSize: 12, color: '#555', marginTop: 2, whiteSpace: 'pre-line' }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ border: '1px solid #198754', padding: '8px', textAlign: 'center' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleServiceChange(idx, 'quantity', e.target.value)}
                            style={{
                              width: '50px',
                              padding: '4px 6px',
                              fontSize: 12.5,
                              textAlign: 'center',
                              border: '1px solid #cbd5e1',
                              borderRadius: 4,
                              outline: 'none',
                            }}
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td style={{ border: '1px solid #198754', padding: '8px 10px', textAlign: 'right' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) => handleServiceChange(idx, 'rate', e.target.value)}
                            style={{
                              width: '95px',
                              padding: '4px 6px',
                              fontSize: 12.5,
                              textAlign: 'right',
                              border: '1px solid #cbd5e1',
                              borderRadius: 4,
                              outline: 'none',
                            }}
                          />
                        ) : (
                          `₹${Number(item.rate || 0).toLocaleString()}`
                        )}
                      </td>
                      <td style={{ border: '1px solid #198754', padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#198754' }}>
                        ₹{Number(item.amount || (item.quantity * item.rate) || 0).toLocaleString()}
                      </td>
                      {isEditing && (
                        <td style={{ border: '1px solid #198754', padding: '4px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(idx)}
                            disabled={services.length === 1}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: services.length === 1 ? '#cbd5e1' : '#ef4444',
                              cursor: services.length === 1 ? 'not-allowed' : 'pointer',
                              padding: 2,
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}

                  {/* Subtotal Base Fee */}
                  <tr style={{ background: '#f8fafc', fontWeight: 600 }}>
                    <td colSpan={isEditing ? 5 : 4} style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'right' }}>
                      Subtotal Base Fee:
                    </td>
                    <td style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                      ₹{subtotal.toLocaleString()}
                    </td>
                  </tr>

                  {/* Discount */}
                  {(isEditing || discountVal > 0) && (
                    <tr style={{ background: '#ECFDF5', color: '#047857' }}>
                      <td colSpan={isEditing ? 5 : 4} style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                            <span>Special Promotional Discount (₹):</span>
                            <input
                              type="number"
                              min="0"
                              value={discount}
                              onChange={(e) => setDiscount(e.target.value)}
                              style={{ width: 80, padding: '3px 6px', fontSize: 12, border: '1px solid #a7f3d0', borderRadius: 4 }}
                            />
                          </div>
                        ) : (
                          'Special Promotional Discount:'
                        )}
                      </td>
                      <td style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                        -₹{discountVal.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {/* GST Tax */}
                  <tr>
                    <td colSpan={isEditing ? 5 : 4} style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                          <span>GST Tax (%):</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={taxPercent}
                            onChange={(e) => setTaxPercent(e.target.value)}
                            style={{ width: 55, padding: '3px 6px', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4 }}
                          />
                        </div>
                      ) : (
                        `GST Tax (${taxPercent}%):`
                      )}
                    </td>
                    <td style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                      +₹{taxAmount.toLocaleString()}
                    </td>
                  </tr>

                  {/* Total Project Investment */}
                  <tr style={{ background: '#d1e7dd', fontWeight: 800 }}>
                    <td colSpan={isEditing ? 5 : 4} style={{ border: '1px solid #198754', padding: '12px 14px', textAlign: 'right', fontSize: 15, color: '#0f5132' }}>
                      {templateType === 'social_media' ? 'Total Monthly Investment (incl. GST):' : 'Total Project Investment (incl. GST):'}
                    </td>
                    <td style={{ border: '1px solid #198754', padding: '12px 14px', textAlign: 'right', fontSize: 17, color: '#0f5132', fontWeight: 900 }}>
                      ₹{totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Commercial Terms & Notes Box */}
              <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: '14px 18px', borderRadius: 6, color: '#66512c', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
                <strong>Commercial Terms & Milestones:</strong><br />
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Milestone schedule, advance terms, warranty clauses..."
                    style={{
                      width: '100%',
                      marginTop: 6,
                      padding: '8px 10px',
                      fontSize: 12.5,
                      border: '1px solid #fde047',
                      borderRadius: 4,
                      outline: 'none',
                      background: '#fffbeb',
                      color: '#78350f',
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <div style={{ whiteSpace: 'pre-line', marginTop: 4 }}>
                    {notes}
                  </div>
                )}
              </div>

              {/* 3. OFFICIAL BANK DETAILS */}
              <div style={{ marginBottom: 12 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 18, background: '#198754' }} />
                    <input
                      type="text"
                      value={section3Title}
                      onChange={(e) => setSection3Title(e.target.value)}
                      placeholder="Section 3 Heading"
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#111',
                        border: '1px dashed #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 8px',
                        outline: 'none',
                        width: '100%',
                        background: '#f8fafc',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 24,
                      marginBottom: 10,
                      paddingLeft: 10,
                      borderLeft: '5px solid #198754',
                      color: '#111',
                    }}
                  >
                    {section3Title}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 24,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: 15, borderBottom: '1px solid #334155', paddingBottom: 8 }}>
                  HiveRift Softwares Pvt Ltd – Bank Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13.5, color: '#f8fafc' }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Account Holder Name</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>HiveRift Software's Pvt Ltd</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Bank Name</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>ICICI Bank</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Account Number</div>
                    <div style={{ fontWeight: 800, marginTop: 2, letterSpacing: 1, color: '#f8fafc', fontSize: 15 }}>755605000722</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>IFSC Code</div>
                    <div style={{ fontWeight: 800, marginTop: 2, letterSpacing: 0.5, color: '#f8fafc', fontSize: 15 }}>ICIC0007556</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid #334155', paddingTop: 10 }}>
                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Corporate UPI ID</div>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: 2, fontSize: 15 }}>MSHIVERIFTSOFTWARESPVTLTD.eazypay@icici</div>
                  </div>
                </div>
              </div>

              {/* 4. TERMS & CONDITIONS */}
              <div style={{ marginBottom: 12 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 18, background: '#198754' }} />
                    <input
                      type="text"
                      value={section4Title}
                      onChange={(e) => setSection4Title(e.target.value)}
                      placeholder="Section 4 Heading"
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#111',
                        border: '1px dashed #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 8px',
                        outline: 'none',
                        width: '100%',
                        background: '#f8fafc',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 24,
                      marginBottom: 10,
                      paddingLeft: 10,
                      borderLeft: '5px solid #198754',
                      color: '#111',
                    }}
                  >
                    {section4Title}
                  </div>
                )}

                {isEditing ? (
                  <textarea
                    rows={5}
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    placeholder="Enter terms and conditions (one per line)..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 12.5,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      outline: 'none',
                      lineHeight: 1.6,
                      color: '#334155',
                      boxSizing: 'border-box',
                      marginBottom: 20,
                    }}
                  />
                ) : (
                  <div style={{ paddingLeft: 10, fontSize: 13, color: '#334155', lineHeight: 1.8, marginBottom: 28, whiteSpace: 'pre-line' }}>
                    {termsAndConditions}
                  </div>
                )}
              </div>

              {/* 5. ACCEPTANCE & AUTHORIZATION SIGNATURES */}
              <div style={{ marginBottom: 12 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 18, background: '#198754' }} />
                    <input
                      type="text"
                      value={section5Title}
                      onChange={(e) => setSection5Title(e.target.value)}
                      placeholder="Section 5 Heading"
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#111',
                        border: '1px dashed #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 8px',
                        outline: 'none',
                        width: '100%',
                        background: '#f8fafc',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 24,
                      marginBottom: 16,
                      paddingLeft: 10,
                      borderLeft: '5px solid #198754',
                      color: '#111',
                    }}
                  >
                    {section5Title}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, borderTop: '2px dashed #cbd5e1', paddingTop: 24, marginTop: 16 }}>
                <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', padding: 18, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 35, fontSize: 13.5 }}>
                    For {displayClientHeading}
                  </div>
                  <div style={{ borderBottom: '1px solid #94a3b8', marginBottom: 8 }} />
                  <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                    <strong>Client Authorized Signature & Stamp</strong><br />
                    <strong>Name:</strong> {autoTargetName}<br />
                    <strong>Date:</strong> ________________________
                  </div>
                </div>

                <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', padding: 18, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 35, fontSize: 13.5 }}>
                    For HiveRift Softwares Pvt. Ltd.
                  </div>
                  <div style={{ borderBottom: '1px solid #94a3b8', marginBottom: 8 }} />
                  <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                    <strong>Authorized Signatory</strong><br />
                    <strong>Contact:</strong> +91 88149 30229<br />
                    <strong>Email:</strong> info@hiverift.com • <strong>Web:</strong> www.hiverift.com
                  </div>
                </div>
              </div>

              {/* Footer Quote (Editable) */}
              {isEditing ? (
                <div style={{ marginTop: 24 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>
                    Footer Quote:
                  </label>
                  <input
                    type="text"
                    value={footerQuote}
                    onChange={(e) => setFooterQuote(e.target.value)}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      fontSize: 12,
                      color: '#64748b',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 4,
                      padding: '4px 8px',
                      outline: 'none',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#64748b', marginTop: 30, fontSize: 12.5 }}>
                  {footerQuote}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
