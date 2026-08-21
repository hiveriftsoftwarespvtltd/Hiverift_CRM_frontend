import { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Trash2, Image as ImageIcon, Upload, DollarSign,
  Percent, ArrowRight, Printer, Mail, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { invoicesAPI, clientsAPI } from '../../api';
import Swal from 'sweetalert2';

const DEFAULT_HIVERIFT_LOGO = '/logo.png';
const DEFAULT_HIVERIFT_FROM = `HiveRift Softwares Pvt Ltd
GSTIN: XXXXXXXXXXXXXXX
info@hiverift.com
+91 9667106291`;

const DEFAULT_HIVERIFT_NOTES = `Notes: Thank you for choosing HiveRift Softwares Pvt Ltd. We appreciate your business and look forward to continuing our association.`;

export const PAYMENT_TERMS_CONFIG = {
  due_on_receipt: {
    label: 'Due on Receipt',
    text: 'Payment is due upon receipt of this invoice. Please make the payment to the official bank account mentioned below.',
    days: 0,
  },
  credit_15: {
    label: '15 Days Credit',
    text: 'Payment is due within 15 days from the invoice date. Please transfer the payment to the official bank account mentioned below.',
    days: 15,
  },
  advance: {
    label: 'Advance Payment',
    text: 'This invoice represents an advance payment for the agreed services. Project work will proceed according to the agreed scope and payment schedule.',
    days: 0,
  },
};

export default function InvoiceEditorModal({ isOpen, onClose, invoiceToEdit, onSaved, clients = [] }) {
  const [logo, setLogo] = useState(DEFAULT_HIVERIFT_LOGO);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [from, setFrom] = useState(DEFAULT_HIVERIFT_FROM);
  const [billTo, setBillTo] = useState('');
  const [shipTo, setShipTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTermKey, setPaymentTermKey] = useState('due_on_receipt');
  const [currency, setCurrency] = useState('₹');

  const [items, setItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  const [notes, setNotes] = useState(DEFAULT_HIVERIFT_NOTES);
  const [terms, setTerms] = useState(PAYMENT_TERMS_CONFIG.due_on_receipt.text);

  // Tax, Discount, Shipping
  const [taxRate, setTaxRate] = useState(0);
  const [showTax, setShowTax] = useState(true);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState(0);
  const [showShipping, setShowShipping] = useState(false);
  const [shipping, setShipping] = useState(0);

  const [amountPaid, setAmountPaid] = useState(0);
  const [selectedClient, setSelectedClient] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (invoiceToEdit) {
      setLogo(invoiceToEdit.logo || DEFAULT_HIVERIFT_LOGO);
      setInvoiceNo(invoiceToEdit.invoiceNo || '');
      setFrom(invoiceToEdit.from || DEFAULT_HIVERIFT_FROM);
      setBillTo(invoiceToEdit.billTo || '');
      setShipTo(invoiceToEdit.shipTo || '');
      const d = invoiceToEdit.date ? new Date(invoiceToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      setDate(d);
      setDueDate(invoiceToEdit.dueDate ? new Date(invoiceToEdit.dueDate).toISOString().split('T')[0] : '');
      const termKey = invoiceToEdit.paymentTermKey || 'due_on_receipt';
      setPaymentTermKey(termKey);
      setCurrency(invoiceToEdit.currency || '₹');
      setItems(invoiceToEdit.items && invoiceToEdit.items.length > 0 ? invoiceToEdit.items : [{ description: '', quantity: 1, rate: 0, amount: 0 }]);
      setNotes(invoiceToEdit.notes || DEFAULT_HIVERIFT_NOTES);
      setTerms(invoiceToEdit.terms || PAYMENT_TERMS_CONFIG[termKey]?.text || PAYMENT_TERMS_CONFIG.due_on_receipt.text);
      setTaxRate(invoiceToEdit.taxRate || 0);
      setShowTax((invoiceToEdit.taxRate || 0) > 0);
      setDiscountType(invoiceToEdit.discountType || 'percentage');
      setDiscountValue(invoiceToEdit.discountValue || 0);
      setShowDiscount((invoiceToEdit.discountValue || 0) > 0);
      setShipping(invoiceToEdit.shipping || 0);
      setShowShipping((invoiceToEdit.shipping || 0) > 0);
      setAmountPaid(invoiceToEdit.amountPaid || 0);
      setSelectedClient(invoiceToEdit.client?._id || invoiceToEdit.client || '');
    } else {
      // New Invoice defaults
      const todayStr = new Date().toISOString().split('T')[0];
      setLogo(DEFAULT_HIVERIFT_LOGO);
      setInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
      setFrom(DEFAULT_HIVERIFT_FROM);
      setBillTo('');
      setShipTo('');
      setDate(todayStr);
      setDueDate(todayStr);
      setPaymentTermKey('due_on_receipt');
      setCurrency('₹');
      setItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
      setNotes(DEFAULT_HIVERIFT_NOTES);
      setTerms(PAYMENT_TERMS_CONFIG.due_on_receipt.text);
      setTaxRate(0);
      setShowTax(false);
      setDiscountType('percentage');
      setDiscountValue(0);
      setShowDiscount(false);
      setShipping(0);
      setShowShipping(false);
      setAmountPaid(0);
      setSelectedClient('');
    }
  }, [invoiceToEdit, isOpen]);

  const handlePaymentTermChange = (key) => {
    setPaymentTermKey(key);
    const cfg = PAYMENT_TERMS_CONFIG[key];
    if (cfg) {
      setTerms(cfg.text);
      if (cfg.days > 0) {
        const baseDate = date ? new Date(date) : new Date();
        baseDate.setDate(baseDate.getDate() + cfg.days);
        setDueDate(baseDate.toISOString().split('T')[0]);
      } else {
        setDueDate(date);
      }
    }
  };

  if (!isOpen) return null;

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('File too large', 'Please upload a logo smaller than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Client Selection auto-fills Bill To
  const handleClientSelect = (clientId) => {
    setSelectedClient(clientId);
    const cl = clients.find((c) => c._id === clientId);
    if (cl) {
      const parts = [cl.name];
      if (cl.company) parts.push(cl.company);
      if (cl.email) parts.push(cl.email);
      if (cl.phone) parts.push(cl.phone);
      if (cl.address) parts.push(cl.address);
      setBillTo(parts.join('\n'));
    }
  };

  // Line Item Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    const qty = Number(updated[index].quantity) || 0;
    const rate = Number(updated[index].rate) || 0;
    updated[index].amount = Math.round(qty * rate * 100) / 100;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) {
      setItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
    } else {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const computedTaxAmount = showTax && taxRate > 0 ? (subtotal * Number(taxRate)) / 100 : 0;
  
  let computedDiscountAmount = 0;
  if (showDiscount && discountValue > 0) {
    if (discountType === 'percentage') {
      computedDiscountAmount = (subtotal * Number(discountValue)) / 100;
    } else {
      computedDiscountAmount = Number(discountValue);
    }
  }

  const computedShipping = showShipping ? Number(shipping) || 0 : 0;
  const total = Math.max(0, subtotal + computedTaxAmount - computedDiscountAmount + computedShipping);
  const paid = Number(amountPaid) || 0;
  const balanceDue = Math.max(0, total - paid);

  const handleSave = async (statusOverride) => {
    if (!billTo.trim()) {
      Swal.fire('Recipient Missing', 'Please specify who this invoice is billed to (Bill To)', 'warning');
      return;
    }
    if (!items.some((i) => i.description.trim() && i.rate > 0)) {
      Swal.fire('Line Item Required', 'Please add at least one line item with description and rate', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        invoiceNo: invoiceNo.trim(),
        logo,
        from: from.trim(),
        billTo: billTo.trim(),
        shipTo: shipTo.trim() || undefined,
        date,
        dueDate: dueDate || undefined,
        paymentTermKey,
        currency,
        items: items.map((i) => ({
          description: i.description.trim(),
          quantity: Number(i.quantity) || 1,
          rate: Number(i.rate) || 0,
          amount: Number(i.amount) || 0,
        })),
        notes: notes.trim(),
        terms: terms.trim(),
        subtotal,
        taxRate: showTax ? Number(taxRate) : 0,
        taxAmount: computedTaxAmount,
        discountType,
        discountValue: showDiscount ? Number(discountValue) : 0,
        discountAmount: computedDiscountAmount,
        shipping: computedShipping,
        total,
        amountPaid: paid,
        balanceDue,
        status: statusOverride || (invoiceToEdit?.status || 'draft'),
        client: selectedClient || undefined,
      };

      let res;
      if (invoiceToEdit?._id) {
        res = await invoicesAPI.update(invoiceToEdit._id, payload);
        Swal.fire({
          icon: 'success',
          title: 'Invoice Updated',
          text: `Invoice #${payload.invoiceNo} has been updated.`,
          timer: 1500,
          showConfirmButton: false,
          iconColor: '#016139',
        });
      } else {
        res = await invoicesAPI.create(payload);
        Swal.fire({
          icon: 'success',
          title: 'Invoice Created',
          text: `Invoice #${payload.invoiceNo} has been generated.`,
          timer: 1500,
          showConfirmButton: false,
          iconColor: '#016139',
        });
      }

      onSaved(res.data?.data);
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          maxHeight: '92vh',
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease',
        }}
      >
        {/* Top Sticky Header Controls */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              {invoiceToEdit ? `Edit Invoice #${invoiceNo}` : 'New Invoice Generator'}
            </span>
            {/* Currency Selector */}
            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 6, padding: 2 }}>
              {['₹', '$', '€', '£'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  style={{
                    border: 'none',
                    background: currency === c ? '#016139' : 'transparent',
                    color: currency === c ? '#ffffff' : '#475569',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSave()}
              disabled={saving}
              style={{
                fontSize: 13,
                padding: '6px 16px',
                background: '#016139',
                borderColor: '#016139',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {invoiceToEdit ? 'Update Invoice' : 'Save Invoice'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Sheet */}
        <div style={{ padding: '32px 40px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
          
          {/* Header Row: Logo (Left) vs HIVERIFT INVOICE # (Right) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            {/* Logo Box with default HiveRift logo & change option */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleLogoUpload}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: 8,
                    minHeight: 70,
                    minWidth: 160,
                  }}
                >
                  <img
                    src={logo || DEFAULT_HIVERIFT_LOGO}
                    alt="Logo"
                    style={{ maxHeight: 60, maxWidth: 170, objectFit: 'contain' }}
                    onError={(e) => {
                      // Fallback if network logo fails
                      e.target.onerror = null;
                      e.target.src = '/logo.png';
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#016139',
                      cursor: 'pointer',
                    }}
                  >
                    Change Logo
                  </button>
                  {logo !== DEFAULT_HIVERIFT_LOGO && (
                    <button
                      type="button"
                      onClick={() => setLogo(DEFAULT_HIVERIFT_LOGO)}
                      style={{
                        background: 'none',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      Reset Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Title & Number Box */}
            <div style={{ textAlign: 'right' }}>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '1px',
                  margin: '0 0 10px 0',
                }}
              >
                HIVERIFT INVOICE
              </h1>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}>
                <span style={{ padding: '6px 10px', background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 700, borderRight: '1px solid #cbd5e1' }}>
                  #
                </span>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="1"
                  style={{
                    border: 'none',
                    outline: 'none',
                    padding: '6px 10px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',
                    width: 120,
                    textAlign: 'right',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sender, Recipient & Meta Grid (Matching Image) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, marginBottom: 28 }}>
            
            {/* Left: Who is this from & Bill To & Ship To */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* From Box */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                  Who is this from?
                </label>
                <textarea
                  rows={2}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Who is this from?"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                    color: '#1e293b',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Bill To & Ship To Side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Bill To */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Bill To <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {clients.length > 0 && (
                      <select
                        value={selectedClient}
                        onChange={(e) => handleClientSelect(e.target.value)}
                        style={{ fontSize: 10, padding: '1px 4px', border: '1px solid #cbd5e1', borderRadius: 4, background: '#f8fafc', color: '#016139', cursor: 'pointer', maxWidth: 110 }}
                      >
                        <option value="">Select Client</option>
                        {clients.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={billTo}
                    onChange={(e) => setBillTo(e.target.value)}
                    placeholder="Who is this to?"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 13,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      outline: 'none',
                      color: '#1e293b',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Ship To */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                    Ship To <span style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={shipTo}
                    onChange={(e) => setShipTo(e.target.value)}
                    placeholder="(optional)"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 13,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      outline: 'none',
                      color: '#1e293b',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Meta Dates */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'flex-start' }}>
              {/* Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none', color: '#0f172a' }}
                />
              </div>

              {/* Due Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Due Date</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none', color: '#0f172a' }}
                />
              </div>

              {/* Payment Terms Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Terms Type</span>
                <select
                  value={paymentTermKey}
                  onChange={(e) => handlePaymentTermChange(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                    color: '#016139',
                    background: '#f8fafc',
                    cursor: 'pointer',
                  }}
                >
                  {Object.entries(PAYMENT_TERMS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Table (Dark Navy Header #0f172a matching screenshot) */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 90px 120px 100px 30px',
                background: '#0f172a',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '8px 8px 0 0',
                fontSize: 12,
                fontWeight: 700,
                alignItems: 'center',
              }}
            >
              <div>Item</div>
              <div style={{ textAlign: 'center' }}>Quantity</div>
              <div style={{ textAlign: 'right' }}>Rate</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
              <div></div>
            </div>

            {/* Rows */}
            <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 90px 120px 100px 30px',
                    padding: '8px 12px',
                    borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f1f5f9',
                    alignItems: 'center',
                    gap: 8,
                    background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                  }}
                >
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Description of item/service..."
                    style={{
                      padding: '8px 10px',
                      fontSize: 13,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      outline: 'none',
                      color: '#0f172a',
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    style={{
                      padding: '8px 8px',
                      fontSize: 13,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      outline: 'none',
                      textAlign: 'center',
                      color: '#0f172a',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}>
                    <span style={{ padding: '8px 6px', background: '#f8fafc', color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                      {currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      style={{
                        padding: '8px 8px',
                        fontSize: 13,
                        border: 'none',
                        outline: 'none',
                        textAlign: 'right',
                        width: '100%',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                    {currency}{Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 2,
                    }}
                    title="Delete item"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {/* + Line Item Button (Full Width matching screenshot) */}
              <button
                type="button"
                onClick={addItem}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: '#f1f5f9',
                  border: 'none',
                  borderTop: '1px solid #e2e8f0',
                  color: '#016139',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
              >
                <Plus size={14} /> Line Item
              </button>
            </div>
          </div>

          {/* Bottom Grid: Notes & Terms (Left) vs Calculations (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
            
            {/* Left: Notes & Terms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes - any relevant information not already covered"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                    color: '#334155',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Terms
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                    color: '#334155',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Right: Subtotal, Tax, Discount, Shipping, Total, Paid, Balance Due */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              
              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#475569' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                  {currency}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Tax Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, gap: 10 }}>
                <span style={{ color: '#475569' }}>Tax</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden', width: 90 }}>
                    <input
                      type="number"
                      min="0"
                      value={taxRate}
                      onChange={(e) => {
                        setTaxRate(e.target.value);
                        setShowTax(true);
                      }}
                      style={{ padding: '4px 6px', fontSize: 12, border: 'none', outline: 'none', textAlign: 'right', width: '100%' }}
                    />
                    <span style={{ padding: '4px 6px', background: '#f8fafc', color: '#64748b', fontSize: 11, fontWeight: 700 }}>%</span>
                  </div>
                  {showTax && (
                    <button
                      type="button"
                      onClick={() => { setShowTax(false); setTaxRate(0); }}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Discount / Shipping Toggles */}
              <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 600, color: '#016139' }}>
                {!showDiscount ? (
                  <button
                    type="button"
                    onClick={() => setShowDiscount(true)}
                    style={{ background: 'none', border: 'none', color: '#016139', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                  >
                    + Discount
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'space-between' }}>
                    <span style={{ color: '#dc2626' }}>Discount:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        min="0"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        style={{ width: 65, padding: '4px 6px', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 6, textAlign: 'right' }}
                      />
                      <button
                        type="button"
                        onClick={() => setDiscountType(discountType === 'percentage' ? 'fixed' : 'percentage')}
                        style={{ border: '1px solid #cbd5e1', background: '#f8fafc', padding: '3px 6px', fontSize: 11, borderRadius: 4, cursor: 'pointer' }}
                      >
                        {discountType === 'percentage' ? '%' : currency}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowDiscount(false); setDiscountValue(0); }}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {!showShipping ? (
                  <button
                    type="button"
                    onClick={() => setShowShipping(true)}
                    style={{ background: 'none', border: 'none', color: '#016139', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                  >
                    + Shipping
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Shipping:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        min="0"
                        value={shipping}
                        onChange={(e) => setShipping(e.target.value)}
                        style={{ width: 75, padding: '4px 6px', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 6, textAlign: 'right' }}
                      />
                      <button
                        type="button"
                        onClick={() => { setShowShipping(false); setShipping(0); }}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#0f172a',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                <span>Total</span>
                <span>{currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Amount Paid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, gap: 10 }}>
                <span style={{ color: '#475569' }}>Amount Paid</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden', width: 110 }}>
                  <span style={{ padding: '6px 8px', background: '#f8fafc', color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    style={{ padding: '6px 8px', fontSize: 13, border: 'none', outline: 'none', textAlign: 'right', width: '100%', color: '#0f172a' }}
                  />
                </div>
              </div>

              {/* Balance Due (Large Bold Highlight) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  color: balanceDue > 0 ? '#016139' : '#166534',
                  borderTop: '2px solid #0f172a',
                  paddingTop: 10,
                  marginTop: 6,
                }}
              >
                <span>Balance Due</span>
                <span>{currency}{balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
