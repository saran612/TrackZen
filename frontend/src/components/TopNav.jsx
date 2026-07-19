import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Settings, User, Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TopNav.css';

export default function TopNav({ onToggleSidebar }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="topnav flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="icon-btn sidebar-toggle-btn" title="Toggle Sidebar">
          <Menu size={20} />
        </button>
        <h1 className="topnav-title">TrackZen</h1>
      </div>
      
      <div className="topnav-actions flex items-center gap-4">
        <button onClick={toggleTheme} className="icon-btn" title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <Link to="/nvr" className="icon-btn" title="NVR Video Wall"><Video size={20} /></Link>
        <button className="icon-btn"><Calendar size={20} /></button>
        <button className="icon-btn"><Clock size={20} /></button>
        <div className="avatar">
          <User size={20} />
        </div>
      </div>
    </header>
  );
}
