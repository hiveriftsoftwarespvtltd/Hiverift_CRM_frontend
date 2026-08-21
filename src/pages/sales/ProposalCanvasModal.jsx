import { useState, useEffect } from 'react';
import {
  FileText, Printer, Send, Edit3, Eye, Trash2, Plus, X, Building, User, Mail, Phone, Calendar, Check, Save, Sparkles, Globe, Megaphone, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { quotationsAPI } from '../../api';
import Swal from 'sweetalert2';
import { HIVERIFT_LOGO_BASE64 } from '../../assets/logoBase64';

export const PROPOSAL_CATEGORIES = [
  {
    id: 'website_dev',
    title: '1. Website & Development',
    icon: '🌐',
    subtitle: 'Custom Web Apps, E-Commerce Stores, IT Software & Landing Pages',
    color: '#016139',
    bgColor: '#E8F5F0',
    templates: [
      'custom_web_app',
      'ecommerce_website',
      'it_software_dev',
      'landing_page',
      'portfolio_website',
    ]
  },
  {
    id: 'social_ads',
    title: '2. Social Media & Advertisement',
    icon: '📣',
    subtitle: 'Meta Ads, Google Ads, Multi-Platform Advertising & Local SEO Lead Gen',
    color: '#2563EB',
    bgColor: '#EAF3FF',
    templates: [
      'facebook_instagram_ads',
      'google_ads',
      'multi_platform_ads',
      'seo_local_lead_gen',
      'seo_growth_marketing',
    ]
  }
];

export const TEMPLATE_OPTIONS = [
  // CATEGORY 1: WEBSITE & DEVELOPMENT
  {
    id: 'custom_web_app',
    category: 'website_dev',
    title: 'Custom Web Application Website Proposal',
    headerTitle: 'CUSTOM WEB APPLICATION WEBSITE PROPOSAL',
    subTitle: 'Custom Business Software, Workflows & Digital Solutions',
    headline: 'Custom Functionality • User Roles • Admin Panel • Automation',
    defaultServices: [
      {
        name: 'Custom Web Application Design & Development',
        description: 'Custom Business Modules, Workflow Automation, Multi-role RBAC & Admin Panel',
        quantity: 1,
        rate: 45000,
        amount: 45000
      },
      {
        name: 'Hosting / Server – 1 Year',
        description: 'High-speed cloud server, SSL certificate configuration, database backup & maintenance',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Third-Party API & Gateway Integrations',
        description: 'Payment gateway, WhatsApp API, Email/SMS notifications & Google analytics setup',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. proposes to design and develop a custom web application built around the client\'s specific business processes, operational requirements and growth objectives. Unlike a standard website, the proposed web application includes custom business functionality, user roles, administrative controls, automated workflows, third-party integrations and scalable database architecture.',
    defaultNotes: '1. 100% Advance Payment required before project initiation.\n2. Timeline: Estimated 15–30 Working Days based on approved scope.\n3. Complimentary 30 days post-deployment technical support & bug fixing included.',
    defaultTerms: '1. Payment Terms: 100% Advance Payment required before project initiation.\n2. Scope Approval: Final modules, user roles, workflows and tech stack confirmed post requirement analysis.\n3. Intellectual Property: 100% source code and admin credentials handed over upon completion.\n4. Exclusions: Domain renewal, paid third-party API/gateway fees and ongoing monthly server costs beyond included package.',
    defaultQuote: '"Build a secure and scalable web-based business solution that simplifies operations and centralizes workflows."'
  },
  {
    id: 'ecommerce_website',
    category: 'website_dev',
    title: 'E-Commerce Website Proposal',
    headerTitle: 'E-COMMERCE WEBSITE PROPOSAL',
    subTitle: 'Complete Online Store & E-Commerce Solution',
    headline: 'Online Store • Product Catalogue • Shopping Cart • Order Management',
    defaultServices: [
      {
        name: 'E-Commerce Website Design & Development',
        description: 'Product Catalogue, Shopping Cart, Wishlist, User Accounts & Responsive UI',
        quantity: 1,
        rate: 35000,
        amount: 35000
      },
      {
        name: 'Hosting – 1 Year',
        description: 'Secure SSL, 1 Year Web Hosting & Server Setup',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Online Payment Gateway & Shipping Setup',
        description: 'UPI, Credit/Debit Cards, NetBanking, Order Management & Invoice Generator',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. proposes to design and develop a professional, secure and responsive E-Commerce Website. The solution provides a complete online shopping platform where customers can discover products, view details, add to cart, place orders, pay online and receive automated order updates.',
    defaultNotes: '1. Payment Terms: 30% Advance for project initiation, 70% Final Payment before final handover/go-live.\n2. Delivery Timeline: 10–20 Working Days.\n3. Includes 30 Days bug fixes & basic admin handover training.',
    defaultTerms: '1. Payment Terms: 30% Advance to start, 70% before go-live.\n2. Catalogue Upload: Basic product upload included; bulk uploading available as add-on.\n3. Third-Party Gateway: Payment gateway account setup & transaction fees billed directly by payment provider.\n4. Support: 30 Days technical warranty post launch.',
    defaultQuote: '"Build a scalable online store focused on product discovery, customer experience, secure transactions and online sales."'
  },
  {
    id: 'it_software_dev',
    category: 'website_dev',
    title: 'IT & Software Website Proposal',
    headerTitle: 'IT & SOFTWARE DEVELOPMENT PROPOSAL',
    subTitle: 'IT Solutions, Software Development & Technology Services',
    headline: 'Software Development • Web Applications • Mobile Apps • IT Solutions',
    defaultServices: [
      {
        name: 'IT / Software Development & Web Application',
        description: 'Custom Enterprise Software, Web App, Portal & Modular Business System',
        quantity: 1,
        rate: 50000,
        amount: 50000
      },
      {
        name: 'Hosting / Server – 1 Year',
        description: 'High-availability server infrastructure, SSL & database configuration',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Third-Party API & System Integration',
        description: 'CRM/ERP connectors, WhatsApp API, Payment Gateway & Custom Webhooks',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. provides professional IT & Software Development solutions for businesses requiring reliable technology systems, custom software, web applications, mobile applications and digital platforms tailored to business objectives, user roles, integrations and future scalability.',
    defaultNotes: '1. 100% Advance Payment required before project initiation.\n2. Timeline: Determined after technical scope approval.\n3. Includes Admin Handover, SSL & Technical Support as per package.',
    defaultTerms: '1. Payment Terms: 100% Advance Payment before project initiation.\n2. Deliverables: Full admin panel, database architecture, user credentials and source code handover.\n3. Maintenance: Post-launch bug fixing & maintenance included as per contract agreement.',
    defaultQuote: '"Deliver a reliable, secure and scalable technology solution that supports business operations and digital growth."'
  },
  {
    id: 'landing_page',
    category: 'website_dev',
    title: 'Landing Page Website Proposal',
    headerTitle: 'LANDING PAGE WEBSITE PROPOSAL',
    subTitle: 'High-Converting Sales & Lead Generation Landing Page',
    headline: 'Lead Generation • High Conversion • Mobile Responsive • Fast Loading',
    defaultServices: [
      {
        name: 'High-Converting Landing Page Design & Development',
        description: 'Single-Page Conversion Funnel, Hero Section, CTA, Reviews & Lead Capture Form',
        quantity: 1,
        rate: 15000,
        amount: 15000
      },
      {
        name: 'Hosting & SSL – 1 Year',
        description: 'Fast cloud hosting, SSL security & speed optimization',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Lead Capture Form & WhatsApp API Integration',
        description: 'Direct email notifications, WhatsApp instant chat & Meta Pixel/GTM tracking',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. proposes to build a high-speed, high-converting Landing Page specifically engineered to capture lead data, boost ad conversion rates, and showcase key products/services with maximum impact.',
    defaultNotes: '1. Payment: 50% Advance, 50% on Completion.\n2. Timeline: 5–7 Working Days.\n3. Complimentary 30 Days support & form testing.',
    defaultTerms: '1. Payment Schedule: 50% Advance to start, 50% on live handover.\n2. Content: Client to provide text content & logos (copywriting available as add-on).\n3. Integrations: WhatsApp click-to-chat & lead form email alerts included.',
    defaultQuote: '"Maximize ad campaign conversions with ultra-fast, mobile-optimized lead generation landing pages."'
  },
  {
    id: 'portfolio_website',
    category: 'website_dev',
    title: 'Portfolio Website Proposal',
    headerTitle: 'PORTFOLIO WEBSITE PROPOSAL',
    subTitle: 'Personal, Professional & Corporate Portfolio Website',
    headline: 'Brand Showcase • Work Portfolio • Responsive Design • Lead Capture',
    defaultServices: [
      {
        name: 'Professional Portfolio Website Design & Development',
        description: 'Dynamic Project Showcase, Gallery, About Section, Client Testimonials & Contact Form',
        quantity: 1,
        rate: 18000,
        amount: 18000
      },
      {
        name: 'Hosting & SSL – 1 Year',
        description: '1 Year premium web hosting, SSL certificate & custom domain setup support',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Dynamic Project Showcase & Contact Integration',
        description: 'Interactive work filter, case study popups & WhatsApp / Email lead capture',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. proposes to design a stunning, modern Portfolio Website for showcasing individual or company projects, client testimonials, services, and creative achievements to win new clients and establish elite brand authority.',
    defaultNotes: '1. Payment: 50% Advance, 50% on Handover.\n2. Timeline: 7–10 Working Days.\n3. Includes 30 Days post-launch support.',
    defaultTerms: '1. Payment Terms: 50% Advance, 50% before final handover.\n2. Asset Submission: Client to provide project images & text details.\n3. Mobile Responsive: 100% fluid design across mobiles, tablets & laptops.',
    defaultQuote: '"Showcase your work, build trust, and turn visitors into high-paying clients with a premium portfolio."'
  },

  // CATEGORY 2: SOCIAL MEDIA & ADVERTISEMENT
  {
    id: 'facebook_instagram_ads',
    category: 'social_ads',
    title: 'Facebook & Instagram Ads Proposal',
    headerTitle: 'FACEBOOK & INSTAGRAM ADS PROPOSAL',
    subTitle: 'Meta Advertising, Lead Generation & Brand Awareness Campaigns',
    headline: 'Meta Ads • Targeted Campaigns • Lead Generation • Creative Ad Strategy',
    defaultServices: [
      {
        name: 'Facebook & Instagram Ads Management (Monthly)',
        description: 'Audience Research, Campaign Setup, Daily Optimization & Budget Allocation',
        quantity: 1,
        rate: 12000,
        amount: 12000
      },
      {
        name: 'Creative Ad Copies, Banners & Reels Design',
        description: 'High-converting ad copy, visual design, promo banners & reel ad creatives',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Meta Pixel, Lead Forms & Conversion Tracking',
        description: 'Custom lead forms, retargeting audience setup & Meta Pixel integration',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. offers end-to-end performance marketing on Facebook & Instagram designed to build brand authority and generate qualified business leads through hyper-targeted ad funnels, A/B testing, and data-driven audience optimization.',
    defaultNotes: '1. Monthly Management Fee is payable 100% in advance.\n2. Meta Ad spend budget is separate and billed directly to client\'s Meta Ad Account.\n3. Recommended minimum commitment of 3 months for optimal ROI.',
    defaultTerms: '1. Payment: Monthly retainer fee payable 100% in advance.\n2. Ad Budget: Meta ad spend budget is paid directly by client to Meta.\n3. Access: Client will grant partner access to Facebook Page, Instagram & Meta Ad Manager.\n4. Reporting: Transparent monthly analytics & performance summaries.',
    defaultQuote: '"Empowering growing businesses through targeted Meta ad campaigns and creative audience funnels."'
  },
  {
    id: 'google_ads',
    category: 'social_ads',
    title: 'Google Ads Proposal',
    headerTitle: 'GOOGLE ADS (PPC) CAMPAIGN PROPOSAL',
    subTitle: 'Search, Display & Performance Max Campaigns for High-Intent Leads',
    headline: 'High-Intent Search Ads • Display & Video • Conversion Tracking • ROI Focus',
    defaultServices: [
      {
        name: 'Google Search & Display Ads Setup & Optimization (Monthly)',
        description: 'Keyword Research, Search Ads, Display Banners, Negative Keywords & Bidding Strategy',
        quantity: 1,
        rate: 15000,
        amount: 15000
      },
      {
        name: 'Keyword Research & High-CTR Copywriting',
        description: 'In-depth buyer intent keyword analysis, negative keywords list & ad extensions',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Google Tag Manager & Conversion Tracking Setup',
        description: 'Call tracking, lead form submit tracking & Analytics goal setup',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. provides ROI-driven Google Ads management to capture customers at the exact moment they search for your services. We build high-intent Search, Display, and Performance Max campaigns with precision tracking.',
    defaultNotes: '1. Management Fee payable 100% in advance each month.\n2. Google Ad spend budget is paid directly to Google by client.\n3. Monthly performance analytics & keyword reports provided.',
    defaultTerms: '1. Retainer: Monthly fee paid 100% in advance.\n2. Ad Spend: Direct payment to Google via client\'s billing profile.\n3. Optimization: Weekly bid, keyword & negative keyword optimizations.',
    defaultQuote: '"Capture high-intent buyers on Google Search at the precise moment they are looking for your services."'
  },
  {
    id: 'multi_platform_ads',
    category: 'social_ads',
    title: 'Multi-Platform Advertising Proposal',
    headerTitle: 'MULTI-PLATFORM ADVERTISING & DIGITAL GROWTH PROPOSAL',
    subTitle: 'Meta Ads, Google Ads, LinkedIn & Omnichannel Marketing',
    headline: 'Meta Ads • Google Ads • LinkedIn • Omnichannel Funnel & Lead Gen',
    defaultServices: [
      {
        name: 'Multi-Platform Ad Campaign Strategy & Management (Monthly)',
        description: 'Omnichannel campaign management across Meta, Google & LinkedIn Ads',
        quantity: 1,
        rate: 25000,
        amount: 25000
      },
      {
        name: 'Multi-Channel Ad Creatives, Copies & Video Ads',
        description: 'Cross-platform graphics, copy variants, video ad edits & banner sizing',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Cross-Platform Conversion Funnel & Daily Optimization',
        description: 'Unified tracking, retargeting funnels, A/B testing & weekly optimizations',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. delivers an aggressive 360-degree digital advertising strategy across Facebook, Instagram, Google Search, YouTube, and LinkedIn to maximize lead volume, lower cost-per-lead, and build dominant market presence.',
    defaultNotes: '1. Monthly retainer fee payable 100% in advance.\n2. Platform ad spend budgets are paid directly by client to respective platforms.\n3. Includes weekly performance updates & monthly strategic reviews.',
    defaultTerms: '1. Retainer: Paid 100% in advance monthly.\n2. Budget Allocation: Managed across platforms based on real-time cost-per-lead performance.\n3. Reports: Comprehensive multi-channel ROI reporting dashboard.',
    defaultQuote: '"Dominate your industry with a synchronized multi-platform advertising funnel."'
  },
  {
    id: 'seo_local_lead_gen',
    category: 'social_ads',
    title: 'SEO Growth & Local SEO Lead Generation Proposal',
    headerTitle: 'SEO GROWTH, LOCAL SEO & LEAD GENERATION PROPOSAL',
    subTitle: 'Rank Higher on Google, Google Business Profile & Local Customer Growth',
    headline: 'Organic Rankings • Local SEO • GMB Optimization • High Intent Leads',
    defaultServices: [
      {
        name: 'Local SEO & Google Business Profile Optimization (Monthly)',
        description: 'GMB Optimization, Local Maps Ranking, Citation Building & Local Keyword SEO',
        quantity: 1,
        rate: 10000,
        amount: 10000
      },
      {
        name: 'On-Page SEO & Local Directory Citations',
        description: 'Meta tags, local schema markup, Geo-tagged image optimization & directory listings',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Monthly Keyword Ranking & Search Console Analytics',
        description: 'Google Maps rank tracking, organic call/lead tracking & monthly performance report',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. specializes in Local SEO & Google Business Profile optimization to get your business in the Top 3 Google Map Pack results, driving organic local phone calls, store visits, and high-intent customer enquiries.',
    defaultNotes: '1. Monthly Retainer payable 100% in advance.\n2. Recommended 3-6 months commitment for stable organic Google Maps ranking.\n3. Includes monthly keyword position tracking reports.',
    defaultTerms: '1. Payment: Paid 100% in advance on monthly cycle.\n2. Commitment: 3-6 months recommended for search engine ranking growth.\n3. Deliverables: GMB posts, local citations, review strategy & technical schema.',
    defaultQuote: '"Dominate local search results and get discovered by nearby customers when they need your services."'
  },
  {
    id: 'seo_growth_marketing',
    category: 'social_ads',
    title: 'SEO Growth & Marketing Proposal',
    headerTitle: 'SEO GROWTH & CONTENT MARKETING PROPOSAL',
    subTitle: 'Comprehensive Organic Traffic, Backlinks & Authority Building',
    headline: 'Organic Traffic • Keyword Authority • Backlink Building • Technical SEO',
    defaultServices: [
      {
        name: 'Enterprise SEO Growth & Technical Optimization (Monthly)',
        description: 'In-Depth Technical SEO Audit, On-Page Optimization, Site Speed & Keyword Mapping',
        quantity: 1,
        rate: 20000,
        amount: 20000
      },
      {
        name: 'Content Marketing & High DA Backlink Acquisition',
        description: 'SEO-optimized articles/blogs, guest posts, high-authority backlink outreach',
        quantity: 1,
        rate: 0,
        amount: 0
      },
      {
        name: 'Speed & Traffic Growth Reports',
        description: 'Core Web Vitals tuning, monthly organic traffic breakdown & position tracking',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    defaultExecutiveSummary: 'HiveRift Softwares Pvt. Ltd. delivers long-term organic growth and domain authority through technical website SEO, strategic content marketing, high-DA backlink building, and mobile performance optimization.',
    defaultNotes: '1. Payable 100% in advance monthly.\n2. 6-month recommended campaign for sustainable organic traffic growth.\n3. Monthly Google Search Console & Analytics reporting included.',
    defaultTerms: '1. Retainer: Monthly advance payment.\n2. Deliverables: Technical audit fixes, on-page SEO, content creation & high DA link building.\n3. Results: Long-term compounding organic traffic without ongoing ad spend.',
    defaultQuote: '"Build permanent organic search engine authority that delivers high-intent leads day after day."'
  }
];

export const resolveTemplateId = (id) => {
  if (id === 'sales_standard') return 'custom_web_app';
  if (id === 'social_media') return 'facebook_instagram_ads';
  return id || 'custom_web_app';
};

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

  // Category & Template State
  const [selectedCategory, setSelectedCategory] = useState('website_dev'); // 'website_dev' | 'social_ads'
  const [templateType, setTemplateType] = useState('custom_web_app');
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
        const resolvedId = resolveTemplateId(quotation.templateType);
        const foundTpl = TEMPLATE_OPTIONS.find(t => t.id === resolvedId) || TEMPLATE_OPTIONS[0];

        setTemplateType(foundTpl.id);
        setSelectedCategory(foundTpl.category);
        setHeaderTitle(quotation.headerTitle || foundTpl.headerTitle);
        setSubTitle(quotation.subTitle || foundTpl.subTitle);
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

        setExecutiveSummary(quotation.executiveSummary || foundTpl.defaultExecutiveSummary);
        setNotes(quotation.notes || foundTpl.defaultNotes);
        setTermsAndConditions(quotation.termsAndConditions || foundTpl.defaultTerms);
        setFooterQuote(quotation.footerQuote || foundTpl.defaultQuote);

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
          setServices(foundTpl.defaultServices.map(s => ({ ...s })));
        }
      } else {
        // New proposal defaults
        const defaultTpl = TEMPLATE_OPTIONS[0];
        setTemplateType(defaultTpl.id);
        setSelectedCategory(defaultTpl.category);
        setTargetType('lead');
        setSelectedLeadId('');
        setSelectedClientId('');
        setHeaderTitle(defaultTpl.headerTitle);
        setSubTitle(defaultTpl.subTitle);
        setCustomClientHeading('');
        setSection1Title('1. EXECUTIVE SUMMARY & OBJECTIVES');
        setSection2Title('2. SCOPE OF WORK & COMMERCIAL DELIVERABLES');
        setSection3Title('3. OFFICIAL BANK DETAILS FOR WIRE / UPI TRANSFER');
        setSection4Title('4. TERMS & CONDITIONS');
        setSection5Title('5. ACCEPTANCE & AUTHORIZATION');
        setExecutiveSummary(defaultTpl.defaultExecutiveSummary);
        setNotes(defaultTpl.defaultNotes);
        setTermsAndConditions(defaultTpl.defaultTerms);
        setFooterQuote(defaultTpl.defaultQuote);
        setValidUntil(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
        setDiscount(0);
        setTaxPercent(18);
        setServices(defaultTpl.defaultServices.map(s => ({ ...s })));
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
    const resolved = resolveTemplateId(type);
    setTemplateType(resolved);
    const tpl = TEMPLATE_OPTIONS.find(t => t.id === resolved) || TEMPLATE_OPTIONS[0];
    setSelectedCategory(tpl.category);
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

  const handleDownloadHtml = () => {
    const element = document.getElementById('printable-proposal-sheet');
    if (!element) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>${quotation ? quotation.quotationNo : 'Quotation'}_${(headerTitle || 'Proposal').replace(/\s+/g, '_')}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #212121; -webkit-text-size-adjust: 100%; }
  body { padding: 24px 12px; display: flex; justify-content: center; }
  .proposal-sheet-container { width: 100%; max-width: 860px; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow: hidden; }
  .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; word-break: break-word; }
  th, td { border: 1px solid #198754; padding: 8px 12px; vertical-align: top; }
  th { background-color: #e9f7ef; text-align: left; font-size: 13px; }
  img { max-width: 100%; height: auto; display: block; }
  
  /* Mobile Responsive Media Queries */
  @media (max-width: 680px) {
    body { padding: 6px 4px !important; }
    .proposal-sheet-container { border-radius: 6px !important; box-shadow: none !important; }
    .company-header-flex { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 12px !important; padding: 16px 12px !important; }
    .company-legal-info { text-align: center !important; }
    .proposal-body-padding { padding: 14px 10px !important; }
    .responsive-grid-2 { grid-template-columns: 1fr !important; gap: 14px !important; }
    .responsive-grid-3 { grid-template-columns: 1fr !important; gap: 14px !important; }
    th, td { padding: 6px 8px !important; font-size: 11px !important; }
    h1, .proposal-main-title { font-size: 16px !important; }
    h2, .proposal-section-title { font-size: 13.5px !important; }
  }
  
  @media print {
    body { background: #ffffff !important; padding: 0 !important; }
    .proposal-sheet-container { box-shadow: none !important; max-width: 100% !important; width: 100% !important; border-radius: 0 !important; }
    .table-responsive { overflow: visible !important; }
  }
</style>
</head>
<body>
  <div class="proposal-sheet-container">
    ${element.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanNo = quotation ? quotation.quotationNo : 'Proposal';
    const cleanTitle = (headerTitle || 'Quotation').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `${cleanNo}_${cleanTitle}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentTemplateObj = TEMPLATE_OPTIONS.find(t => t.id === templateType) || TEMPLATE_OPTIONS[0];

  return (
    <div
      id="proposal-canvas-modal-overlay"
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
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #000000 !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-proposal-sheet,
          #printable-proposal-sheet * {
            visibility: visible !important;
          }
          #proposal-canvas-modal-overlay,
          #proposal-canvas-modal-overlay > div,
          #printable-proposal-sheet-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            visibility: visible !important;
            overflow: visible !important;
          }
          #printable-proposal-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 12mm 14mm 12mm 14mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table, th, td, div, span, p, h1, h2, h3, h4, h5, h6 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
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
          className="no-print"
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
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                }}
                title="Print or Save as PDF document"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            )}

            {/* Download HTML in View Mode */}
            {!isEditing && (
              <button
                type="button"
                onClick={handleDownloadHtml}
                style={{
                  background: '#10B981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                }}
                title="Download complete formatted HTML quotation proposal file"
              >
                <FileText size={14} /> Download HTML
              </button>
            )}

            {/* Email in View Mode */}
            {!isEditing && quotation && onSendEmail && (
              <button
                type="button"
                onClick={() => onSendEmail(quotation)}
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
          id="printable-proposal-sheet-wrapper"
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
            <div className="company-header-flex" style={{ padding: '24px 36px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #198754' }}>
              <div>
                <img
                  src={HIVERIFT_LOGO_BASE64}
                  alt="HiveRift Logo"
                  style={{ maxHeight: 52, maxWidth: 200, objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div className="company-legal-info" style={{ textAlign: 'right', fontSize: 11, color: '#334155', lineHeight: 1.45 }}>
                <strong style={{ fontSize: 12.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  HIVERIFT SOFTWARES PRIVATE LIMITED
                </strong><br />
                CIN U63999DL2025PTC460443<br />
                2nd Floor, House No. 8577 (New) Plot No. XVI/6501 (Old), New Rohtak Road<br />
                Karol Bagh, New Delhi - 110005, India
              </div>
            </div>

            {/* Document Body Area */}
            <div className="proposal-body-padding" style={{ padding: '28px 44px' }}>

              {/* Category & Format Selector Bar in Edit Mode */}
              {isEditing && (
                <div style={{ marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Select Proposal Domain & Category:</span>
                    <span style={{ fontSize: 11, background: '#198754', color: '#ffffff', padding: '3px 10px', borderRadius: 12, fontWeight: 800 }}>
                      10 Specialized Templates Available
                    </span>
                  </div>

                  {/* 2 Main Domain Option Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    {PROPOSAL_CATEGORIES.map(cat => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            if (!cat.templates.includes(templateType)) {
                              handleSwitchTemplate(cat.templates[0]);
                            }
                          }}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            border: isSelected ? `2.5px solid ${cat.color}` : '1px solid #cbd5e1',
                            background: isSelected ? cat.bgColor : '#ffffff',
                            boxShadow: isSelected ? `0 4px 12px ${cat.color}22` : 'none',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            background: isSelected ? cat.color : '#e2e8f0',
                            color: isSelected ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            flexShrink: 0
                          }}>
                            {cat.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13.5, color: isSelected ? cat.color : '#1e293b' }}>
                              {cat.title}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                              {cat.subtitle}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dropdown for sub-templates under selected category */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
                      Proposal Template Format:
                    </label>
                    <select
                      value={templateType}
                      onChange={(e) => handleSwitchTemplate(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        border: '1.5px solid #198754',
                        background: '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {(PROPOSAL_CATEGORIES.find(c => c.id === selectedCategory)?.templates || []).map(tId => {
                        const tpl = TEMPLATE_OPTIONS.find(t => t.id === tId);
                        if (!tpl) return null;
                        return (
                          <option key={tpl.id} value={tpl.id}>
                            📄 {tpl.title}
                          </option>
                        );
                      })}
                    </select>
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

              {/* DYNAMIC TEMPLATE RENDERER */}
              {templateType === 'custom_web_app' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes to design and develop a <strong>custom web application</strong> for <strong>{displayClientHeading || '[Client / Company Name]'}</strong>, built around the client's specific business processes, operational requirements and growth objectives.
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 16px 0' }}>
                    Unlike a standard website, the proposed web application can include custom business functionality, user roles, administrative controls, workflows, integrations, automation and scalable architecture according to the approved project scope.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Build a secure and scalable web-based business solution that simplifies operations, centralizes information and supports the client's specific business workflows.
                  </div>

                  {/* 2. CORE APPLICATION CAPABILITIES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. CORE APPLICATION CAPABILITIES
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Custom Business Functionality</li>
                    <li>User Roles &amp; Permissions</li>
                    <li>Admin Dashboard / Admin Panel</li>
                    <li>Custom Business Workflows</li>
                    <li>Data Management</li>
                    <li>Reports &amp; Dashboards</li>
                    <li>Search, Filters &amp; Data Management</li>
                    <li>Notifications &amp; Alerts</li>
                    <li>Third-Party API Integrations</li>
                    <li>Business Process Automation</li>
                    <li>Secure Authentication &amp; Authorization</li>
                    <li>Responsive Web Interface</li>
                    <li>Database Management</li>
                    <li>Scalable Application Architecture</li>
                    <li>Backup &amp; Security Configuration</li>
                  </ul>

                  {/* 3. CUSTOM BUSINESS FUNCTIONALITY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. CUSTOM BUSINESS FUNCTIONALITY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The application will be designed according to the client's business requirements. Custom modules may include:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Lead / Customer Management</li>
                    <li>Employee / Staff Management</li>
                    <li>Vendor Management</li>
                    <li>Inventory / Product Management</li>
                    <li>Booking / Appointment Management</li>
                    <li>Task &amp; Project Management</li>
                    <li>Document Management</li>
                    <li>Payment / Transaction Management</li>
                    <li>Reports &amp; Analytics</li>
                    <li>Content Management</li>
                    <li>Other client-specific business modules</li>
                  </ul>

                  {/* 4. USER ROLES & PERMISSIONS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. USER ROLES & PERMISSIONS
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The application can support multiple user types with role-based access control. Typical roles may include:
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>User Role</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Typical Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Super Admin</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Complete application and system management</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Admin</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Business operations, users, records and reports</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Manager</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Assigned modules, approvals, monitoring and reports</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Staff / Employee</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Assigned tasks, records and operational functions</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Customer</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Customer-specific services, records, requests and account information</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Vendor / Partner</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Vendor-specific operations and information, where required</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>
                    Final roles, permissions and access levels will be defined according to the approved business workflow.
                  </p>

                  {/* 5. ADMIN PANEL */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. ADMIN PANEL
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    A centralized administration panel can provide control over the application.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Dashboard</li>
                    <li>User Management</li>
                    <li>Role &amp; Permission Management</li>
                    <li>Business Data Management</li>
                    <li>Module Management</li>
                    <li>Workflow Management</li>
                    <li>Reports &amp; Analytics</li>
                    <li>Notifications</li>
                    <li>System Settings</li>
                    <li>Activity / Audit Logs, where required</li>
                  </ul>

                  {/* 6. BUSINESS WORKFLOWS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. BUSINESS WORKFLOWS
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Custom workflows can be developed according to the client's operational process. Examples include:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Lead Assignment &amp; Follow-Up</li>
                    <li>Approval Workflows</li>
                    <li>Task Assignment</li>
                    <li>Status-Based Processes</li>
                    <li>Customer Onboarding</li>
                    <li>Document Approval</li>
                    <li>Order / Request Processing</li>
                    <li>Escalation Workflows</li>
                    <li>Internal Notifications</li>
                  </ul>

                  {/* 7. INTEGRATIONS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. INTEGRATIONS
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The application can integrate with suitable third-party platforms and APIs according to business requirements.
                  </p>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Payment Gateways</li>
                    <li>WhatsApp / WhatsApp API</li>
                    <li>Email Services</li>
                    <li>SMS Gateways</li>
                    <li>CRM Systems</li>
                    <li>ERP Systems</li>
                    <li>Accounting Platforms</li>
                    <li>Google Services / Analytics</li>
                    <li>Shipping / Logistics APIs</li>
                    <li>Other Third-Party APIs</li>
                  </ul>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> Third-party subscription, API, transaction or usage charges are separate unless specifically included in the quotation.
                  </div>

                  {/* 8. AUTOMATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. AUTOMATION
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Business processes can be automated to reduce repetitive manual work.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Automated Email Notifications</li>
                    <li>WhatsApp Notifications, where supported</li>
                    <li>SMS Notifications, where supported</li>
                    <li>Task Assignment Automation</li>
                    <li>Status-Based Notifications</li>
                    <li>Approval Alerts</li>
                    <li>Scheduled Reports</li>
                    <li>Automated Data Processing</li>
                    <li>Other Approved Business Automations</li>
                  </ul>

                  {/* 9. SECURITY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. SECURITY
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Secure Login &amp; Authentication</li>
                    <li>Role-Based Authorization</li>
                    <li>Password Protection</li>
                    <li>SSL / HTTPS Configuration</li>
                    <li>Input Validation</li>
                    <li>Secure API Communication</li>
                    <li>Database Security Practices</li>
                    <li>Session Management</li>
                    <li>Backup Configuration, where supported</li>
                    <li>Activity / Audit Logging, where required</li>
                  </ul>

                  {/* 10. SCALABILITY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. SCALABILITY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The application architecture can be planned to support future business growth and additional functionality.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Additional Users</li>
                    <li>Additional Modules</li>
                    <li>Additional Business Locations</li>
                    <li>Additional Integrations</li>
                    <li>Expanded Database Requirements</li>
                    <li>Future Automation</li>
                    <li>Additional Reports &amp; Dashboards</li>
                    <li>API Expansion</li>
                  </ul>

                  {/* 11. APPLICATION DASHBOARDS & REPORTING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. APPLICATION DASHBOARDS & REPORTING
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Custom dashboards can be created according to user roles and business requirements.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>KPI Dashboard</li>
                    <li>Business Summary</li>
                    <li>Operational Reports</li>
                    <li>User Activity Reports</li>
                    <li>Sales / Revenue Reports, where applicable</li>
                    <li>Lead / Customer Reports</li>
                    <li>Exportable Reports, where required</li>
                  </ul>

                  {/* 12. TECHNOLOGY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. TECHNOLOGY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The technology stack will be selected according to the application's functionality, security, scalability and business requirements. Possible technologies may include:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>HTML5 / CSS3 / JavaScript</li>
                    <li>React.js / Next.js</li>
                    <li>Node.js</li>
                    <li>PHP / Laravel</li>
                    <li>MySQL</li>
                    <li>MongoDB</li>
                    <li>REST APIs</li>
                    <li>Other suitable technologies</li>
                  </ul>

                  {/* 13. TIMELINE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. TIMELINE
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Activity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Estimated Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Requirement Gathering &amp; Business Analysis</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>2–5 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>System Planning &amp; Architecture</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>2–4 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>UI/UX Design</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>3–7 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Core Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>10–30+ Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Integrations &amp; Automation</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>3–10+ Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Testing &amp; Quality Assurance</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>3–7 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Deployment &amp; Handover</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1–3 Days</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 13, color: '#334155', margin: '0 0 20px 0' }}>
                    <strong>Estimated Timeline:</strong> Final timeline will be confirmed after requirement analysis and approval of the technical scope.
                  </p>

                  {/* 14. HOSTING & TECHNICAL SUPPORT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. HOSTING & TECHNICAL SUPPORT
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Inclusion</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Application Hosting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Year*</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>SSL</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Technical Support</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As per Package</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Bug Fixes</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As per Agreement</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Deployment</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Admin Handover</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>*Subject to the selected quotation/package and infrastructure requirements.</p>

                  {/* 15. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'ecommerce_website' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes to design and develop a <strong>professional, secure and responsive E-Commerce Website</strong> for <strong>{displayClientHeading || '[Client / Company Name]'}</strong>.
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 16px 0' }}>
                    The proposed solution will provide the business with a complete online shopping platform where customers can discover products, view product details, add items to cart, place orders, make online payments and receive order-related communication.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Build a scalable online store focused on <strong>product discovery, customer experience, secure transactions and online sales.</strong>
                  </div>

                  {/* 2. E-COMMERCE FEATURES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. E-COMMERCE FEATURES
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Professional E-Commerce UI/UX Design</li>
                    <li>Fully Responsive Website</li>
                    <li>Mobile, Tablet &amp; Desktop Optimization</li>
                    <li>Product Catalogue</li>
                    <li>Product Categories &amp; Sub-Categories</li>
                    <li>Product Search &amp; Filtering</li>
                    <li>Product Detail Pages</li>
                    <li>Product Variations, where required</li>
                    <li>Shopping Cart</li>
                    <li>Wishlist, where required</li>
                    <li>Customer Registration &amp; Login</li>
                    <li>Guest Checkout, where required</li>
                    <li>Checkout System</li>
                    <li>Online Payment Gateway Integration</li>
                    <li>Order Management</li>
                    <li>Customer Order History</li>
                    <li>Coupon / Discount Management</li>
                    <li>Shipping Configuration</li>
                    <li>Email Notifications</li>
                    <li>WhatsApp Integration</li>
                    <li>Contact / Enquiry Forms</li>
                    <li>Google Analytics &amp; Search Console</li>
                    <li>Basic SEO Setup</li>
                    <li>SSL &amp; Basic Security</li>
                  </ul>

                  {/* 3. PROPOSED WEBSITE STRUCTURE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. PROPOSED WEBSITE STRUCTURE
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Page / Section</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Home</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Brand introduction, featured products, offers and primary shopping CTAs</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>About Us</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Company, brand and business information</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Shop</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Complete product catalogue with categories and filters</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Product Categories</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Organized product browsing by category/sub-category</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Product Detail</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Images, description, price, specifications, variations and purchase options</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Cart</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Review products, quantities and order value</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Checkout</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Customer details, shipping and payment</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>My Account</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Customer profile, addresses and order history</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Wishlist</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Save products for future purchase, if required</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Offers / Deals</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Promotions, discounts and featured campaigns</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Blog</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Articles, updates and SEO content, if required</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>FAQ</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Frequently asked questions</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Contact Us</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Contact information, enquiry form, map and communication options</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Policies</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Shipping, returns, refunds, privacy and terms pages</td></tr>
                    </tbody>
                  </table>

                  {/* 4. PRODUCT MANAGEMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. PRODUCT MANAGEMENT
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The store can support structured product management, including:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Product Name</li>
                    <li>Product Images / Gallery</li>
                    <li>Product Description</li>
                    <li>Product Price</li>
                    <li>Sale Price</li>
                    <li>SKU / Product Code</li>
                    <li>Stock Availability</li>
                    <li>Product Category</li>
                    <li>Product Attributes</li>
                    <li>Product Variations</li>
                    <li>Specifications</li>
                    <li>Related Products</li>
                    <li>Featured Products</li>
                  </ul>

                  {/* 5. SHOPPING CART & CHECKOUT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. SHOPPING CART &amp; CHECKOUT
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Add to Cart</li>
                    <li>Update Quantity</li>
                    <li>Remove Product</li>
                    <li>Apply Coupon / Discount</li>
                    <li>Calculate Subtotal</li>
                    <li>Shipping Charges</li>
                    <li>Tax Calculation, where applicable</li>
                    <li>Order Total</li>
                    <li>Customer Information</li>
                    <li>Shipping Address</li>
                    <li>Billing Information</li>
                    <li>Payment Selection</li>
                    <li>Order Confirmation</li>
                  </ul>

                  {/* 6. PAYMENT GATEWAY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. PAYMENT GATEWAY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The website can be integrated with a suitable payment gateway according to the client's business and operating region.
                  </p>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Online Payment</li>
                    <li>UPI Payments</li>
                    <li>Credit / Debit Cards</li>
                    <li>Net Banking</li>
                    <li>Wallets, where supported</li>
                    <li>Cash on Delivery, where applicable</li>
                  </ul>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> Payment gateway account setup, transaction charges and third-party gateway fees are separate unless specifically included in the quotation.
                  </div>

                  {/* 7. ORDER MANAGEMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. ORDER MANAGEMENT
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The admin system can provide order management functionality such as:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>View Orders</li>
                    <li>Order Details</li>
                    <li>Order Status Management</li>
                    <li>Payment Status</li>
                    <li>Customer Details</li>
                    <li>Shipping Information</li>
                    <li>Invoice / Order Summary</li>
                    <li>Order Search &amp; Filtering</li>
                    <li>Order Notifications</li>
                  </ul>

                  {/* 8. CUSTOMER ACCOUNT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. CUSTOMER ACCOUNT
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Customer Registration</li>
                    <li>Login / Logout</li>
                    <li>Forgot Password</li>
                    <li>Profile Management</li>
                    <li>Saved Addresses</li>
                    <li>Order History</li>
                    <li>Order Status</li>
                    <li>Wishlist, where applicable</li>
                  </ul>

                  {/* 9. ADMIN & CONTENT MANAGEMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. ADMIN &amp; CONTENT MANAGEMENT
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Admin Dashboard</li>
                    <li>Manage Products</li>
                    <li>Manage Categories</li>
                    <li>Manage Product Variations</li>
                    <li>Manage Inventory / Stock, where supported</li>
                    <li>Manage Orders</li>
                    <li>Manage Customers</li>
                    <li>Manage Coupons / Discounts</li>
                    <li>Manage Banners / Promotions</li>
                    <li>Manage Testimonials</li>
                    <li>Manage Blog</li>
                    <li>Manage Enquiries</li>
                    <li>Manage Website Content</li>
                  </ul>

                  {/* 10. SHIPPING & DELIVERY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. SHIPPING &amp; DELIVERY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Shipping functionality can be configured according to the client's business model.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Shipping Zones</li>
                    <li>Flat-Rate Shipping</li>
                    <li>Location-Based Shipping</li>
                    <li>Free Shipping Rules</li>
                    <li>Order Delivery Information</li>
                    <li>Shipping Charges</li>
                    <li>Courier / Logistics Integration, where required</li>
                  </ul>

                  {/* 11. SEO & PERFORMANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. SEO &amp; PERFORMANCE
                  </div>
                  <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>SEO-Friendly URLs</li>
                    <li>Meta Titles &amp; Descriptions</li>
                    <li>Heading Structure</li>
                    <li>Product SEO Structure</li>
                    <li>Category SEO Structure</li>
                    <li>Image ALT Tags</li>
                    <li>XML Sitemap</li>
                    <li>Robots.txt</li>
                    <li>Google Analytics</li>
                    <li>Google Search Console</li>
                    <li>Mobile Optimization</li>
                    <li>Basic Speed Optimization</li>
                    <li>SSL Configuration</li>
                  </ul>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}><strong>Note:</strong> Ongoing SEO and ranking services are available separately.</p>

                  {/* 12. SECURITY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. SECURITY
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>SSL Configuration</li>
                    <li>Secure Admin Access</li>
                    <li>Basic Firewall / Security Protection</li>
                    <li>Spam Protection</li>
                    <li>Database Security Practices</li>
                    <li>Backup Configuration, where supported</li>
                  </ul>

                  {/* 13. TIMELINE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. TIMELINE
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Activity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Estimated Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Requirement Gathering &amp; Planning</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1–2 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Sitemap &amp; Store Structure</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1 Day</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>UI/UX Design</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>2–3 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Website &amp; Store Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>4–7 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Product / Content Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1–3 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Payment &amp; Shipping Configuration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1–2 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Testing &amp; Quality Assurance</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1–2 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Final Corrections &amp; Deployment</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1 Day</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 13.5, color: '#334155', margin: '0 0 6px 0' }}><strong>Estimated Delivery:</strong> 10–20 Working Days.</p>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>Timeline depends on product volume, integrations, content availability and client approvals. The timeline starts after advance payment and receipt of required materials.</p>

                  {/* 14. HOSTING & SUPPORT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. HOSTING &amp; SUPPORT
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Inclusion</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Hosting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Year*</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>SSL</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Technical Support</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As per Package</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Bug Fixes</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>30 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Admin Handover</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Basic Training</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>*Subject to the selected quotation/package.</p>

                  {/* 15. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'it_software_dev' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. provides professional <strong>IT &amp; Software Development solutions</strong> for businesses that require reliable technology solutions, custom software, web applications, mobile applications, business systems and digital platforms.
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 16px 0' }}>
                    Solutions are planned according to the client's business objectives, required functionality, technology requirements, user roles, integrations, security requirements and future scalability.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Deliver a reliable, secure and scalable technology solution that supports the client's business operations and digital growth.
                  </div>

                  {/* 2. IT & SOFTWARE SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. IT &amp; SOFTWARE SERVICES
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Custom Software Development</li>
                    <li>Web Application Development</li>
                    <li>Business Management Software</li>
                    <li>CRM Development</li>
                    <li>ERP Development</li>
                    <li>Custom Admin Panels</li>
                    <li>Customer / Vendor Portals</li>
                    <li>API Development &amp; Integration</li>
                    <li>Business Automation</li>
                    <li>Database Development</li>
                    <li>Mobile Application Development</li>
                    <li>Third-Party System Integration</li>
                    <li>Dashboard &amp; Reporting Solutions</li>
                    <li>Maintenance &amp; Technical Support</li>
                  </ul>

                  {/* 3. SOFTWARE DEVELOPMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. SOFTWARE DEVELOPMENT
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Software solutions can be developed according to the client's specific business requirements.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Custom Business Software</li>
                    <li>Internal Business Management Systems</li>
                    <li>Workflow-Based Applications</li>
                    <li>Customer Management Systems</li>
                    <li>Employee / Staff Management Systems</li>
                    <li>Inventory &amp; Operations Systems</li>
                    <li>Booking / Appointment Systems</li>
                    <li>Document Management Systems</li>
                    <li>Reporting &amp; Analytics Systems</li>
                    <li>Custom SaaS Platforms</li>
                  </ul>

                  {/* 4. WEB APPLICATION DEVELOPMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. WEB APPLICATION DEVELOPMENT
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Responsive Web Applications</li>
                    <li>Custom Dashboards</li>
                    <li>Admin Panels</li>
                    <li>Customer Portals</li>
                    <li>Vendor Portals</li>
                    <li>Employee Portals</li>
                    <li>Membership Platforms</li>
                    <li>Booking Platforms</li>
                    <li>Marketplace Platforms</li>
                    <li>API-Based Applications</li>
                  </ul>

                  {/* 5. MOBILE APPLICATION DEVELOPMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. MOBILE APPLICATION DEVELOPMENT
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Mobile applications can be developed according to the approved requirements and platform needs.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Android Applications</li>
                    <li>iOS Applications</li>
                    <li>Cross-Platform Applications</li>
                    <li>Customer Applications</li>
                    <li>Business / Employee Applications</li>
                    <li>Service / Booking Applications</li>
                    <li>API-Connected Mobile Applications</li>
                  </ul>

                  {/* 6. BUSINESS FUNCTIONALITY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. BUSINESS FUNCTIONALITY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The solution can include custom modules such as:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Lead &amp; Customer Management</li>
                    <li>Sales &amp; Operations Management</li>
                    <li>Employee Management</li>
                    <li>Vendor Management</li>
                    <li>Product / Inventory Management</li>
                    <li>Task &amp; Project Management</li>
                    <li>Booking / Appointment Management</li>
                    <li>Document Management</li>
                    <li>Payment / Transaction Management</li>
                    <li>Reports &amp; Analytics</li>
                    <li>Notifications &amp; Alerts</li>
                  </ul>

                  {/* 7. USER ROLES & ADMIN PANEL */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. USER ROLES &amp; ADMIN PANEL
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>User Role</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Typical Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Super Admin</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Complete system and configuration management</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Admin</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Business operations, users, records and reports</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Manager</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Assigned modules, approvals and monitoring</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Staff / Employee</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Assigned operational functions and tasks</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Customer</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Customer-specific account, requests and information</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Vendor / Partner</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Vendor-specific operations, where required</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>
                    The final roles, permissions and admin functionality will be defined according to the approved scope.
                  </p>

                  {/* 8. API & THIRD-PARTY INTEGRATIONS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. API &amp; THIRD-PARTY INTEGRATIONS
                  </div>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Payment Gateways</li>
                    <li>WhatsApp / WhatsApp API</li>
                    <li>Email Services</li>
                    <li>SMS Gateways</li>
                    <li>CRM Systems</li>
                    <li>ERP Systems</li>
                    <li>Accounting Platforms</li>
                    <li>Google Services / Analytics</li>
                    <li>Shipping / Logistics APIs</li>
                    <li>Other Approved APIs</li>
                  </ul>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> Third-party subscription, API, transaction or usage charges are separate unless specifically included in the quotation.
                  </div>

                  {/* 9. AUTOMATION & WORKFLOWS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. AUTOMATION &amp; WORKFLOWS
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Business Process Automation</li>
                    <li>Approval Workflows</li>
                    <li>Task Assignment</li>
                    <li>Lead Assignment &amp; Follow-Up</li>
                    <li>Status-Based Notifications</li>
                    <li>Email Notifications</li>
                    <li>WhatsApp / SMS Notifications, where supported</li>
                    <li>Scheduled Reports</li>
                    <li>Automated Data Processing</li>
                  </ul>

                  {/* 10. SECURITY & DATA PROTECTION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. SECURITY &amp; DATA PROTECTION
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Secure Login &amp; Authentication</li>
                    <li>Role-Based Authorization</li>
                    <li>SSL / HTTPS Configuration</li>
                    <li>Secure API Communication</li>
                    <li>Input Validation</li>
                    <li>Database Security Practices</li>
                    <li>Session Management</li>
                    <li>Backup Configuration, where supported</li>
                    <li>Activity / Audit Logs, where required</li>
                  </ul>

                  {/* 11. DASHBOARDS & REPORTING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. DASHBOARDS &amp; REPORTING
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Management Dashboard</li>
                    <li>KPI Dashboard</li>
                    <li>Operational Reports</li>
                    <li>Sales / Revenue Reports, where applicable</li>
                    <li>Lead / Customer Reports</li>
                    <li>User Activity Reports</li>
                    <li>Custom Reports</li>
                    <li>Exportable Reports, where required</li>
                  </ul>

                  {/* 12. TECHNOLOGY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. TECHNOLOGY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The technology stack will be selected according to project requirements. Possible technologies may include:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>HTML5 / CSS3 / JavaScript</li>
                    <li>React.js / Next.js</li>
                    <li>Node.js</li>
                    <li>PHP / Laravel</li>
                    <li>MySQL</li>
                    <li>MongoDB</li>
                    <li>REST APIs</li>
                    <li>Flutter / React Native</li>
                    <li>Other suitable technologies</li>
                  </ul>

                  {/* 13. PROJECT PROCESS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. PROJECT PROCESS
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Stage</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1. Requirement Analysis</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Understand business requirements, users, workflows and objectives</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>2. Planning</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Define modules, system structure and technical approach</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>3. UI/UX Design</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Create interface designs and user experience flow</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>4. Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Develop approved modules and functionality</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>5. Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Connect APIs, third-party services and required systems</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>6. Testing</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Functional, responsive and quality testing</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>7. Deployment</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Server deployment, configuration and final setup</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>8. Handover</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Credentials, documentation and basic training, where applicable</td></tr>
                    </tbody>
                  </table>

                  {/* 14. TIMELINE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. TIMELINE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The project timeline will depend on the approved scope, number of modules, integrations, design requirements, testing requirements and client approvals.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Estimated Timeline:</strong> Final timeline will be provided after requirement analysis and confirmation of the technical scope.
                  </div>

                  {/* 15. HOSTING & TECHNICAL SUPPORT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. HOSTING &amp; TECHNICAL SUPPORT
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Inclusion</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Hosting / Server</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Year*</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>SSL</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Deployment</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Technical Support</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As per Package</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Bug Fixes</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As per Agreement</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Admin Handover</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>*Subject to selected infrastructure and quotation.</p>

                  {/* 16. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'landing_page' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes to design and develop a <strong>professional, responsive and conversion-focused Landing Page</strong> for <strong>{displayClientHeading || '[Client / Company Name]'}</strong>.
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 16px 0' }}>
                    The landing page will be designed around a specific business objective such as lead generation, service promotion, product promotion, advertising campaigns, event registration, consultation requests or customer enquiries.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Create a focused digital experience that communicates the offer clearly and encourages visitors to take a specific <strong>Call-to-Action (CTA)</strong>.
                  </div>

                  {/* 2. KEY FEATURES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. KEY FEATURES
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Professional Landing Page UI/UX Design</li>
                    <li>Fully Responsive Design</li>
                    <li>Mobile, Tablet &amp; Desktop Optimization</li>
                    <li>Conversion-Focused Layout</li>
                    <li>Hero Banner / Main Offer Section</li>
                    <li>Strong Call-to-Action Sections</li>
                    <li>Service / Product Presentation</li>
                    <li>Benefits &amp; Key Features Section</li>
                    <li>Lead Generation Form</li>
                    <li>WhatsApp Integration</li>
                    <li>Click-to-Call Button</li>
                    <li>Testimonials / Reviews</li>
                    <li>FAQ Section</li>
                    <li>Google Maps, where required</li>
                    <li>Social Media Links</li>
                    <li>Basic SEO Setup</li>
                    <li>Google Analytics</li>
                    <li>Google Search Console</li>
                    <li>SSL &amp; Basic Security</li>
                    <li>Basic Speed Optimization</li>
                  </ul>

                  {/* 3. LANDING PAGE STRUCTURE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. LANDING PAGE STRUCTURE
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Section</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Hero Section</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Main headline, offer/value proposition and primary CTA</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>About / Introduction</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Brief company, brand, product or service introduction</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Services / Product</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Present the primary offering clearly</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Key Benefits</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Explain why the visitor should choose the offer</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Features / Highlights</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Show important features, inclusions or differentiators</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Portfolio / Results</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Previous work, achievements, case studies or results, where applicable</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Testimonials</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Build trust using customer reviews and feedback</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Offer / Pricing</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Display package, pricing or promotional offer, where required</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>FAQ</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Answer common customer questions</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Lead Form</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Capture visitor information and requirements</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Final CTA</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Encourage visitors to submit an enquiry, call or contact the business</td></tr>
                    </tbody>
                  </table>

                  {/* 4. LEAD GENERATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. LEAD GENERATION
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Lead Capture Forms</li>
                    <li>Request a Quote</li>
                    <li>Book a Consultation</li>
                    <li>Get Started CTA</li>
                    <li>Call Now Button</li>
                    <li>WhatsApp Enquiry</li>
                    <li>Email Enquiry</li>
                    <li>Campaign-Specific CTAs</li>
                  </ul>

                  {/* 5. FORM & ENQUIRY MANAGEMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. FORM &amp; ENQUIRY MANAGEMENT
                  </div>
                  <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Name</li>
                    <li>Mobile Number</li>
                    <li>Email Address</li>
                    <li>Service / Product Required</li>
                    <li>Location</li>
                    <li>Message / Requirement</li>
                    <li>Other campaign-specific fields</li>
                  </ul>
                  <p style={{ fontSize: 13, color: '#334155', margin: '0 0 20px 0' }}>
                    Enquiries can be configured to reach the client's designated email and/or communication channel, subject to the approved setup.
                  </p>

                  {/* 6. WHATSAPP & COMMUNICATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. WHATSAPP &amp; COMMUNICATION
                  </div>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Floating WhatsApp Button</li>
                    <li>Pre-filled WhatsApp Message</li>
                    <li>Click-to-Call</li>
                    <li>Email CTA</li>
                    <li>Social Media Links</li>
                    <li>Google Maps, where required</li>
                  </ul>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> WhatsApp Business API, SMS, CRM or other third-party service charges are separate unless specifically included in the quotation.
                  </div>

                  {/* 7. ADVERTISING CAMPAIGN SUPPORT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. ADVERTISING CAMPAIGN SUPPORT
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The landing page can be structured specifically for paid advertising campaigns such as:
                  </p>
                  <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Google Ads</li>
                    <li>Facebook / Instagram Ads</li>
                    <li>LinkedIn Ads</li>
                    <li>Other approved advertising campaigns</li>
                  </ul>
                  <p style={{ fontSize: 13, color: '#334155', margin: '0 0 20px 0' }}>
                    Campaign-specific landing pages can be created with focused messaging, relevant CTAs and lead forms. Advertising management and advertising budgets are separate services unless included in the quotation.
                  </p>

                  {/* 8. SEO & PERFORMANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. SEO &amp; PERFORMANCE
                  </div>
                  <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>SEO-Friendly Page Structure</li>
                    <li>Meta Title</li>
                    <li>Meta Description</li>
                    <li>Heading Structure</li>
                    <li>Image ALT Tags</li>
                    <li>Mobile Optimization</li>
                    <li>Basic Speed Optimization</li>
                    <li>Google Analytics</li>
                    <li>Google Search Console</li>
                    <li>SSL Configuration</li>
                  </ul>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}><strong>Note:</strong> Ongoing SEO and ranking services are available separately.</p>

                  {/* 9. TECHNOLOGY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. TECHNOLOGY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 20px 0' }}>
                    The landing page technology will be selected according to project requirements and may include HTML5, CSS3, JavaScript, React.js, Next.js, PHP, WordPress or another suitable technology.
                  </p>

                  {/* 10. TIMELINE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. TIMELINE
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Activity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Estimated Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Requirement Gathering &amp; Planning</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Content &amp; Page Structure</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>UI/UX Design</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1–2 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Landing Page Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1–2 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Form &amp; Integration Setup</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Testing &amp; Deployment</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 13.5, color: '#334155', margin: '0 0 6px 0' }}><strong>Estimated Delivery:</strong> 3–7 Working Days.</p>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>Timeline starts after advance payment and receipt of all required content, images and campaign information.</p>

                  {/* 11. HOSTING & SUPPORT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. HOSTING &amp; SUPPORT
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Inclusion</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Hosting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Year*</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>SSL</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Technical Support</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As per Package</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Bug Fixes</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>30 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Admin Handover</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Where Applicable</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>*Subject to the selected quotation/package.</p>

                  {/* 12. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'portfolio_website' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes to design and develop a professional, responsive and modern <strong>showcase website</strong> for <strong>{displayClientHeading || '[Client / Company Name]'}</strong>.
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 16px 0' }}>
                    The website will be customized according to the client's business and can be used to showcase products, services, portfolio/projects, achievements, testimonials, gallery and business information.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Build a professional digital presence focused on <strong>brand presentation, product/service showcasing and lead generation.</strong>
                  </div>

                  {/* 2. KEY FEATURES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. KEY FEATURES
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Professional UI/UX Design</li>
                    <li>Fully Responsive Website</li>
                    <li>Mobile, Tablet &amp; Desktop Optimization</li>
                    <li>Product Showcase</li>
                    <li>Service Showcase</li>
                    <li>Portfolio / Project Showcase</li>
                    <li>Product &amp; Service Detail Pages</li>
                    <li>Product Categories, where required</li>
                    <li>Contact / Enquiry Forms</li>
                    <li>Product &amp; Service Enquiry</li>
                    <li>WhatsApp Integration</li>
                    <li>Click-to-Call</li>
                    <li>Google Maps</li>
                    <li>Social Media Integration</li>
                    <li>Testimonials &amp; Gallery</li>
                    <li>Basic Blog Section</li>
                    <li>Basic SEO Setup</li>
                    <li>Google Analytics &amp; Search Console</li>
                    <li>SSL &amp; Basic Security</li>
                    <li>Basic Speed Optimization</li>
                  </ul>

                  {/* 3. WEBSITE STRUCTURE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. WEBSITE STRUCTURE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The final website structure will be customized according to the client's requirements.
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Section</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Home</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Brand introduction, key services/products and primary call-to-actions</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>About</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Company, founder, professional or brand information</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Services</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Service categories and detailed service information</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Products</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Product categories and catalogue-style showcase</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Portfolio / Projects</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Completed projects, previous work and case studies</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Testimonials</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Customer reviews and feedback</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Gallery</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Business, product, project and work images</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Blog / Insights</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Articles, updates and SEO content, if required</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>FAQ</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Frequently asked questions, if required</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Contact</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Contact information, enquiry form, map and communication options</td></tr>
                    </tbody>
                  </table>

                  {/* 4. PRODUCT SHOWCASE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. PRODUCT SHOWCASE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    For product-based businesses, the website can display:
                  </p>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Product Categories</li>
                    <li>Product Images</li>
                    <li>Product Description</li>
                    <li>Features &amp; Specifications</li>
                    <li>Applications</li>
                    <li>Product Enquiry</li>
                    <li>Request a Quote</li>
                    <li>WhatsApp Enquiry</li>
                  </ul>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> This is a product showcase/catalogue, not an e-commerce store. Online payment, cart, checkout and order management are separate requirements.
                  </div>

                  {/* 5. SERVICE SHOWCASE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. SERVICE SHOWCASE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    For service-based businesses, the website can display:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Service Categories</li>
                    <li>Service Details</li>
                    <li>Features &amp; Benefits</li>
                    <li>Process / Workflow</li>
                    <li>Related Projects</li>
                    <li>Service Enquiry</li>
                    <li>WhatsApp / Call CTA</li>
                  </ul>

                  {/* 6. PORTFOLIO / PROJECT SHOWCASE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. PORTFOLIO / PROJECT SHOWCASE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The website can showcase:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Completed Projects</li>
                    <li>Previous Work</li>
                    <li>Case Studies</li>
                    <li>Project Images</li>
                    <li>Project Details</li>
                    <li>Client / Location Information</li>
                    <li>Related Services or Products</li>
                  </ul>

                  {/* 7. ADMIN & CONTENT MANAGEMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. ADMIN &amp; CONTENT MANAGEMENT
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Where applicable, the website will provide admin access to manage:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Products &amp; Product Categories</li>
                    <li>Services</li>
                    <li>Portfolio / Projects</li>
                    <li>Testimonials</li>
                    <li>Gallery</li>
                    <li>Blog</li>
                    <li>Enquiries</li>
                    <li>Website Content</li>
                  </ul>

                  {/* 8. LEAD GENERATION & COMMUNICATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. LEAD GENERATION &amp; COMMUNICATION
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Contact Enquiry Forms</li>
                    <li>Product Enquiry</li>
                    <li>Service Enquiry</li>
                    <li>Request a Quote</li>
                    <li>WhatsApp Enquiry Button</li>
                    <li>Click-to-Call</li>
                    <li>Email Enquiry</li>
                    <li>Social Media Links</li>
                    <li>Google Maps</li>
                  </ul>

                  {/* 9. SEO & PERFORMANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. SEO &amp; PERFORMANCE
                  </div>
                  <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>SEO-Friendly URLs</li>
                    <li>Meta Titles &amp; Descriptions</li>
                    <li>Heading Structure</li>
                    <li>Image ALT Tags</li>
                    <li>XML Sitemap</li>
                    <li>Robots.txt</li>
                    <li>Google Analytics</li>
                    <li>Google Search Console</li>
                    <li>Mobile Optimization</li>
                    <li>Basic Speed Optimization</li>
                    <li>SSL Configuration</li>
                  </ul>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}><strong>Note:</strong> Ongoing SEO and ranking services are available separately.</p>

                  {/* 10. TIMELINE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. TIMELINE
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Activity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Estimated Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Requirement Gathering &amp; Planning</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Sitemap &amp; Content Structure</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>UI/UX Design</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1–2 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Website Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>2–4 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Product / Service / Portfolio Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Testing &amp; Quality Assurance</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Final Corrections &amp; Deployment</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Day</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 13.5, color: '#334155', margin: '0 0 6px 0' }}><strong>Estimated Delivery:</strong> 5–10 Working Days.</p>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>Timeline starts after advance payment and receipt of all required content/materials.</p>

                  {/* 11. HOSTING & SUPPORT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. HOSTING &amp; SUPPORT
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Inclusion</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Hosting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>1 Year*</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>SSL</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Technical Support</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As per Package</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Bug Fixes</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>30 Days</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Admin Handover</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Basic Training</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Included</td></tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>*Subject to the selected quotation/package.</p>

                  {/* 12. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'facebook_instagram_ads' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes to manage and optimize <strong>Facebook &amp; Instagram advertising campaigns</strong> for <strong>{displayClientHeading || '[Client / Company Name]'}</strong>.
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 16px 0' }}>
                    The service is designed to help businesses promote their products, services, offers or brand through paid social advertising, with a focus on relevant audience targeting, lead generation, campaign optimization and measurable performance.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Create and manage targeted Facebook &amp; Instagram advertising campaigns focused on <strong>reach, engagement, leads, enquiries, conversions or sales</strong> according to the approved campaign objective.
                  </div>

                  {/* 2. CAMPAIGN MANAGEMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. CAMPAIGN MANAGEMENT
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Campaign Planning</li>
                    <li>Campaign Objective Selection</li>
                    <li>Audience Research</li>
                    <li>Audience Targeting</li>
                    <li>Campaign Structure</li>
                    <li>Ad Set Configuration</li>
                    <li>Ad Creation / Setup</li>
                    <li>Placement Selection</li>
                    <li>Budget Allocation</li>
                    <li>Campaign Launch</li>
                    <li>Performance Monitoring</li>
                    <li>Campaign Optimization</li>
                  </ul>

                  {/* 3. MONTHLY DELIVERABLES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. MONTHLY DELIVERABLES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '25%' }}>Content Type</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '25%' }}>Quantity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Posts</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>15 per month</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>High-quality images/videos with engaging captions</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Reels</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>5 per month</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Short-form video content (15–30 seconds)</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Stories</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>3–5 per week</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Behind-the-scenes, highlights, offers, updates and audience-focused content</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Engagement</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Daily</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Responding to comments and DMs</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Hashtag Strategy</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimized</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Industry-relevant hashtags designed to support maximum reach</td></tr>
                    </tbody>
                  </table>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> These monthly social media deliverables cover organic content and engagement. Paid advertising spend and campaign management are handled separately according to the approved scope.
                  </div>

                  {/* 4. FACEBOOK & INSTAGRAM AD FORMATS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. FACEBOOK &amp; INSTAGRAM AD FORMATS
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Depending on the campaign objective, suitable ad formats may include:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Image Ads</li>
                    <li>Carousel Ads</li>
                    <li>Video Ads</li>
                    <li>Reels Ads</li>
                    <li>Story Ads</li>
                    <li>Lead Ads</li>
                    <li>Traffic Ads</li>
                    <li>Engagement Ads</li>
                    <li>Conversion / Sales Campaigns</li>
                    <li>Remarketing Campaigns, where applicable</li>
                  </ul>

                  {/* 5. TARGETING & AUDIENCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. TARGETING &amp; AUDIENCE
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Location-Based Targeting</li>
                    <li>Age &amp; Gender Targeting</li>
                    <li>Interest-Based Targeting</li>
                    <li>Behavior-Based Targeting</li>
                    <li>Custom Audiences, where available</li>
                    <li>Lookalike Audiences, where available</li>
                    <li>Website Visitors / Remarketing Audiences, where applicable</li>
                    <li>Customer / Lead-Based Audiences, where applicable</li>
                  </ul>

                  {/* 6. CREATIVE & AD COPY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. CREATIVE &amp; AD COPY
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Ad creatives and copy can be developed according to the approved campaign strategy.
                  </p>
                  <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Ad Headline</li>
                    <li>Primary Ad Copy</li>
                    <li>Call-to-Action</li>
                    <li>Static Ad Creatives</li>
                    <li>Carousel Creative</li>
                    <li>Short-Form Video / Reel Creative, where included</li>
                    <li>Offer / Promotional Creative</li>
                  </ul>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>
                    The exact number of creatives, videos, revisions and content deliverables will be defined in the final quotation.
                  </p>

                  {/* 7. LEAD GENERATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. LEAD GENERATION
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Lead-generation campaigns can be configured using suitable conversion paths.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Facebook / Instagram Lead Forms</li>
                    <li>Website Lead Forms</li>
                    <li>WhatsApp Enquiries</li>
                    <li>Call Enquiries</li>
                    <li>Landing Page Campaigns</li>
                    <li>Request-a-Quote Campaigns</li>
                    <li>Consultation / Appointment Leads</li>
                  </ul>

                  {/* 8. TRACKING & SETUP */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. TRACKING &amp; SETUP
                  </div>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Meta Business / Ads Account Setup Assistance</li>
                    <li>Facebook Page &amp; Instagram Account Connection</li>
                    <li>Meta Pixel Setup, where applicable</li>
                    <li>Conversion Event Setup, where applicable</li>
                    <li>Domain Verification, where applicable</li>
                    <li>Campaign Tracking</li>
                    <li>UTM Tracking, where required</li>
                  </ul>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> Availability of tracking features depends on the client's website, Meta account configuration, permissions and applicable platform requirements.
                  </div>

                  {/* 9. CAMPAIGN OPTIMIZATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. CAMPAIGN OPTIMIZATION
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Performance Monitoring</li>
                    <li>Audience Optimization</li>
                    <li>Budget Optimization</li>
                    <li>Creative Performance Review</li>
                    <li>Ad Set Optimization</li>
                    <li>Underperforming Ad Management</li>
                    <li>Testing of Approved Variations</li>
                    <li>Scaling of Suitable Campaigns, where appropriate</li>
                  </ul>

                  {/* 10. REPORTING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. REPORTING
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Performance reporting can include the following metrics, depending on the campaign objective:
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Reach</li>
                    <li>Impressions</li>
                    <li>Clicks</li>
                    <li>CTR</li>
                    <li>Leads</li>
                    <li>Cost Per Lead</li>
                    <li>Engagement</li>
                    <li>Conversions</li>
                    <li>Ad Spend</li>
                    <li>Campaign Performance Summary</li>
                  </ul>

                  {/* 11. CAMPAIGN MANAGEMENT PROCESS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. CAMPAIGN MANAGEMENT PROCESS
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Stage</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1. Requirement Analysis</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Understand business, offer, target audience and campaign objective</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>2. Strategy</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Define audience, campaign structure, messaging and conversion path</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>3. Creative Preparation</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Prepare approved ad creatives and copy</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>4. Campaign Setup</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Configure campaigns, audiences, placements and budget</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>5. Launch</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Launch approved campaigns</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>6. Monitoring</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monitor campaign performance and key metrics</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>7. Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimize targeting, creatives, budget and campaign structure</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>8. Reporting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Provide performance summary according to the agreed reporting cycle</td></tr>
                    </tbody>
                  </table>

                  {/* 12. CAMPAIGN DURATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. CAMPAIGN DURATION
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Campaign duration will be based on the approved package, advertising strategy and business requirements.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Recommended Approach:</strong> Allow sufficient campaign time and budget for meaningful testing, optimization and performance evaluation. Results vary based on industry, offer, audience, creative quality, competition, landing page experience and advertising budget.
                  </div>

                  {/* 13. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'google_ads' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes to manage and optimize <strong>Google Ads campaigns</strong> for <strong>{displayClientHeading || '[Client / Company Name]'}</strong>.
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 16px 0' }}>
                    The service is designed to help businesses reach users actively searching for relevant products or services through paid search and other suitable Google advertising channels, with a focus on qualified traffic, enquiries, leads, conversions and measurable performance.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Build and manage targeted Google Ads campaigns focused on <strong>qualified traffic, leads, enquiries, conversions or sales</strong> according to the approved campaign objective.
                  </div>

                  {/* 2. GOOGLE ADS CAMPAIGN MANAGEMENT */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. GOOGLE ADS CAMPAIGN MANAGEMENT
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Campaign Planning &amp; Strategy</li>
                    <li>Keyword Research</li>
                    <li>Search Intent Analysis</li>
                    <li>Campaign Structure</li>
                    <li>Ad Group Planning</li>
                    <li>Ad Copy Creation / Setup</li>
                    <li>Keyword Match-Type Configuration</li>
                    <li>Negative Keyword Management</li>
                    <li>Location Targeting</li>
                    <li>Budget Allocation</li>
                    <li>Campaign Launch</li>
                    <li>Performance Monitoring</li>
                    <li>Campaign Optimization</li>
                  </ul>

                  {/* 3. MONTHLY DELIVERABLES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. MONTHLY DELIVERABLES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '25%' }}>Activity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '25%' }}>Frequency / Quantity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Campaign Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monitoring, optimization and management of approved Google Ads campaigns</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Keyword Research</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As Required</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Research and refinement of relevant search terms and opportunities</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Ad Copy</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As Required</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Search ad headlines and descriptions based on approved campaign strategy</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Negative Keywords</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Ongoing</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Identify and add irrelevant search terms to improve traffic quality</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Ongoing</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Budget, bids, keywords, ads and targeting optimization</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Reporting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Performance summary with key campaign metrics and observations</td></tr>
                    </tbody>
                  </table>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> The exact number of campaigns, ad groups, keywords, ads and landing pages will depend on the approved scope and advertising budget.
                  </div>

                  {/* 4. GOOGLE ADS CAMPAIGN TYPES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. GOOGLE ADS CAMPAIGN TYPES
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Google Search Ads</li>
                    <li>Display Ads</li>
                    <li>Remarketing Campaigns</li>
                    <li>Performance Max Campaigns</li>
                    <li>Call Campaigns, where available</li>
                    <li>Shopping Campaigns, where applicable</li>
                    <li>YouTube Advertising, where specifically included</li>
                  </ul>

                  {/* 5. KEYWORD & SEARCH STRATEGY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. KEYWORD &amp; SEARCH STRATEGY
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Keyword Research</li>
                    <li>Commercial Intent Analysis</li>
                    <li>Search Intent Mapping</li>
                    <li>Keyword Grouping</li>
                    <li>Match-Type Strategy</li>
                    <li>Long-Tail Keyword Research</li>
                    <li>Negative Keyword Research</li>
                    <li>Search Terms Review</li>
                    <li>Keyword Performance Optimization</li>
                  </ul>

                  {/* 6. AD COPY & CREATIVE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. AD COPY &amp; CREATIVE
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Search Ad Headlines</li>
                    <li>Search Ad Descriptions</li>
                    <li>Call-to-Action Messaging</li>
                    <li>Offer / Promotional Messaging</li>
                    <li>Display Creative Coordination, where applicable</li>
                    <li>Ad Extensions / Assets, where applicable</li>
                  </ul>

                  {/* 7. TARGETING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. TARGETING
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Location Targeting</li>
                    <li>Language Targeting</li>
                    <li>Audience Signals, where applicable</li>
                    <li>Device Targeting / Analysis</li>
                    <li>Schedule / Time-Based Optimization</li>
                    <li>Search Intent Targeting</li>
                    <li>Remarketing Audiences, where applicable</li>
                  </ul>

                  {/* 8. CONVERSION TRACKING & SETUP */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. CONVERSION TRACKING &amp; SETUP
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Google Ads Account Setup Assistance</li>
                    <li>Google Analytics Integration, where applicable</li>
                    <li>Conversion Tracking Setup</li>
                    <li>Lead Form Tracking</li>
                    <li>Phone Call Tracking, where applicable</li>
                    <li>Website Conversion Tracking</li>
                    <li>Google Tag Manager Setup, where applicable</li>
                    <li>UTM Tracking, where required</li>
                  </ul>

                  {/* 9. LANDING PAGE & CONVERSION EXPERIENCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. LANDING PAGE &amp; CONVERSION EXPERIENCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Google Ads performance depends significantly on the quality and relevance of the landing page. Campaigns can be directed to an existing website, dedicated landing page or separately developed conversion page.
                  </p>
                  <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Keyword-to-Landing-Page Relevance</li>
                    <li>Clear Call-to-Action</li>
                    <li>Lead Form Optimization</li>
                    <li>Mobile-Friendly Experience</li>
                    <li>Page Speed Considerations</li>
                    <li>Conversion-Focused Content Recommendations</li>
                  </ul>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>
                    Landing page design/development is available separately unless specifically included in the quotation.
                  </p>

                  {/* 10. CAMPAIGN OPTIMIZATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. CAMPAIGN OPTIMIZATION
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Keyword Optimization</li>
                    <li>Negative Keyword Updates</li>
                    <li>Bid / Budget Optimization</li>
                    <li>Ad Performance Review</li>
                    <li>Search Terms Analysis</li>
                    <li>Location Optimization</li>
                    <li>Device Performance Analysis</li>
                    <li>Audience Performance Analysis</li>
                    <li>Conversion Performance Review</li>
                    <li>Underperforming Campaign / Ad Management</li>
                  </ul>

                  {/* 11. REPORTING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. REPORTING
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Impressions</li>
                    <li>Clicks</li>
                    <li>CTR</li>
                    <li>Average CPC</li>
                    <li>Conversions</li>
                    <li>Cost Per Conversion / Lead</li>
                    <li>Conversion Rate</li>
                    <li>Ad Spend</li>
                    <li>Search Terms / Keyword Performance</li>
                    <li>Campaign Performance Summary</li>
                  </ul>

                  {/* 12. CAMPAIGN MANAGEMENT PROCESS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. CAMPAIGN MANAGEMENT PROCESS
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Stage</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1. Requirement Analysis</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Understand business, services/products, target market and campaign objective</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>2. Keyword Research</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Research relevant keywords, search intent and competition</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>3. Campaign Planning</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Define campaign, ad group, targeting and budget structure</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>4. Ad Setup</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Create approved ads, assets, keywords and targeting</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>5. Tracking</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Configure approved conversion and analytics tracking</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>6. Launch</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Launch approved campaigns</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>7. Monitoring</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monitor performance and key metrics</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>8. Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimize keywords, ads, bids, budget and targeting</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>9. Reporting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Provide performance summary according to the agreed reporting cycle</td></tr>
                    </tbody>
                  </table>

                  {/* 13. CAMPAIGN DURATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. CAMPAIGN DURATION
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Campaign duration will be based on the approved package, advertising strategy and business requirements.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Recommended Approach:</strong> Allow sufficient campaign time and budget for meaningful testing, optimization and performance evaluation. Results vary based on industry, competition, search demand, offer quality, landing page experience and advertising budget.
                  </div>

                  {/* 14. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'multi_platform_ads' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes to plan, manage and optimize <strong>multi-platform paid advertising campaigns</strong> for <strong>{displayClientHeading || '[Client / Company Name]'}</strong>.
                  </p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 16px 0' }}>
                    The campaign strategy will use the most relevant advertising platforms according to the client's business objectives, target audience, industry, geography and approved advertising budget.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Build an integrated paid advertising strategy focused on <strong>qualified traffic, leads, enquiries, conversions, sales or brand awareness</strong>.
                  </div>

                  {/* 2. ADVERTISING PLATFORMS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. ADVERTISING PLATFORMS
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Platform</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Advertising Scope</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Facebook + Instagram</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Meta Ads, Lead Generation, Engagement, Traffic, Conversion &amp; Remarketing</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Google</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Search Ads, Display Ads, Performance Max, Remarketing &amp; Conversion Campaigns</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>LinkedIn</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>B2B Lead Generation, Sponsored Content, Website Traffic &amp; Professional Audience Targeting</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Other Platforms</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advertising campaigns on additional platforms as required by the business</td></tr>
                    </tbody>
                  </table>

                  {/* 3. MONTHLY DELIVERABLES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. MONTHLY DELIVERABLES
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Social Media Content</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '25%' }}>Content Type</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '25%' }}>Quantity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Posts</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>15 per month</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>High-quality images/videos with engaging captions</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Reels</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>5 per month</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Short-form video content (15–30 seconds)</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Stories</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>3–5 per week</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Behind-the-scenes, class highlights, student spotlights</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Engagement</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Daily</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Responding to comments and DMs</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Hashtag Strategy</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimized</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Industry-relevant hashtags for maximum reach</td></tr>
                    </tbody>
                  </table>

                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '16px 0 8px 0' }}>Paid Advertising Management</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Activity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '20%' }}>Frequency</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Campaign Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Management and optimization of approved campaigns across selected platforms</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Audience Research</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As Required</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Audience, market and targeting research based on campaign objectives</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Campaign Setup</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As Required</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Campaigns, ad sets/ad groups, targeting, budgets and placements</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Ad Copy</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As Required</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Platform-specific headlines, descriptions and calls-to-action</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Creative Coordination</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>As Required</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Ad creative planning and coordination according to the approved scope</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Ongoing</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Budget, audience, keyword, creative and campaign optimization</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Reporting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Performance summary with key metrics and recommendations</td></tr>
                    </tbody>
                  </table>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> The exact number of campaigns, ad sets/ad groups, creatives, keywords, audiences and platforms will depend on the approved scope and advertising budget.
                  </div>

                  {/* 4. CAMPAIGN OBJECTIVES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. CAMPAIGN OBJECTIVES
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Lead Generation</li>
                    <li>Website Traffic</li>
                    <li>Conversions</li>
                    <li>Online Sales</li>
                    <li>Brand Awareness</li>
                    <li>Engagement</li>
                    <li>App Promotion, where applicable</li>
                    <li>Remarketing</li>
                    <li>Enquiry Generation</li>
                  </ul>

                  {/* 5. AUDIENCE & TARGETING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. AUDIENCE &amp; TARGETING
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Location-Based Targeting</li>
                    <li>Age &amp; Demographic Targeting</li>
                    <li>Interest-Based Targeting</li>
                    <li>Behavior-Based Targeting</li>
                    <li>Keyword / Search Intent Targeting</li>
                    <li>Professional / Industry Targeting</li>
                    <li>Custom Audiences, where available</li>
                    <li>Lookalike Audiences, where available</li>
                    <li>Website Visitor Audiences</li>
                    <li>Remarketing Audiences</li>
                  </ul>

                  {/* 6. CREATIVE & AD COPY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. CREATIVE &amp; AD COPY
                  </div>
                  <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Static Image Ads</li>
                    <li>Carousel Ads</li>
                    <li>Video Ads</li>
                    <li>Reels / Short-Form Ads</li>
                    <li>Story Ads</li>
                    <li>Search Ad Copy</li>
                    <li>Sponsored Content</li>
                    <li>Headlines &amp; Descriptions</li>
                    <li>Call-to-Action Messaging</li>
                    <li>Offer / Promotional Messaging</li>
                  </ul>
                  <p style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic', margin: '0 0 20px 0' }}>
                    The exact number of creatives, videos, revisions and content deliverables will be finalized in the quotation.
                  </p>

                  {/* 7. TRACKING & CONVERSION SETUP */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. TRACKING &amp; CONVERSION SETUP
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Meta Pixel / Conversion Tracking, where applicable</li>
                    <li>Google Ads Conversion Tracking</li>
                    <li>Google Analytics Integration</li>
                    <li>Google Tag Manager, where applicable</li>
                    <li>LinkedIn Insight Tag, where applicable</li>
                    <li>Lead Form Tracking</li>
                    <li>Website Conversion Tracking</li>
                    <li>Phone Call Tracking, where applicable</li>
                    <li>UTM Tracking</li>
                  </ul>

                  {/* 8. CAMPAIGN OPTIMIZATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. CAMPAIGN OPTIMIZATION
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Budget Optimization</li>
                    <li>Audience Optimization</li>
                    <li>Keyword Optimization</li>
                    <li>Creative Performance Analysis</li>
                    <li>Ad Performance Review</li>
                    <li>Search Terms Analysis</li>
                    <li>Placement Optimization</li>
                    <li>Location Optimization</li>
                    <li>Device Performance Analysis</li>
                    <li>Conversion Performance Review</li>
                    <li>Underperforming Campaign Management</li>
                  </ul>

                  {/* 9. REMARKETING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. REMARKETING
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Remarketing campaigns can be implemented where suitable audiences and tracking data are available.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Website Visitor Remarketing</li>
                    <li>Engaged Audience Remarketing</li>
                    <li>Customer / Lead Remarketing</li>
                    <li>Product / Service Remarketing, where applicable</li>
                    <li>Cross-Platform Remarketing Strategy, where supported</li>
                  </ul>

                  {/* 10. REPORTING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. REPORTING
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Reach</li>
                    <li>Impressions</li>
                    <li>Clicks</li>
                    <li>CTR</li>
                    <li>CPC</li>
                    <li>Leads</li>
                    <li>Cost Per Lead</li>
                    <li>Conversions</li>
                    <li>Conversion Rate</li>
                    <li>Advertising Spend</li>
                    <li>Campaign Performance Summary</li>
                  </ul>

                  {/* 11. CAMPAIGN MANAGEMENT PROCESS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. CAMPAIGN MANAGEMENT PROCESS
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Stage</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>1. Requirement Analysis</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Understand business, offer, target audience and campaign objectives</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>2. Strategy</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Select suitable platforms, audiences, campaign types and conversion paths</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>3. Setup</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Configure campaigns, targeting, budgets, tracking and creatives</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>4. Launch</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Launch approved campaigns across selected platforms</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>5. Monitoring</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monitor campaign performance and key metrics</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>6. Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimize budgets, targeting, creatives and campaign structure</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>7. Reporting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Provide performance summary and recommendations</td></tr>
                    </tbody>
                  </table>

                  {/* 12. CAMPAIGN DURATION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. CAMPAIGN DURATION
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    Campaign duration will be based on the approved package, advertising strategy, campaign objective and business requirements.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Recommended Approach:</strong> Allow sufficient campaign time and budget for testing, optimization and performance evaluation. Results vary based on industry, competition, audience, offer quality, creative quality, landing page experience and advertising budget.
                  </div>

                  {/* 13. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'seo_local_lead_gen' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes a comprehensive <strong>SEO, Local SEO &amp; Lead Generation</strong> program for <strong>{displayClientHeading || '[Client / Company Name]'}</strong> to improve organic visibility, relevant traffic, local search presence, enquiries and long-term search performance.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Build sustainable organic growth through technical SEO, keyword strategy, content optimization, local search optimization, authority building and conversion-focused lead generation.
                  </div>

                  {/* 2. SEO & GROWTH STRATEGY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. SEO &amp; GROWTH STRATEGY
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Business &amp; Competitor Analysis</li>
                    <li>Keyword Research</li>
                    <li>Search Intent Analysis</li>
                    <li>On-Page SEO</li>
                    <li>Technical SEO</li>
                    <li>Content Optimization</li>
                    <li>Internal Linking</li>
                    <li>Off-Page SEO / Authority Building</li>
                    <li>Local SEO</li>
                    <li>Commercial-Intent Keyword Targeting</li>
                    <li>Conversion Optimization</li>
                    <li>Performance Monitoring</li>
                    <li>Monthly Reporting</li>
                  </ul>

                  {/* 3. MONTHLY DELIVERABLES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. MONTHLY DELIVERABLES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Activity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '25%' }}>Frequency</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Keyword Research</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly / As Required</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Identify relevant primary, secondary, long-tail and commercial-intent keywords.</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>On-Page Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Ongoing</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimize titles, descriptions, headings, content, URLs and internal links.</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Technical SEO</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Review crawlability, indexing, site structure, speed and technical issues.</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Content Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimize existing pages and create/plan SEO content according to the approved scope.</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Local SEO</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Improve local keyword targeting, location relevance, local pages and citations.</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Off-Page SEO</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Relevant authority-building and link acquisition activities according to the approved strategy.</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Lead Generation Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Ongoing</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Improve commercial pages, calls-to-action, enquiry opportunities and conversion paths.</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Reporting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Performance summary, keyword movement, traffic, leads and recommendations.</td></tr>
                    </tbody>
                  </table>
                  <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: 14, margin: '0 0 24px 0', borderRadius: 6, fontSize: 13, color: '#66512c', lineHeight: 1.6 }}>
                    <strong>Note:</strong> Exact monthly quantities for keywords, pages, blogs, backlinks and other deliverables will be defined in the final quotation according to the selected package.
                  </div>

                  {/* 4. ON-PAGE SEO */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. ON-PAGE SEO
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Meta Title Optimization</li>
                    <li>Meta Description Optimization</li>
                    <li>H1–H6 Heading Structure</li>
                    <li>Keyword Placement</li>
                    <li>Content Optimization</li>
                    <li>Image ALT Text</li>
                    <li>URL Optimization</li>
                    <li>Internal Linking</li>
                    <li>Schema Markup, where applicable</li>
                    <li>Service / Product Page Optimization</li>
                  </ul>

                  {/* 5. TECHNICAL SEO */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. TECHNICAL SEO
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Website Crawl &amp; Indexing Review</li>
                    <li>XML Sitemap</li>
                    <li>Robots.txt Review</li>
                    <li>Canonicalization</li>
                    <li>404 / Redirect Review</li>
                    <li>Mobile Optimization</li>
                    <li>Page Speed Recommendations</li>
                    <li>Core Web Vitals Review</li>
                    <li>HTTPS / Security Review</li>
                    <li>Search Console Monitoring</li>
                    <li>Technical Error Identification</li>
                  </ul>

                  {/* 6. CONTENT & KEYWORD GROWTH */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. CONTENT &amp; KEYWORD GROWTH
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Primary &amp; Secondary Keyword Research</li>
                    <li>Long-Tail Keyword Research</li>
                    <li>Commercial-Intent Keywords</li>
                    <li>Topic Clustering</li>
                    <li>SEO Blog Planning</li>
                    <li>Service / Product Page Optimization</li>
                    <li>Local Search Content</li>
                    <li>Competitor Content Gap Analysis</li>
                    <li>Content Recommendations Based on Search Intent</li>
                  </ul>

                  {/* 7. LOCAL SEO */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. LOCAL SEO
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The local SEO strategy is focused on increasing visibility for location-based searches and connecting the business with customers searching for relevant services in target cities, areas and service locations.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Location-Based Keyword Research</li>
                    <li>City / Area Landing Pages</li>
                    <li>Local Search Content Strategy</li>
                    <li>Local Citation Strategy</li>
                    <li>Local Directory Optimization</li>
                    <li>NAP Consistency Review</li>
                    <li>Local Competitor Analysis</li>
                    <li>Local Ranking Monitoring</li>
                    <li>Service Area Optimization</li>
                  </ul>

                  {/* 8. OFF-PAGE SEO */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. OFF-PAGE SEO
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Authority Building</li>
                    <li>Relevant Backlink Opportunities</li>
                    <li>Business / Industry Citations, where applicable</li>
                    <li>Brand Mention Opportunities</li>
                    <li>Competitor Backlink Analysis</li>
                    <li>Relevant Directory / Industry Listings</li>
                  </ul>

                  {/* 9. LEAD GENERATION & CONVERSION */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. LEAD GENERATION &amp; CONVERSION
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The SEO strategy can be connected directly with lead-generation objectives by prioritizing commercial-intent keywords, service pages, landing pages and measurable enquiry actions.
                  </p>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Commercial-Intent Keyword Targeting</li>
                    <li>Service / Product Page Optimization</li>
                    <li>Landing Page Recommendations</li>
                    <li>Lead Form Optimization</li>
                    <li>Call-to-Action Optimization</li>
                    <li>WhatsApp / Call Enquiry Opportunities</li>
                    <li>Quote / Consultation Enquiry Opportunities</li>
                    <li>Conversion Tracking, where available</li>
                  </ul>

                  {/* 10. ANALYTICS & REPORTING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. ANALYTICS &amp; REPORTING
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Google Search Console</li>
                    <li>Google Analytics</li>
                    <li>Keyword Rankings</li>
                    <li>Organic Clicks &amp; Impressions</li>
                    <li>Organic Traffic</li>
                    <li>CTR</li>
                    <li>Conversions / Leads, where tracking is available</li>
                    <li>Local Search Performance, where applicable</li>
                    <li>Monthly Recommendations</li>
                  </ul>

                  {/* 11. GROWTH APPROACH */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. GROWTH APPROACH
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 20px 0' }}>
                    The growth program combines technical SEO, content, local search visibility, authority development and conversion-focused optimization. Priority areas can be adjusted based on business goals, competition, search demand and monthly performance.
                  </p>

                  {/* 12. PROJECT TIMELINE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. PROJECT TIMELINE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    SEO is a continuous growth activity. Initial technical and strategic work may be completed during the first month, followed by ongoing optimization, content development, local SEO and authority-building activities.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Estimated Approach:</strong> Final milestones and delivery timelines will be confirmed according to the selected package, website condition, number of pages, target locations and approved scope.
                  </div>

                  {/* 13. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. COMMERCIALS
                  </div>
                </>
              ) : templateType === 'seo_growth_marketing' ? (
                <>
                  {/* 1. PROJECT OVERVIEW */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    1. PROJECT OVERVIEW
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    HiveRift Softwares Pvt. Ltd. proposes a structured <strong>SEO &amp; Growth Marketing</strong> program for <strong>{displayClientHeading || '[Client / Company Name]'}</strong> to improve organic visibility, relevant traffic, enquiries and long-term search performance.
                  </p>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.6 }}>
                    <strong>Primary Objective:</strong> Build sustainable organic growth through technical SEO, keyword strategy, content optimization, authority building and performance monitoring.
                  </div>

                  {/* 2. SEO STRATEGY */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    2. SEO STRATEGY
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Business &amp; Competitor Analysis</li>
                    <li>Keyword Research</li>
                    <li>Search Intent Analysis</li>
                    <li>On-Page SEO</li>
                    <li>Technical SEO</li>
                    <li>Content Optimization</li>
                    <li>Internal Linking</li>
                    <li>Off-Page SEO / Authority Building</li>
                    <li>Performance Monitoring</li>
                    <li>Monthly Reporting</li>
                  </ul>

                  {/* 3. MONTHLY DELIVERABLES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    3. MONTHLY DELIVERABLES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '30%' }}>Activity</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left', width: '25%' }}>Frequency</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Keyword Research</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly / As Required</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Identify relevant keywords and search opportunities</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>On-Page Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Ongoing</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimize titles, descriptions, headings, content, URLs and internal links</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Technical SEO</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Review crawlability, indexing, site structure, speed and technical issues</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Content Optimization</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Optimize existing pages and create/plan content according to the approved scope</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Off-Page SEO</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Relevant authority-building and link acquisition activities according to the approved strategy</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Reporting</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Monthly</td><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Performance summary, keyword movement, traffic and recommendations</td></tr>
                    </tbody>
                  </table>

                  {/* 4. ON-PAGE SEO */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    4. ON-PAGE SEO
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Meta Title Optimization</li>
                    <li>Meta Description Optimization</li>
                    <li>H1–H6 Heading Structure</li>
                    <li>Keyword Placement</li>
                    <li>Content Optimization</li>
                    <li>Image ALT Text</li>
                    <li>URL Optimization</li>
                    <li>Internal Linking</li>
                    <li>Schema Markup, where applicable</li>
                  </ul>

                  {/* 5. TECHNICAL SEO */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    5. TECHNICAL SEO
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Website Crawl &amp; Indexing Review</li>
                    <li>XML Sitemap</li>
                    <li>Robots.txt Review</li>
                    <li>Canonicalization</li>
                    <li>404 / Redirect Review</li>
                    <li>Mobile Optimization</li>
                    <li>Page Speed Recommendations</li>
                    <li>Core Web Vitals Review</li>
                    <li>HTTPS / Security Review</li>
                    <li>Search Console Monitoring</li>
                  </ul>

                  {/* 6. CONTENT & KEYWORD GROWTH */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    6. CONTENT &amp; KEYWORD GROWTH
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Primary &amp; Secondary Keyword Research</li>
                    <li>Long-Tail Keyword Research</li>
                    <li>Topic Clustering</li>
                    <li>SEO Blog Planning</li>
                    <li>Service / Product Page Optimization</li>
                    <li>Local Search Content, where applicable</li>
                    <li>Competitor Content Gap Analysis</li>
                  </ul>

                  {/* 7. OFF-PAGE SEO */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    7. OFF-PAGE SEO
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Authority Building</li>
                    <li>Relevant Backlink Opportunities</li>
                    <li>Business / Industry Citations, where applicable</li>
                    <li>Brand Mention Opportunities</li>
                    <li>Competitor Backlink Analysis</li>
                  </ul>

                  {/* 8. ANALYTICS & REPORTING */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    8. ANALYTICS &amp; REPORTING
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Google Search Console</li>
                    <li>Google Analytics</li>
                    <li>Keyword Rankings</li>
                    <li>Organic Clicks &amp; Impressions</li>
                    <li>Organic Traffic</li>
                    <li>CTR</li>
                    <li>Conversions / Leads, where tracking is available</li>
                    <li>Monthly Recommendations</li>
                  </ul>

                  {/* 9. GROWTH APPROACH */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    9. GROWTH APPROACH
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 20px 0' }}>
                    The growth program combines SEO with business-focused content, search visibility and conversion opportunities. Priority areas can be adjusted based on business goals, competition and monthly performance.
                  </p>

                  {/* 10. TIMELINE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    10. TIMELINE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 20px 0' }}>
                    SEO is a continuous growth activity. Initial technical and strategic work may be completed during the first month, followed by ongoing optimization and content/authority development.
                  </p>

                  {/* 11. COMMERCIALS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    11. COMMERCIALS
                  </div>
                </>
              ) : (
                /* STANDARD TEMPLATE SECTION 1 */
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
              )}

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
              {/* CUSTOM WEB APP EXTRA SECTIONS 16 to 19 */}
              {templateType === 'custom_web_app' && (
                <>
                  {/* 16. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Module</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional User Role</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Reporting Dashboard</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>ERP Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Payment Gateway Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>WhatsApp API</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SMS Gateway</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>AI Chatbot / AI Features</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Automation</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Mobile Application</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Cloud Infrastructure / DevOps</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Annual Maintenance Contract</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 17. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    17. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Domain Registration/Renewal</li>
                    <li>Third-Party Software / API Subscription Charges</li>
                    <li>Payment Gateway Transaction Charges</li>
                    <li>SMS / WhatsApp Usage Charges</li>
                    <li>Cloud / Server Usage Charges beyond the approved package</li>
                    <li>External Software Licensing Costs</li>
                    <li>Mobile Application Development, unless included</li>
                    <li>Major Features Added After Scope Approval</li>
                    <li>Ongoing Maintenance, unless specifically quoted</li>
                    <li>Features outside the approved technical scope</li>
                  </ul>

                  {/* 18. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    18. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    This proposal is designed for businesses requiring a <strong>custom web application</strong> rather than a standard informational website.
                    <br /><br />
                    The final modules, user roles, workflows, integrations, automation, technology, timeline and pricing will be confirmed after requirement analysis and finalized in the project quotation / scope document.
                  </div>

                  {/* 19. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    19. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The project will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and technical scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the 100% advance payment</li>
                    <li>Submission of required business information, content and access credentials, where applicable</li>
                  </ol>
                </>
              )}

              {/* E-COMMERCE EXTRA SECTIONS 16 to 19 */}
              {templateType === 'ecommerce_website' && (
                <>
                  {/* 16. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Pages</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Bulk Product Upload</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Product Filters</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Inventory Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Courier / Shipping API</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>ERP Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>WhatsApp API</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>AI Chatbot</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Analytics</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SEO Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google Ads</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Facebook / Instagram Ads</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>LinkedIn Ads</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Product Photography</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Product Content Writing</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 17. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    17. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Domain Registration/Renewal</li>
                    <li>Paid Stock Images</li>
                    <li>Professional Product Photography</li>
                    <li>Video Production</li>
                    <li>Payment Gateway Transaction Charges</li>
                    <li>Courier / Shipping Charges</li>
                    <li>Paid Third-Party Plugins/APIs</li>
                    <li>WhatsApp API Charges</li>
                    <li>SMS Gateway Charges</li>
                    <li>Advanced ERP / CRM Integration</li>
                    <li>Ongoing SEO</li>
                    <li>Advertising Budget</li>
                    <li>Features outside the approved scope</li>
                  </ul>

                  {/* 18. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    18. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    This proposal is designed for businesses that require a complete <strong>online shopping platform</strong>.
                    The final scope will be customized according to the client's product catalogue, payment requirements, shipping model, integrations and business processes.
                    <br /><br />
                    Product quantity, catalogue upload, advanced integrations, custom modules and third-party services will be finalized in the final quotation.
                  </div>

                  {/* 19. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    19. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The project will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and project scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the applicable advance payment</li>
                    <li>Submission of required content, product information and branding materials</li>
                  </ol>
                </>
              )}

              {/* IT & SOFTWARE DEV EXTRA SECTIONS 17 to 20 */}
              {templateType === 'it_software_dev' && (
                <>
                  {/* 17. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    17. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Module</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional User Role</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Dashboard / Reporting</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>ERP Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Payment Gateway</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>WhatsApp API</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SMS Gateway</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>AI Features / AI Chatbot</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Automation</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Mobile Application</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Cloud Infrastructure / DevOps</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Annual Maintenance Contract</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 18. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    18. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Domain Registration/Renewal</li>
                    <li>Third-Party Software / API Subscription Charges</li>
                    <li>Payment Gateway Transaction Charges</li>
                    <li>SMS / WhatsApp Usage Charges</li>
                    <li>Cloud / Server Usage Charges beyond the approved package</li>
                    <li>External Software Licensing Costs</li>
                    <li>Mobile Application Development, unless included</li>
                    <li>Major Features Added After Scope Approval</li>
                    <li>Ongoing Maintenance, unless specifically quoted</li>
                    <li>Features outside the approved technical scope</li>
                  </ul>

                  {/* 19. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    19. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    This proposal is designed as a universal <strong>IT &amp; Software Development solution</strong> for businesses requiring custom technology, software or application development.
                    <br /><br />
                    The final modules, technology, integrations, user roles, timeline and pricing will be confirmed after requirement analysis and finalized in the project quotation / scope document.
                  </div>

                  {/* 20. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    20. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The project will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and technical scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the 100% advance payment</li>
                    <li>Submission of required business information, content and access credentials, where applicable</li>
                  </ol>
                </>
              )}

              {/* LANDING PAGE EXTRA SECTIONS 13 to 16 */}
              {templateType === 'landing_page' && (
                <>
                  {/* 13. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Landing Page</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Sections</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Lead Form</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>WhatsApp API</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>AI Chatbot</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Facebook / Instagram Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>LinkedIn Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SEO Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Copywriting</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Professional Photography / Video</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 14. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Domain Registration/Renewal</li>
                    <li>Paid Stock Images</li>
                    <li>Professional Photography</li>
                    <li>Video Production</li>
                    <li>Paid Third-Party Plugins/APIs</li>
                    <li>WhatsApp API Charges</li>
                    <li>CRM / Automation Charges</li>
                    <li>Advertising Budget</li>
                    <li>Ongoing SEO</li>
                    <li>Advertising Management, unless quoted separately</li>
                    <li>Features outside the approved scope</li>
                  </ul>

                  {/* 15. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    This proposal is designed for a focused <strong>Landing Page</strong> used for business promotion, lead generation, service/product campaigns, special offers, events or paid advertising.
                    <br /><br />
                    The final content, sections, integrations, campaign objective, timeline and pricing will be confirmed in the final quotation.
                  </div>

                  {/* 16. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The project will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and project scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the 100% advance payment</li>
                    <li>Submission of required content, images and campaign information</li>
                  </ol>
                </>
              )}

              {/* PORTFOLIO WEBSITE EXTRA SECTIONS 13 to 16 */}
              {templateType === 'portfolio_website' && (
                <>
                  {/* 13. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Pages</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Products / Services</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>AI Chatbot</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>WhatsApp API</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Payment Gateway</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>E-Commerce Functionality</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Appointment Booking</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Advanced Admin Panel</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SEO Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google / Facebook / LinkedIn Ads</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Logo Design</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Company Profile</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Photography / Video Production</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 14. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Domain Registration/Renewal</li>
                    <li>Paid Stock Images</li>
                    <li>Professional Photography</li>
                    <li>Video Production</li>
                    <li>Paid Third-Party Plugins/APIs</li>
                    <li>WhatsApp API Charges</li>
                    <li>E-Commerce Functionality</li>
                    <li>Payment Gateway Charges</li>
                    <li>Advanced CRM/Automation</li>
                    <li>Ongoing SEO</li>
                    <li>Advertising Budget</li>
                    <li>Features outside the approved scope</li>
                  </ul>

                  {/* 15. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    This proposal is a <strong>universal showcase website solution</strong> and can be customized for <strong>Service-Based Business + Product-Based Business + Portfolio/Project-Based Business.</strong>
                    <br /><br />
                    The final scope, number of pages, products, services, portfolio items, integrations, timeline and pricing will be confirmed in the final quotation.
                  </div>

                  {/* 16. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The project will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal/scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the applicable advance payment</li>
                    <li>Submission of required content and materials</li>
                  </ol>
                </>
              )}

              {/* FACEBOOK & INSTAGRAM ADS EXTRA SECTIONS 14 to 18 */}
              {templateType === 'facebook_instagram_ads' && (
                <>
                  {/* 14. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Ad Creatives</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Video / Reel Production</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Landing Page Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Website Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>WhatsApp API Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Lead Management / CRM</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>LinkedIn Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SEO Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Social Media Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Professional Photography</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 15. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Facebook / Instagram Advertising Spend</li>
                    <li>Third-Party Platform Charges</li>
                    <li>Professional Photography</li>
                    <li>Professional Video Production, unless included</li>
                    <li>Landing Page Development, unless included</li>
                    <li>CRM / Automation Charges</li>
                    <li>WhatsApp API Charges</li>
                    <li>Influencer / Creator Fees</li>
                    <li>Website Development</li>
                    <li>Guaranteed Leads, Sales or Revenue</li>
                    <li>Services outside the approved scope</li>
                  </ul>

                  {/* 16. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    This proposal covers <strong>Facebook &amp; Instagram paid advertising management</strong>. Advertising results are influenced by market conditions, competition, offer quality, creative, audience, website/landing page experience, campaign budget and platform algorithms.
                    <br /><br />
                    HiveRift will focus on campaign strategy, setup, monitoring and optimization according to the approved scope. No fixed number of leads, sales, revenue or return on ad spend is guaranteed unless specifically agreed in writing.
                  </div>

                  {/* 17. CLIENT REQUIREMENTS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    17. CLIENT REQUIREMENTS
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Access to Meta Business / Ads Manager, where required</li>
                    <li>Facebook Page &amp; Instagram Account Access</li>
                    <li>Business Information</li>
                    <li>Product / Service Information</li>
                    <li>Offer / Pricing Details</li>
                    <li>Target Location &amp; Audience Information</li>
                    <li>Brand Logo &amp; Approved Brand Assets</li>
                    <li>Website / Landing Page Access, where applicable</li>
                    <li>Required approvals and campaign feedback</li>
                  </ul>

                  {/* 18. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    18. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The campaign will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and campaign scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the 100% management fee advance</li>
                    <li>Availability of required account access, business information and creative assets</li>
                    <li>Availability of the approved advertising budget in the client's Meta advertising account</li>
                  </ol>
                </>
              )}

              {/* GOOGLE ADS EXTRA SECTIONS 15 to 19 */}
              {templateType === 'google_ads' && (
                <>
                  {/* 15. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Campaigns</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Landing Page</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Landing Page Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google Analytics Setup</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google Tag Manager Setup</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Conversion Tracking</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Remarketing Setup</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Display Advertising</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>YouTube Advertising</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Facebook / Instagram Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>LinkedIn Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SEO Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 16. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Google Ads Advertising Spend</li>
                    <li>Third-Party Platform Charges</li>
                    <li>Landing Page Development, unless included</li>
                    <li>Professional Photography / Video Production</li>
                    <li>CRM / Automation Charges</li>
                    <li>Third-Party Tracking Tools</li>
                    <li>Website Development</li>
                    <li>Guaranteed Leads, Sales or Revenue</li>
                    <li>Guaranteed Search Position</li>
                    <li>Services outside the approved scope</li>
                  </ul>

                  {/* 17. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    17. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    This proposal covers <strong>Google Ads paid advertising management</strong>. Advertising results are influenced by search demand, competition, keyword costs, offer quality, ad relevance, landing page experience, conversion tracking and advertising budget.
                    <br /><br />
                    HiveRift will focus on campaign strategy, setup, monitoring and optimization according to the approved scope. No fixed number of leads, sales, revenue, ranking position or return on ad spend is guaranteed unless specifically agreed in writing.
                  </div>

                  {/* 18. CLIENT REQUIREMENTS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    18. CLIENT REQUIREMENTS
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Access to Google Ads Account, where required</li>
                    <li>Google Analytics / Tag Manager Access, where applicable</li>
                    <li>Business Information</li>
                    <li>Product / Service Information</li>
                    <li>Offer / Pricing Details</li>
                    <li>Target Location &amp; Audience Information</li>
                    <li>Website / Landing Page Access, where applicable</li>
                    <li>Required approvals and campaign feedback</li>
                    <li>Approved advertising budget in the client's Google Ads account</li>
                  </ul>

                  {/* 19. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    19. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The campaign will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and campaign scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the 100% management fee advance</li>
                    <li>Availability of required account access, business information and campaign assets</li>
                    <li>Availability of the approved advertising budget in the client's Google Ads account</li>
                  </ol>
                </>
              )}

              {/* MULTI-PLATFORM ADVERTISING EXTRA SECTIONS 14 to 18 */}
              {templateType === 'multi_platform_ads' && (
                <>
                  {/* 14. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Ad Creatives</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Video / Reel Production</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Landing Page Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Website Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>WhatsApp API</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Lead Management System</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google Ads Management Only</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Facebook / Instagram Ads Management Only</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>LinkedIn Ads Management Only</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SEO Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Social Media Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 15. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Advertising Spend / Media Budget</li>
                    <li>Third-Party Platform Charges</li>
                    <li>Professional Photography</li>
                    <li>Professional Video Production, unless included</li>
                    <li>Landing Page Development, unless included</li>
                    <li>CRM / Automation Charges</li>
                    <li>WhatsApp API Charges</li>
                    <li>Influencer / Creator Fees</li>
                    <li>Website Development, unless included</li>
                    <li>Guaranteed Leads, Sales or Revenue</li>
                    <li>Services outside the approved scope</li>
                  </ul>

                  {/* 16. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    This proposal covers <strong>multi-platform paid advertising management</strong>. The final platforms, campaign types, number of campaigns, creative requirements, advertising budget and management fee will be finalized according to the approved quotation.
                    <br /><br />
                    Advertising performance is influenced by market conditions, competition, audience, offer quality, creative quality, landing page experience, platform algorithms and advertising budget. No fixed number of leads, sales, revenue or return on ad spend is guaranteed unless specifically agreed in writing.
                  </div>

                  {/* 17. CLIENT REQUIREMENTS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    17. CLIENT REQUIREMENTS
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Required advertising account access</li>
                    <li>Facebook Page &amp; Instagram Account Access, where applicable</li>
                    <li>Google Ads Account Access, where applicable</li>
                    <li>LinkedIn Campaign Manager Access, where applicable</li>
                    <li>Business Information</li>
                    <li>Product / Service Information</li>
                    <li>Offer / Pricing Details</li>
                    <li>Target Location &amp; Audience Information</li>
                    <li>Website / Landing Page Access, where applicable</li>
                    <li>Brand Logo &amp; Approved Brand Assets</li>
                    <li>Required approvals and campaign feedback</li>
                    <li>Approved advertising budget on selected platforms</li>
                  </ul>

                  {/* 18. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    18. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The campaign will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and campaign scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the 100% management fee advance</li>
                    <li>Availability of required account access and campaign assets</li>
                    <li>Availability of the approved advertising budget on selected platforms</li>
                  </ol>
                </>
              )}

              {/* SEO GROWTH EXTRA SECTIONS 14 to 18 */}
              {templateType === 'seo_local_lead_gen' && (
                <>
                  {/* 14. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional SEO Pages</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SEO Blog Writing</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional Location Pages</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Landing Page Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Website Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Facebook / Instagram Ads</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>LinkedIn Ads</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Social Media Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>CRM Integration</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>WhatsApp API / Automation</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 15. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Paid Advertising Budget</li>
                    <li>Paid Third-Party Tools / Software</li>
                    <li>Major Website Development</li>
                    <li>Professional Photography / Video</li>
                    <li>Paid API / Automation Charges</li>
                    <li>Guaranteed Rankings, Leads or Revenue</li>
                    <li>Major website redesign unless specifically quoted</li>
                    <li>Services outside the approved scope</li>
                  </ul>

                  {/* 16. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    16. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    SEO performance depends on competition, website quality, content, authority, search demand, technical factors and search-engine algorithms. <strong>No fixed ranking, traffic, lead or revenue guarantee is provided.</strong>
                    <br /><br />
                    Final deliverables, keywords, target locations, content quantities, pages, timelines and pricing will be confirmed in the approved quotation.
                  </div>

                  {/* 17. CLIENT REQUIREMENTS */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    17. CLIENT REQUIREMENTS
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Website / CMS Access, where required</li>
                    <li>Google Search Console Access</li>
                    <li>Google Analytics Access, where applicable</li>
                    <li>Business Information</li>
                    <li>Products / Services Information</li>
                    <li>Target Locations</li>
                    <li>Competitor Information, where available</li>
                    <li>Brand Assets and Approved Content</li>
                    <li>Required approvals and feedback</li>
                  </ul>

                  {/* 18. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    18. ACCEPTANCE
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
                    The SEO project will be considered confirmed upon:
                  </p>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the 100% advance payment</li>
                    <li>Availability of required website, analytics and business access</li>
                    <li>Submission of required business information and content</li>
                  </ol>
                </>
              )}

              {/* SEO GROWTH & CONTENT MARKETING EXTRA SECTIONS 12 to 15 */}
              {templateType === 'seo_growth_marketing' && (
                <>
                  {/* 12. OPTIONAL SERVICES */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    12. OPTIONAL SERVICES
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, border: '1px solid #198754' }}>
                    <thead>
                      <tr style={{ background: '#e9f7ef' }}>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Service</th>
                        <th style={{ border: '1px solid #198754', padding: '8px 12px', textAlign: 'left' }}>Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Additional SEO Pages</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>SEO Blog Writing</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Landing Page Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Website Development</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Google Ads Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Facebook / Instagram Ads</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>LinkedIn Ads</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                      <tr><td style={{ border: '1px solid #198754', padding: '8px 12px' }}>Social Media Management</td><td style={{ border: '1px solid #198754', padding: '8px 12px', fontWeight: 600 }}>Custom Quote</td></tr>
                    </tbody>
                  </table>

                  {/* 13. NOT INCLUDED */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    13. NOT INCLUDED
                  </div>
                  <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Paid Advertising Budget</li>
                    <li>Paid Third-Party Tools / Software</li>
                    <li>Major Website Development</li>
                    <li>Professional Photography / Video</li>
                    <li>Guaranteed Rankings, Leads or Revenue</li>
                    <li>Services outside the approved scope</li>
                  </ul>

                  {/* 14. IMPORTANT NOTE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    14. IMPORTANT NOTE
                  </div>
                  <div style={{ background: '#e9f7ef', borderLeft: '5px solid #198754', padding: 16, margin: '15px 0 24px 0', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7 }}>
                    SEO performance depends on competition, website quality, content, authority, search demand, technical factors and search-engine algorithms. <strong>No fixed ranking, traffic, lead or revenue guarantee is provided.</strong> Final deliverables, keywords, pages and timelines will be confirmed in the approved quotation.
                  </div>

                  {/* 15. ACCEPTANCE */}
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, paddingLeft: 10, borderLeft: '5px solid #198754', color: '#111' }}>
                    15. ACCEPTANCE
                  </div>
                  <ol style={{ margin: '0 0 24px 0', paddingLeft: 20, fontSize: 13.5, color: '#334155', lineHeight: 1.7 }}>
                    <li>Approval of the proposal and scope</li>
                    <li>Confirmation through Email, WhatsApp or other official communication</li>
                    <li>Receipt of the 100% advance payment</li>
                    <li>Availability of required website, analytics and business access</li>
                  </ol>
                </>
              )}

              <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, borderTop: '2px dashed #cbd5e1', paddingTop: 24, marginTop: 16 }}>
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

              {/* Designed & Developed by HiveRift Footer Branding Line */}
              <div
                style={{
                  marginTop: 26,
                  paddingTop: 12,
                  borderTop: '1px solid #e2e8f0',
                  textAlign: 'center',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#016139',
                  letterSpacing: '0.4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>Designed & Developed by</span>
                <strong style={{ color: '#014D3B', fontWeight: 800 }}>HiveRift Softwares Pvt. Ltd.</strong>
                <span>•</span>
                <span style={{ color: '#198754', fontWeight: 700 }}>
                  www.hiverift.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
