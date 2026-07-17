import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Map, Package, Users, Settings, HelpCircle, LogOut, Download, Video } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/' },
  { id: 'engagement', label: 'Engagement', icon: BarChart2, path: '/analytics' },
  { id: 'live-view', label: 'Live View', icon: Video, path: '/live-view' },
  { id: 'heatmaps', label: 'Heatmaps', icon: Map, path: '/heatmaps' },
  { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory' },
  { id: 'staffing', label: 'Staffing', icon: Users, path: '/staffing' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar flex flex-col">
      <div className="sidebar-header flex items-center gap-4">
        <div className="store-logo">
          <span className="logo-text">402</span>
        </div>
        <div className="store-info">
          <h2 className="store-name">Store #402</h2>
          <p className="store-region">North Region</p>
        </div>
      </div>

      <nav className="sidebar-nav flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <NavLink 
                to={item.path} 
                end={item.path === '/'}
                className={({ isActive }) => `nav-item flex items-center gap-4 ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-primary w-full flex items-center justify-center gap-2 mb-4">
          <Download size={16} />
          <span className="btn-label">Export Report</span>
        </button>
        <ul className="footer-links">
          <li>
            <a href="#" className="nav-item flex items-center gap-4">
              <HelpCircle size={20} className="nav-icon" />
              <span className="nav-label">Help Center</span>
            </a>
          </li>
          <li>
            <a href="#" className="nav-item flex items-center gap-4">
              <LogOut size={20} className="nav-icon" />
              <span className="nav-label">Sign Out</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
