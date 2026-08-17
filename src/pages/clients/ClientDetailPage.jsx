import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsAPI, projectsAPI, paymentsAPI, renewalsAPI } from '../../api';
import { ArrowLeft, Building, Phone, Mail, FolderKanban, CreditCard, RefreshCw, Plus, FileText } from 'lucide-react';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient360();
  }, [id]);

  const fetchClient360 = async () => {
    setLoading(true);
    try {
      const [cRes, prRes, payRes, renRes] = await Promise.all([
        clientsAPI.getOne(id),
        projectsAPI.getAll({ client: id }),
        paymentsAPI.getAll({ client: id }),
        renewalsAPI.getAll({ client: id }),
      ]);
      setClient(cRes.data.data);
      setProjects(prRes.data.data.projects || []);
      setPayments(payRes.data.data.payments || []);
      setRenewals(renRes.data.data.renewals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clients')} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Clients
      </button>

      {/* Header Profile */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="avatar avatar-lg" style={{ background: '#014D3B', color: 'white' }}>
              {client.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-heading)' }}>{client.name}</h1>
                <span className="badge badge-won">{client.clientId}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                {client.company || 'Individual Client'} • {client.city || 'No location'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => navigate(`/projects?client=${client._id}`)}>
              <Plus size={16} /> Create Project
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid-3" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Business Value</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>₹{client.totalBusiness?.toLocaleString() || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pending Payments</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: client.pendingAmount > 0 ? '#EF4444' : 'var(--text-muted)' }}>
              ₹{client.pendingAmount?.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active Services</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)', marginTop: 4 }}>
              {projects.length} Active Projects
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Sub-sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Projects section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Client Projects ({projects.length})</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>View All</button>
          </div>
          {projects.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No projects assigned yet</p> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Department</th>
                  <th>Assigned To</th>
                  <th>Progress</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p._id} onClick={() => navigate(`/projects/${p._id}`)}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.department?.replace('_', ' ').toUpperCase()}</td>
                    <td>{p.assignedTo?.name || 'Unassigned'}</td>
                    <td>
                      <div className="progress-bar-wrap" style={{ width: 100 }}>
                        <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.progress}%</span>
                    </td>
                    <td>{new Date(p.deadline).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payments & Invoices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Payments & Invoices ({payments.length})</h3>
          </div>
          {payments.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No payment history</p> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Payment No</th>
                  <th>Invoice Amt</th>
                  <th>Received</th>
                  <th>Pending</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(py => (
                  <tr key={py._id}>
                    <td style={{ fontWeight: 600 }}>{py.paymentNo}</td>
                    <td>₹{py.invoiceAmount?.toLocaleString()}</td>
                    <td style={{ color: '#10B981', fontWeight: 600 }}>₹{py.receivedAmount?.toLocaleString()}</td>
                    <td style={{ color: '#EF4444', fontWeight: 600 }}>₹{py.pendingAmount?.toLocaleString()}</td>
                    <td><span className={`badge badge-${py.status}`}>{py.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Renewals */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Services & Renewals ({renewals.length})</h3>
          </div>
          {renewals.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No renewal services setup</p> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {renewals.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.service}</td>
                    <td>{new Date(r.startDate).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--red)' }}>{new Date(r.expiryDate).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
