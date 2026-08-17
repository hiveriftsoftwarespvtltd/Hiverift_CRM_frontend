import api from './axios';

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  refresh: (data) => api.post('/auth/refresh', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getMe: () => api.get('/auth/me'),
};

// Users / Team
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Leads
export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getOne: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  updateStatus: (id, status) => api.put(`/leads/${id}/status`, { status }),
  assign: (id, assignedTo) => api.put(`/leads/${id}/assign`, { assignedTo }),
  addFollowup: (id, data) => api.post(`/leads/${id}/followups`, data),
  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),
  delete: (id) => api.delete(`/leads/${id}`),
  getStats: () => api.get('/leads/stats'),
  getTodayFollowups: () => api.get('/leads/today-followups'),
};

// Clients
export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getOne: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Quotations
export const quotationsAPI = {
  getAll: (params) => api.get('/quotations', { params }),
  getOne: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  updateStatus: (id, status) => api.put(`/quotations/${id}/status`, { status }),
  sendEmail: (id) => api.post(`/quotations/${id}/send-email`),
  delete: (id) => api.delete(`/quotations/${id}`),
};

// Projects
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  updateStatus: (id, status) => api.put(`/projects/${id}/status`, { status }),
  updateProgress: (id, progress) => api.put(`/projects/${id}/progress`, { progress }),
  addNote: (id, text) => api.post(`/projects/${id}/notes`, { text }),
  getStats: () => api.get('/projects/stats'),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Tasks
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  getProgress: (projectId) => api.get(`/tasks/${projectId}/progress`),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Payments
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getOne: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getSummary: () => api.get('/payments/summary'),
};

// Renewals
export const renewalsAPI = {
  getAll: (params) => api.get('/renewals', { params }),
  create: (data) => api.post('/renewals', data),
  update: (id, data) => api.put(`/renewals/${id}`, data),
  renew: (id, data) => api.put(`/renewals/${id}/renew`, data),
  getDashboard: () => api.get('/renewals/dashboard'),
};

// Attendance
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getMy: () => api.get('/attendance/my'),
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: () => api.put('/attendance/checkout'),
  getTodaySummary: () => api.get('/attendance/today-summary'),
  getMonthlyReport: (params) => api.get('/attendance/monthly-report', { params }),
};

// Leaves
export const leavesAPI = {
  getAll: (params) => api.get('/leaves', { params }),
  apply: (data) => api.post('/leaves', data),
  approve: (id) => api.put(`/leaves/${id}/approve`),
  reject: (id, reason) => api.put(`/leaves/${id}/reject`, { reason }),
};

// Calling / Telecalling
export const callingAPI = {
  uploadBatch: (data) => api.post('/calling/upload', data),
  assignContacts: (data) => api.post('/calling/assign', data),
  getMyQueue: (params) => api.get('/calling/my-queue', { params }),
  getAllContacts: (params) => api.get('/calling/contacts', { params }),
  getBatches: (params) => api.get('/calling/batches', { params }),
  logCall: (id, data) => api.post(`/calling/log-call/${id}`, data),
  convertToLead: (id) => api.post(`/calling/convert-to-lead/${id}`),
  getStats: () => api.get('/calling/stats'),
  deleteBatch: (id) => api.delete(`/calling/batches/${id}`),
  deleteContact: (id) => api.delete(`/calling/contacts/${id}`),
};

// Notifications
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Audit Logs
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
};

// Reports
export const reportsAPI = {
  sales: (params) => api.get('/reports/sales', { params }),
  projects: (params) => api.get('/reports/projects', { params }),
  employees: (params) => api.get('/reports/employees', { params }),
  renewals: (params) => api.get('/reports/renewals', { params }),
  finance: (params) => api.get('/reports/finance', { params }),
};

// Dashboard
export const dashboardAPI = {
  admin: () => api.get('/dashboard/admin'),
  sales: () => api.get('/dashboard/sales'),
  tech: () => api.get('/dashboard/tech'),
  hr: () => api.get('/dashboard/hr'),
};

export default api;
