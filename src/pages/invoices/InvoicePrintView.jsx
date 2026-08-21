import React from 'react';
import { X, Printer } from 'lucide-react';

const getInvoicePDFTitle = (invoiceNo) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const YYYY = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const DD = pad(now.getDate());
  const HH = pad(now.getHours());
  const Min = pad(now.getMinutes());
  const SS = pad(now.getSeconds());
  const cleanInv = invoiceNo ? invoiceNo.replace(/[^a-zA-Z0-9_-]/g, '') : 'Draft';
  return `HiveRift-Portal-Invoice-${cleanInv}-${YYYY}-${MM}-${DD}-${HH}-${Min}-${SS}`;
};

export default function InvoicePrintView({ invoice, onClose }) {
  if (!invoice) return null;

  const currency = invoice.currency || '₹';
  const formattedDate = invoice.date
    ? new Date(invoice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const formattedDueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Due on Receipt';

  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = getInvoicePDFTitle(invoice.invoiceNo);
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  const defaultNotes = 'Notes: Thank you for choosing HiveRift Softwares Pvt Ltd. We appreciate your business and look forward to continuing our association.';
  const displayNotes = invoice.notes?.trim() || defaultNotes;
  const displayTerms = invoice.terms?.trim() || 'Payment is due upon receipt of this invoice. Please make the payment to the official bank account mentioned below.';

  return (
    <div
      className="invoice-print-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
    >
      {/* Floating Toolbar */}
      <div
        className="no-print"
        style={{
          width: '100%',
          maxWidth: 820,
          background: '#ffffff',
          borderRadius: 12,
          padding: '12px 20px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
            Invoice #{invoice.invoiceNo}
          </span>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              background: invoice.status === 'paid' ? '#dcfce7' : invoice.status === 'partially_paid' ? '#fef3c7' : '#e2e8f0',
              color: invoice.status === 'paid' ? '#166534' : invoice.status === 'partially_paid' ? '#b45309' : '#475569',
            }}
          >
            {invoice.status?.replace('_', ' ')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
            style={{
              background: '#016139',
              borderColor: '#016139',
              fontSize: 13,
              padding: '7px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Printer size={15} /> Print / Save as PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ fontSize: 13, padding: '7px 14px' }}
          >
            <X size={16} /> Close
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 Dimension Canvas) */}
      <div
        id="printable-invoice"
        className="printable-invoice-sheet"
        style={{
          width: '100%',
          maxWidth: 820,
          background: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          padding: '44px 48px',
          boxSizing: 'border-box',
          color: '#0f172a',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Header: Logo + Company Name & Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={invoice.logo || '/logo.png'}
              alt="HiveRift Logo"
              style={{ maxHeight: 65, maxWidth: 190, objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#016139', letterSpacing: '0.5px' }}>HiveRift</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>HiveRift Softwares Pvt Ltd</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '1px', margin: 0 }}>
              HIVERIFT INVOICE
            </h1>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#016139', marginTop: 4 }}>
              # {invoice.invoiceNo}
            </div>
          </div>
        </div>

        {/* Sender & Recipient & Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, marginBottom: 28 }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                From:
              </div>
              <div style={{ fontSize: 13, color: '#1e293b', whiteSpace: 'pre-line', lineHeight: 1.5, fontWeight: 500 }}>
                {invoice.from || `HiveRift Softwares Pvt Ltd\nGSTIN: XXXXXXXXXXXXXXX\ninfo@hiverift.com\n+91 9667106291`}
              </div>
            </div>

            {invoice.billTo?.trim() && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                  Bill To:
                </div>
                <div style={{ fontSize: 13, color: '#0f172a', whiteSpace: 'pre-line', lineHeight: 1.5, fontWeight: 700 }}>
                  {invoice.billTo.trim()}
                </div>
                {invoice.shipTo?.trim() && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                      Ship To:
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-line' }}>{invoice.shipTo.trim()}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Meta Column */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Invoice Date:</span>
              <strong style={{ color: '#0f172a' }}>{formattedDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Due Date:</span>
              <strong style={{ color: '#0f172a' }}>{formattedDueDate}</strong>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28 }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#ffffff' }}>
              <th style={{ padding: '11px 14px', fontSize: 12, fontWeight: 800, textAlign: 'left', borderRadius: '6px 0 0 6px' }}>Item / Service Details</th>
              <th style={{ padding: '11px 14px', fontSize: 12, fontWeight: 800, textAlign: 'center', width: 90 }}>Quantity</th>
              <th style={{ padding: '11px 14px', fontSize: 12, fontWeight: 800, textAlign: 'right', width: 120 }}>Rate</th>
              <th style={{ padding: '11px 14px', fontSize: 12, fontWeight: 800, textAlign: 'right', width: 130, borderRadius: '0 6px 6px 0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).filter((it) => it.description?.trim()).map((it, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                <td style={{ padding: '12px 14px', fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{it.description}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: '#475569', textAlign: 'center' }}>{it.quantity}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: '#475569', textAlign: 'right' }}>
                  {currency}{Number(it.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>
                  {currency}{Number(it.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom Section: Notes & Calculations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, marginBottom: 28 }}>
          <div>
            {displayTerms && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>Terms & Conditions:</div>
                <div style={{ fontSize: 11.5, color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{displayTerms}</div>
              </div>
            )}

            {displayNotes && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>Notes:</div>
                <div style={{ fontSize: 11.5, color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{displayNotes}</div>
              </div>
            )}
          </div>

          {/* Totals Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Subtotal:</span>
              <strong style={{ color: '#0f172a' }}>{currency}{Number(invoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            {invoice.taxAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Tax ({invoice.taxRate}%):</span>
                <span>+{currency}{Number(invoice.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {invoice.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Discount:</span>
                <span>-{currency}{Number(invoice.discountAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {invoice.shipping > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Shipping:</span>
                <span>+{currency}{Number(invoice.shipping || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#0f172a', borderTop: '1px solid #cbd5e1', paddingTop: 8 }}>
              <span>Total:</span>
              <span>{currency}{Number(invoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 600 }}>
              <span>Amount Paid:</span>
              <span>{currency}{Number(invoice.amountPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900, color: '#016139', borderTop: '2px solid #0f172a', paddingTop: 10 }}>
              <span>Balance Due:</span>
              <span>{currency}{Number(invoice.balanceDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Official Bank Account Details Box */}
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '16px 20px', color: '#ffffff', fontSize: 12, marginBottom: 20 }}>
          <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
            Official Bank Account Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, color: '#cbd5e1' }}>
            <div>Account Holder: <strong style={{ color: '#ffffff' }}>HiveRift Software's Pvt Ltd</strong></div>
            <div>Account Number: <strong style={{ color: '#ffffff' }}>75560500722</strong></div>
            <div>IFSC Code: <strong style={{ color: '#ffffff' }}>ICIC0007556 (ICICI Bank)</strong></div>
            <div>Corporate UPI: <strong style={{ color: '#38bdf8' }}>MSHIVERIFTSOFTWARESPVTLTD.eazypay@icici</strong></div>
          </div>
        </div>

        {/* Designed by HiveRift Softwares Branding Mark */}
        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 12, borderTop: '1px solid #e2e8f0', fontSize: 11, color: '#64748b', fontWeight: 600 }}>
          Designed by HiveRift Softwares
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-overlay,
          .printable-invoice-sheet,
          .printable-invoice-sheet * {
            visibility: visible;
          }
          .invoice-print-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-invoice-sheet {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
