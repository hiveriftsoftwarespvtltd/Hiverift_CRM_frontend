import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, User, Lock, Building, Bell } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SettingsPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('HiveRift Solutions');
  const [supportEmail, setSupportEmail] = useState('samunder2611@gmail.com');

  const handleSave = (e) => {
    e.preventDefault();
    Swal.fire({ icon: 'success', title: 'Settings Saved', text: 'CRM configuration updated.', timer: 1500, showConfirmButton: false });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure organization profile, system preferences, and branding</p>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Current Profile</h3>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className="avatar avatar-lg" style={{ margin: '0 auto 12px', fontSize: 24, width: 64, height: 64 }}>
              {user?.name?.charAt(0)}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-heading)' }}>{user?.name}</h3>
            <span className="badge badge-assigned">{user?.role?.replace('_', ' ').toUpperCase()}</span>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{user?.email}</div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Company & CRM Preferences</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label required">Company / Organization Name</label>
              <input className="form-input" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label required">System Receiver Email</label>
              <input className="form-input" required type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input className="form-input" value="₹ (INR)" disabled />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Save Settings</button>
          </form>
        </div>
      </div>
    </div>
  );
}
