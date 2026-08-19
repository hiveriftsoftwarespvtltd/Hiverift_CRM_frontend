import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Core Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Calling & Telecalling
import CallingPage from './pages/calling/CallingPage';

// Sales & CRM
import LeadsPage from './pages/leads/LeadsPage';
import LeadDetailPage from './pages/leads/LeadDetailPage';
import ClientsPage from './pages/clients/ClientsPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import QuotationsPage from './pages/sales/QuotationsPage';
import InvoicesPage from './pages/invoices/InvoicesPage';

// Operations
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import TasksPage from './pages/tasks/TasksPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import RenewalsPage from './pages/renewals/RenewalsPage';

// Team & HR
import AttendancePage from './pages/team/AttendancePage';
import LeavesPage from './pages/team/LeavesPage';
import EmployeesPage from './pages/team/EmployeesPage';

// Analytics & Admin
import ReportsPage from './pages/reports/ReportsPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import SettingsPage from './pages/settings/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Calling / Telecalling */}
              <Route path="/calling" element={<CallingPage />} />

              {/* Leads */}
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/:id" element={<LeadDetailPage />} />

              {/* Clients */}
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />

              {/* Quotations & Invoices */}
              <Route path="/quotations" element={<QuotationsPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />

              {/* Operations */}
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/renewals" element={<RenewalsPage />} />

              {/* HR & Team */}
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/team/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeavesPage />} />
              <Route path="/team/leaves" element={<LeavesPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/team/employees" element={<EmployeesPage />} />

              {/* Analytics & System */}
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/audit" element={<AuditLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
