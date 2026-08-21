
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({ currentPage, totalPages, totalItems, itemsPerPage = 7, onPageChange }) {
  if (totalItems <= itemsPerPage && totalPages <= 1) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
        Showing <strong style={{ color: 'var(--text-heading)' }}>{startItem}</strong> to{' '}
        <strong style={{ color: 'var(--text-heading)' }}>{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{totalItems}</strong> entries
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '5px 10px',
            fontSize: 12,
            fontWeight: 700,
            opacity: currentPage <= 1 ? 0.4 : 1,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {pages.map((p, idx) => (
          p === '...' ? (
            <span key={`dots-${idx}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 12 }}>...</span>
          ) : (
            <button
              key={`page-${p}`}
              type="button"
              className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onPageChange(p)}
              style={{
                padding: '4px 9px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 6,
                minWidth: 28,
              }}
            >
              {p}
            </button>
          )
        ))}

        <button
          type="button"
          className="btn btn-sm btn-secondary"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '5px 10px',
            fontSize: 12,
            fontWeight: 700,
            opacity: currentPage >= totalPages ? 0.4 : 1,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
