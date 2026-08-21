import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ClipboardList, Shield } from 'lucide-react';
import PaginationControls from '../../components/common/PaginationControls';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditPage, setAuditPage] = useState(1);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/audit');
      setLogs(data.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Trail & Security Logs</h1>
          <p className="page-subtitle">Immutable log of system events, status changes, and user actions</p>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <ClipboardList />
            <h3>No Audit Logs Found</h3>
            <p>System activities like status changes and lead conversions will be logged here.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {logs
                    .slice((auditPage - 1) * 7, auditPage * 7)
                    .map(l => (
                    <tr key={l._id}>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(l.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{l.user?.name || 'System'}</td>
                      <td><span className="badge badge-assigned">{l.action}</span></td>
                      <td>{l.module?.toUpperCase()}</td>
                      <td style={{ fontSize: 13 }}>{l.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={auditPage}
              totalPages={Math.ceil(logs.length / 7) || 1}
              totalItems={logs.length}
              itemsPerPage={7}
              onPageChange={setAuditPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
