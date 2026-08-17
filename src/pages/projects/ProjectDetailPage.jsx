import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI, tasksAPI, usersAPI } from '../../api';
import { ArrowLeft, CheckSquare, Plus, Calendar, User, FolderKanban, Clock, Send, ShieldCheck, Tag, RefreshCw, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

const PROJECT_STATUSES = ['assigned', 'started', 'in_progress', 'review', 'client_review', 'completed', 'on_hold', 'cancelled'];
const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const PROGRESS_QUICK_PRESETS = [0, 25, 50, 75, 100];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Create Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '', description: '', assignedTo: '', priority: 'medium', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  });

  const [noteText, setNoteText] = useState('');

  const canSeeCommercialValue = ['admin', 'management', 'sales'].includes(user?.role);

  useEffect(() => {
    fetchProjectAndTasks();
    fetchUsers();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getAll({ project: id }),
      ]);
      setProject(pRes.data.data);
      setTasks(tRes.data.data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await usersAPI.getAll({ limit: 100 });
      setUsers(data.data.users || []);
    } catch {}
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await projectsAPI.updateStatus(id, newStatus);
      if (newStatus === 'completed' && project?.progress < 100) {
        await projectsAPI.updateProgress(id, 100);
      }
      Swal.fire({ icon: 'success', title: `Project status set to ${newStatus.replace('_', ' ').toUpperCase()}`, timer: 1500, showConfirmButton: false });
      fetchProjectAndTasks();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Status update failed' });
    }
  };

  const handleProgressChange = async (newProgress) => {
    const pVal = Math.min(100, Math.max(0, Number(newProgress)));
    setUpdatingProgress(true);
    try {
      await projectsAPI.updateProgress(id, pVal);
      setProject(prev => prev ? { ...prev, progress: pVal } : prev);
      Swal.fire({ icon: 'success', title: `Progress updated to ${pVal}%! 🚀`, timer: 1000, showConfirmButton: false });
      fetchProjectAndTasks();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not update progress' });
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      fetchProjectAndTasks();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Task status update failed' });
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...taskData, project: id };
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) delete payload[k];
      });
      await tasksAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Task Created!', timer: 1200, showConfirmButton: false });
      setShowTaskModal(false);
      setTaskData({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] });
      fetchProjectAndTasks();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to create task' });
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await projectsAPI.addNote(id, noteText);
      setNoteText('');
      fetchProjectAndTasks();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not add note' });
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>;
  if (!project) return <div>Project not found</div>;

  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-heading)' }}>{project.name}</h1>
              <span className={`badge badge-${project.status}`}>{project.status.replace('_', ' ').toUpperCase()}</span>
              <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--primary)', fontWeight: 700 }}>
                {project.projectId}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
              Client: <strong>{project.client?.name}</strong> • Department: <strong>{project.department?.replace('_', ' ').toUpperCase()}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {/* Interactive Progress Bar & Quick Milestone Buttons */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>Project Completion Progress</span>
              {tasks.length > 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ({completedTasksCount}/{tasks.length} Tasks Completed)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: project.progress === 100 ? '#10B981' : 'var(--primary)' }}>
                {project.progress}%
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="progress-bar-wrap" style={{ height: 12, borderRadius: 6, marginBottom: 12 }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${project.progress}%`,
                background: project.progress === 100 ? '#10B981' : 'linear-gradient(90deg, #016139 0%, #10B981 100%)',
                borderRadius: 6,
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* Quick Progress Buttons & Interactive Slider — ONLY for Assigned Developer / Technical Staff */}
          {['development', 'digital_marketing'].includes(user?.role) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Update My Progress:</span>
                {PROGRESS_QUICK_PRESETS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleProgressChange(p)}
                    className={`btn btn-sm ${project.progress === p ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      background: project.progress === p ? '#016139' : undefined,
                    }}
                  >
                    {p}%
                  </button>
                ))}
              </div>

              {/* Slider for custom % */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Custom:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={project.progress}
                  onChange={e => handleProgressChange(e.target.value)}
                  style={{ width: 120, cursor: 'pointer', accentColor: '#016139' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Lifecycle Change bar */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
            Update Project Status:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PROJECT_STATUSES.map(st => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`btn btn-sm ${project.status === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, textTransform: 'capitalize' }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left column — Tasks & Requirements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tasks List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Tasks ({tasks.length})</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
            </div>

            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tasks created for this project yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600 }}>{t.title}</td>
                      <td>{t.assignedTo?.name || 'Unassigned'}</td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority.toUpperCase()}</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(t.dueDate).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '3px 8px', fontSize: 12, width: 'auto', fontWeight: 600 }}
                          value={t.status}
                          onChange={e => handleTaskStatusChange(t._id, e.target.value)}
                        >
                          <option value="todo">TO DO</option>
                          <option value="in_progress">IN PROGRESS</option>
                          <option value="review">REVIEW</option>
                          <option value="completed">COMPLETED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Technical Requirements */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 8 }}>Requirements & Tech Stack</h3>
            <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
              {project.requirements || 'No specific technical requirements documented.'}
            </p>
          </div>

          {/* Project Notes */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>Project Discussion & Notes</h3>
            <form onSubmit={handleAddNote} style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
              <input className="form-input" placeholder="Add technical note or updates..." value={noteText} onChange={e => setNoteText(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Post</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {project.notes?.map((n, i) => (
                <div key={i} style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                  <div>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>Project Meta</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Assigned Technical Lead</div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{project.assignedTo?.name || 'Unassigned'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.assignedTo?.email}</div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Department / Service</div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                  {project.service || project.department?.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Start Date</div>
                <div style={{ fontWeight: 500 }}>{new Date(project.startDate).toLocaleDateString()}</div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Deadline</div>
                <div style={{ fontWeight: 600, color: 'var(--red)' }}>{new Date(project.deadline).toLocaleDateString()}</div>
              </div>

              {/* Commercial Contract Value — Strictly visible ONLY to Admin, Management, and Sales */}
              {canSeeCommercialValue && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Project Contract Value</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#016139' }}>
                    ₹{project.value?.toLocaleString() || 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidential commercial deal value</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create Project Task</h3>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">Task Title</label>
                  <input className="form-input" required placeholder="Setup API Authentication" value={taskData.title} onChange={e => setTaskData({ ...taskData, title: e.target.value })} />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label required">Assign To</label>
                    <select className="form-select" required value={taskData.assignedTo} onChange={e => setTaskData({ ...taskData, assignedTo: e.target.value })}>
                      <option value="">Select Developer</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={taskData.priority} onChange={e => setTaskData({ ...taskData, priority: e.target.value })}>
                      {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Due Date</label>
                  <input type="date" className="form-input" required value={taskData.dueDate} onChange={e => setTaskData({ ...taskData, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
