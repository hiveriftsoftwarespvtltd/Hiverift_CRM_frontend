import { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI, usersAPI } from '../../api';
import {
  CheckSquare, Search, Plus, Eye, Trash2, Clock, Calendar,
  FolderKanban, User, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import PaginationControls from '../../components/common/PaginationControls';

const TASK_STATUSES = ['all', 'todo', 'in_progress', 'review', 'completed', 'overdue'];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [taskPage, setTaskPage] = useState(1);

  useEffect(() => {
    setTaskPage(1);
  }, [search, statusTab, priorityFilter]);
  const [previewTask, setPreviewTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    description: '',
    notes: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [statusTab]);

  useEffect(() => {
    fetchProjectsAndUsers();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.data.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsAndUsers = async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        projectsAPI.getAll({ limit: 100 }),
        usersAPI.getAll({ limit: 100 })
      ]);
      setProjects(pRes.data.data.projects || []);
      const allUsers = uRes.data.data.users || [];
      const filteredTechUsers = allUsers.filter(u =>
        ['development', 'digital_marketing'].includes(u.role) ||
        ['development', 'digital_marketing'].includes(u.department)
      );
      setUsers(filteredTechUsers.length > 0 ? filteredTechUsers : allUsers);
    } catch (err) {
      console.error('Error fetching projects/users:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      Swal.fire({ icon: 'success', title: 'Status Updated', timer: 1000, showConfirmButton: false });
      if (previewTask && previewTask._id === taskId) {
        setPreviewTask(prev => ({ ...prev, status: newStatus }));
      }
      fetchTasks();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Status update failed' });
    }
  };

  const handleDeleteTask = async (taskId, title) => {
    const res = await Swal.fire({
      title: 'Delete Task?',
      text: `Are you sure you want to delete "${title || 'this task'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (res.isConfirmed) {
      try {
        await tasksAPI.delete(taskId);
        Swal.fire({ icon: 'success', title: 'Deleted', text: 'Task removed successfully', timer: 1200, showConfirmButton: false });
        if (previewTask && previewTask._id === taskId) {
          setPreviewTask(null);
        }
        fetchTasks();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to delete task' });
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      await tasksAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Task Created', text: 'New action item registered successfully', timer: 1500, showConfirmButton: false });
      setShowCreateModal(false);
      setFormData({
        title: '',
        project: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: '',
        notes: ''
      });
      fetchTasks();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to create task' });
    }
  };

  // Filter tasks based on search & priority
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.project?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    let badgeStyle = { background: '#F1F5F9', color: '#475569' };
    if (p === 'critical' || p === 'high') badgeStyle = { background: '#FFF0F0', color: '#EF4444', border: '1px solid #FECACA' };
    else if (p === 'medium') badgeStyle = { background: '#FFF7DD', color: '#D97706', border: '1px solid #FDE68A' };
    else if (p === 'low') badgeStyle = { background: '#E9F8F1', color: '#016139', border: '1px solid #A7F3D0' };

    return (
      <span className="badge" style={{ ...badgeStyle, fontWeight: 700 }}>
        {p.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const s = (status || 'todo').toLowerCase();
    let badgeClass = 'badge-quotation';
    if (s === 'completed') badgeClass = 'badge-won';
    else if (s === 'overdue') badgeClass = 'badge-lost';
    else if (s === 'in_progress') badgeClass = 'badge-negotiation';
    else if (s === 'review') badgeClass = 'badge-interested';
    return <span className={`badge ${badgeClass}`}>{s.replace(/_/g, ' ').toUpperCase()}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks & Sub-deliverables</h1>
          <p className="page-subtitle">Manage daily action items across all projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <div className="status-tabs">
          {TASK_STATUSES.map(s => (
            <button
              key={s}
              className={`status-tab ${statusTab === s ? 'active' : ''}`}
              onClick={() => setStatusTab(s)}
            >
              {s.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-no-padding" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, padding: '16px 20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: 260, maxWidth: 380 }}>
            <Search />
            <input
              className="search-input"
              placeholder="Search by task title, project, assignee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 160 }}
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">LOW</option>
            <option value="medium">MEDIUM</option>
            <option value="high">HIGH</option>
            <option value="critical">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <CheckSquare />
            <h3>No Tasks Found</h3>
            <p>Tasks assigned to you or your team will appear here.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks
                    .slice((taskPage - 1) * 7, taskPage * 7)
                    .map(t => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        <div>{t.title}</div>
                        {t.description && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {t.project ? (
                          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{t.project.name}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        {t.assignedTo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={13} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{t.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                      <td>{getPriorityBadge(t.priority)}</td>
                      <td style={{ fontSize: 13, fontWeight: t.status === 'overdue' ? 700 : 400, color: t.status === 'overdue' ? 'var(--red)' : 'var(--text-body)' }}>
                        {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: 12, width: 'auto', fontWeight: 600 }}
                          value={t.status}
                          onChange={e => handleStatusChange(t._id, e.target.value)}
                        >
                          <option value="todo">TO DO</option>
                          <option value="in_progress">IN PROGRESS</option>
                          <option value="review">REVIEW</option>
                          <option value="completed">COMPLETED</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* Preview Button */}
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '4px 8px',
                              fontSize: 12,
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            onClick={() => setPreviewTask(t)}
                            title="Preview Full Task Details"
                          >
                            <Eye size={13} /> Preview
                          </button>

                          {/* Delete Button */}
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--red)', padding: '4px 6px' }}
                            onClick={() => handleDeleteTask(t._id, t.title)}
                            title="Delete Task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={taskPage}
              totalPages={Math.ceil(filteredTasks.length / 7) || 1}
              totalItems={filteredTasks.length}
              itemsPerPage={7}
              onPageChange={setTaskPage}
            />
          </>
        )}
      </div>

      {/* Preview / Detail Modal */}
      {previewTask && (
        <div className="modal-overlay" onClick={() => setPreviewTask(null)}>
          <div
            className="modal"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 className="modal-title">{previewTask.title}</h3>
                {getStatusBadge(previewTask.status)}
              </div>
              <button className="modal-close" onClick={() => setPreviewTask(null)}>×</button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {/* Task Meta Overview */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROJECT</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>
                      {previewTask.project?.name || 'General / Unlinked Task'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ASSIGNED TO</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                      {previewTask.assignedTo?.name || 'Unassigned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority, Due Date, Status Selector */}
              <div className="grid-3" style={{ gap: 10, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PRIORITY</div>
                  <div style={{ marginTop: 4 }}>
                    {getPriorityBadge(previewTask.priority)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>DUE DATE</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: previewTask.status === 'overdue' ? 'var(--red)' : 'var(--text-heading)', marginTop: 4 }}>
                    {new Date(previewTask.dueDate).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</div>
                  <div style={{ marginTop: 4 }}>
                    <select
                      className="form-select"
                      style={{ padding: '3px 6px', fontSize: 11, fontWeight: 700, width: '100%' }}
                      value={previewTask.status}
                      onChange={e => handleStatusChange(previewTask._id, e.target.value)}
                    >
                      <option value="todo">TO DO</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="review">REVIEW</option>
                      <option value="completed">COMPLETED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Task Scope & Description:
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-body)', background: '#fff', border: '1px solid var(--border)', padding: 12, borderRadius: 8, minHeight: 60 }}>
                  {previewTask.description || 'No additional description provided.'}
                </div>
              </div>

              {/* Notes */}
              {previewTask.notes && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Additional Notes:
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-body)', background: '#fff', border: '1px solid var(--border)', padding: 10, borderRadius: 8 }}>
                    {previewTask.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => handleDeleteTask(previewTask._id, previewTask.title)}
              >
                <Trash2 size={14} /> Delete Task
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreviewTask(null)}
                >
                  Close
                </button>
                {previewTask.status !== 'completed' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => handleStatusChange(previewTask._id, 'completed')}
                  >
                    <CheckCircle2 size={14} /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Task / Deliverable</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">Task Title</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. Implement Payment Gateway Integration"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Project</label>
                    <select
                      className="form-select"
                      value={formData.project}
                      onChange={e => setFormData({ ...formData, project: e.target.value })}
                    >
                      <option value="">Select Project (Optional)</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select
                      className="form-select"
                      value={formData.assignedTo}
                      onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                    >
                      <option value="">Select Team Member</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">LOW</option>
                      <option value="medium">MEDIUM</option>
                      <option value="high">HIGH</option>
                      <option value="critical">CRITICAL</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Scope</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Provide detailed instructions or acceptance criteria..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
