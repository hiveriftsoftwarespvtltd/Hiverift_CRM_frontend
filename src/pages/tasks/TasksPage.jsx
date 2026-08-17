import { useState, useEffect } from 'react';
import { tasksAPI } from '../../api';
import { CheckSquare, Search, Plus, Eye, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

const TASK_STATUSES = ['all', 'todo', 'in_progress', 'review', 'completed', 'overdue'];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [statusTab]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      fetchTasks();
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Status update failed' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks & Sub-deliverables</h1>
          <p className="page-subtitle">Manage daily action items across all projects</p>
        </div>
      </div>

      <div style={{ marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <div className="status-tabs">
          {TASK_STATUSES.map(s => (
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

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <CheckSquare />
            <h3>No Tasks Found</h3>
            <p>Tasks assigned to you or your team will appear here.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{t.title}</td>
                  <td>{t.project?.name || 'N/A'}</td>
                  <td>{t.assignedTo?.name || 'Unassigned'}</td>
                  <td><span className={`badge badge-${t.priority}`}>{t.priority.toUpperCase()}</span></td>
                  <td style={{ fontSize: 13 }}>{new Date(t.dueDate).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                      value={t.status}
                      onChange={e => handleStatusChange(t._id, e.target.value)}
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
    </div>
  );
}
