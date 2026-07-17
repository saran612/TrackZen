import React from 'react';
import { Video, Calendar, Clock, Settings, User } from 'lucide-react';
import './TopNav.css';

export default function TopNav() {
  return (
    <header className="topnav flex items-center justify-between">
      <h1 className="topnav-title">Retail Engagement Analytics</h1>
      
      <div className="topnav-actions flex items-center gap-4">
        <button className="icon-btn"><Video size={20} /></button>
        <button className="icon-btn"><Calendar size={20} /></button>
        <button className="icon-btn"><Clock size={20} /></button>
        <button className="icon-btn"><Settings size={20} /></button>
        <div className="avatar">
          <User size={20} />
        </div>
      </div>
    </header>
  );
}
