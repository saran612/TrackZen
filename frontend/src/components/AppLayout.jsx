import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './AppLayout.css';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`app-container ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Sidebar />
      <main className="main-content flex-1 flex flex-col h-screen overflow-hidden">
        <TopNav onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="page-content flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
