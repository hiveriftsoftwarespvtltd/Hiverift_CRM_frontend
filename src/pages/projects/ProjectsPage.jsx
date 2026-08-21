import { useState, useEffect } from 'react';
import { projectsAPI, clientsAPI, usersAPI } from '../../api';
import { Plus, Search, FolderKanban, Calendar, User, Eye, CheckSquare, Trash2, UploadCloud, Paperclip, FileText, X, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PaginationControls from '../../components/common/PaginationControls';

const PROJECT_STATUSES = ['all', 'assigned', 'started', 'in_progress', 'review', 'client_review', 'completed', 'on_hold', 'cancelled'];
const DEPARTMENTS = ['digital_marketing', 'development', 'design', 'other'];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [techUsers, setTechUsers] = useState([]);

  useEffect(() => {
    setProjectPage(1);
  }, [search, statusTab, deptFilter]);

  const [formData, setFormData] = useState({
    name: '', client: '', department: 'development', service: 'Web Development', assignedTo: '', startDate: new Date().toISOString().split('T')[0], deadline: '', requirements: '', attachments: []
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
      const allUsers = uRes.data.data.users || [];
      const filteredTechUsers = allUsers.filter(u =>
        ['development', 'digital_marketing'].includes(u.role) ||
        ['development', 'digital_marketing'].includes(u.department)
      );
      setTechUsers(filteredTechUsers.length > 0 ? filteredTechUsers : allUsers);
    } catch {}
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (file.size > 15 * 1024 * 1024) {
        Swal.fire({ icon: 'warning', title: 'File too large', text: `${file.name} exceeds 15MB limit.` });
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const fileObj = {
          name: file.name,
          url: uploadEvent.target.result,
          fileType: file.type || 'application/pdf',
          size: file.size,
          uploadedAt: new Date(),
        };
        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), fileObj]
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      await projectsAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Project Assigned!', text: 'Project created and assigned to tech team successfully', timer: 1500, showConfirmButton: false });
      setShowModal(false);
      setFormData({
        name: '', client: '', department: 'development', service: 'Web Development', assignedTo: '', startDate: new Date().toISOString().split('T')[0], deadline: '', requirements: '', attachments: []
      });
      fetchProjects();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to create project' });
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    const res = await Swal.fire({
      title: 'Delete Project?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await projectsAPI.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
        fetchProjects();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed to delete' });
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.projectId.toLowerCase().includes(search.toLowerCase()) ||
      (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = !deptFilter || p.department === deptFilter;
    const matchesStatus = statusTab === 'all' || p.status === statusTab;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Technical Projects</h1>
          <p className="page-subtitle">Assign, track deliverables, and manage Development & Marketing projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Assign New Project
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
            placeholder="Search by project name, ID, client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
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
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <FolderKanban />
            <h3>No Projects Found</h3>
            <p>Assign technical projects to Development & Digital Marketing teams.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
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
                  {filteredProjects
                    .slice((projectPage - 1) * 7, projectPage * 7)
                    .map(p => (
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
            </div>
            <PaginationControls
              currentPage={projectPage}
              totalPages={Math.ceil(filteredProjects.length / 7) || 1}
              totalItems={filteredProjects.length}
              itemsPerPage={7}
              onPageChange={setProjectPage}
            />
          </>
        )}
      </div>

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
                      {techUsers.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role === 'development' ? 'Developer' : u.role === 'digital_marketing' ? 'Digital Marketer' : u.role?.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Start Date</label>
                    <input type="date" className="form-input" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Deadline</label>
                    <input type="date" className="form-input" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Technical Requirements & Scope</label>
                  <textarea className="form-textarea" placeholder="Tech stack, features, API requirements, credentials..." value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
                </div>

                {/* File / PDF / Document Upload */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Paperclip size={15} style={{ color: 'var(--primary)' }} />
                      Attach PDF / Documents / Wireframes
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max 15MB each</span>
                  </label>

                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 8,
                    padding: '14px',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'border-color 0.2s'
                  }}>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.csv,.xlsx"
                      onChange={handleFileUpload}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <UploadCloud size={24} style={{ color: 'var(--primary)', marginBottom: 4 }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                      Click or drag files here to attach PDF or Documents
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Supports: PDF, DOC, DOCX, TXT, Images, ZIP, Excel
                    </div>
                  </div>

                  {/* Attached Files List */}
                  {formData.attachments && formData.attachments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                      {formData.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border)',
                            borderRadius: 6
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <div style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              background: att.name?.toLowerCase().endsWith('.pdf') ? '#FEE2E2' : '#E0F2FE',
                              color: att.name?.toLowerCase().endsWith('.pdf') ? '#DC2626' : '#0284C7',
                              fontWeight: 700,
                              fontSize: 11
                            }}>
                              {att.name?.toLowerCase().endsWith('.pdf') ? 'PDF' : att.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 280 }}>
                                {att.name}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {(att.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--red)', padding: '4px 6px' }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
