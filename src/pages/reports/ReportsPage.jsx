import { useState, useEffect } from 'react';
import { reportsAPI } from '../../api';
import { BarChart3, TrendingUp, FolderKanban, Users, RefreshCw, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'sales') res = await reportsAPI.sales();
      else if (activeTab === 'projects') res = await reportsAPI.projects();
      else if (activeTab === 'employees') res = await reportsAPI.employees();
      else if (activeTab === 'renewals') res = await reportsAPI.renewals();
      else res = await reportsAPI.finance();
      setData(res.data.data);
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
          <h1 className="page-title">Executive Reports & Analytics</h1>
          <p className="page-subtitle">Cross-module reporting & business intelligence insights</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <div className="status-tabs">
          {[
            { id: 'sales', label: 'Sales & Lead Report' },
            { id: 'projects', label: 'Projects & Tech Report' },
            { id: 'employees', label: 'Employee Attendance Report' },
            { id: 'renewals', label: 'Renewals & Retention' },
            { id: 'finance', label: 'Finance & Collections' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`status-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div>
          {activeTab === 'sales' && (
            <div>
              <div className="grid-4" style={{ marginBottom: 20 }}>
                <div className="kpi-card">
                  <div>
                    <div className="kpi-value">{data?.totalLeads || 0}</div>
                    <div className="kpi-label">Total Leads</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div>
                    <div className="kpi-value" style={{ color: '#10B981' }}>{data?.wonLeads || 0}</div>
                    <div className="kpi-label">Deals Won</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div>
                    <div className="kpi-value" style={{ color: '#EF4444' }}>{data?.lostLeads || 0}</div>
                    <div className="kpi-label">Deals Lost</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div>
                    <div className="kpi-value">{data?.conversionRate || 0}%</div>
                    <div className="kpi-label">Conversion Rate</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Leads by Status Breakdown</h3>
                <div style={{ height: 260, marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.leadsByStatus || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#016139" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div>
              <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="kpi-card">
                  <div>
                    <div className="kpi-value">₹{(data?.totals?.totalInvoice || 0).toLocaleString()}</div>
                    <div className="kpi-label">Total Invoiced</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div>
                    <div className="kpi-value" style={{ color: '#10B981' }}>₹{(data?.totals?.received || 0).toLocaleString()}</div>
                    <div className="kpi-label">Total Received</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div>
                    <div className="kpi-value" style={{ color: '#EF4444' }}>₹{(data?.totals?.pending || 0).toLocaleString()}</div>
                    <div className="kpi-label">Total Pending</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'sales' && activeTab !== 'finance' && (
            <div className="card">
              <h3 className="card-title">Summary Breakdown</h3>
              <pre style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, fontSize: 13, overflowX: 'auto' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
