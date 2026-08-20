import { useState, useEffect } from 'react';
import {
  FileText, Printer, Send, Edit3, Eye, Trash2, Plus, X, Building, User, Mail, Phone, Calendar, Check, Save, Sparkles, Globe, Megaphone, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { quotationsAPI } from '../../api';
import Swal from 'sweetalert2';

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
