import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="crm-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="crm-main">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="crm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
