import { useState, useEffect } from 'react';
import { projectsAPI, clientsAPI, usersAPI } from '../../api';
import { Plus, Search, FolderKanban, Calendar, User, Eye, CheckSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const PROJECT_STATUSES = ['all', 'assigned', 'started', 'in_progress', 'review', 'client_review', 'completed', 'on_hold', 'cancelled'];
const DEPARTMENTS = ['digital_marketing', 'development', 'design', 'other'];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [techUsers, setTechUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: '', client: '', department: 'development', service: 'Web Development', assignedTo: '', startDate: new Date().toISOString().split('T')[0], deadline: '', value: '', requirements: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchClientsAndUsers();
  }, [statusTab, search, deptFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      const { data } = await projectsAPI.getAll(params);
      setProjects(data.data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndUsers = async () => {
    try {
      const [cRes, uRes] = await Promise.all([
        clientsAPI.getAll({ limit: 100 }),
        usersAPI.getAll({ limit: 100 }),
      ]);
      setClients(cRes.data.data.clients || []);
      setTechUsers(uRes.data.data.users || []);
    } catch {}
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      if (formData.value) payload.value = Number(formData.value);
      await projectsAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Project Assigned!', text: 'Project created and notification sent', timer: 1500, showConfirmButton: false });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to create project' });
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    const res = await Swal.fire({
      title: 'Delete Project?',
      text: `Delete project "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
    });
    if (res.isConfirmed) {
      try {
        await projectsAPI.delete(id);
        fetchProjects();
      } catch {}
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Delivery</h1>
          <p className="page-subtitle">Track development & digital marketing deliverables</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <div className="status-tabs">
          {PROJECT_STATUSES.map(s => (
            <button
              key={s}
              className={`status-tab ${statusTab === s ? 'active' : ''}`}
              onClick={() => setStatusTab(s)}
            >
              {s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-bar" style={{ borderRadius: '12px 12px 0 0', border: '1px solid var(--border)' }}>
        <div className="search-box">
          <Search />
          <input
            className="search-input"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 180, padding: '7px 12px' }}
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d}>{d.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper" style={{ borderRadius: '0 0 12px 12px' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <FolderKanban />
            <h3>No Projects Found</h3>
            <p>Assign technical projects to Development & Digital Marketing teams.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Client</th>
                <th>Department</th>
                <th>Assigned Tech</th>
                <th>Progress</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id} onClick={() => navigate(`/projects/${p._id}`)}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.projectId}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{p.name}</td>
                  <td>{p.client?.name || 'N/A'}</td>
                  <td>
                    <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-body)' }}>
                      {p.department?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{p.assignedTo?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar-wrap" style={{ width: 80 }}>
                        <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{new Date(p.deadline).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${p.status}`}>
                      {p.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${p._id}`); }}>
                      <Eye size={15} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={(e) => handleDelete(p._id, p.name, e)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Create Technical Project</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Project Name</label>
                    <input className="form-input" required placeholder="E-commerce Redesign" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Select Client</label>
                    <select className="form-select" required value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })}>
                      <option value="">Select Client</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.company || 'Individual'})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label required">Department</label>
                    <select className="form-select" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Type</label>
                    <input className="form-input" placeholder="SEO / Web Dev" value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Employee</label>
                    <select className="form-select" value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}>
                      <option value="">Select Developer / Marketer</option>
                      {techUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label required">Start Date</label>
                    <input type="date" className="form-input" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Deadline</label>
                    <input type="date" className="form-input" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Project Value (₹)</label>
                    <input type="number" className="form-input" placeholder="150000" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Technical Requirements</label>
                  <textarea className="form-textarea" placeholder="Tech stack, features, API requirements..." value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
