import React, { useState } from 'react';
import { User, Bell, Store, Shield, Save } from 'lucide-react';
import './SettingsView.css';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section">
            <h3 className="text-xl font-bold mb-4">Profile Information</h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" className="form-control" defaultValue="Victor" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" className="form-control" defaultValue="Callahan" />
              </div>
              <div className="form-group col-span-2">
                <label>Email Address</label>
                <input type="email" className="form-control" defaultValue="victor@trackzen.com" />
              </div>
              <div className="form-group col-span-2">
                <label>Role</label>
                <input type="text" className="form-control bg-gray-50" defaultValue="Store Manager" disabled />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary flex items-center gap-2"><Save size={16} /> Save Changes</button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="settings-section">
            <h3 className="text-xl font-bold mb-4">Notification Preferences</h3>
            <div className="flex flex-col gap-4 mb-6">
              <label className="toggle-row flex justify-between items-center p-4 border border-gray-100 rounded-md">
                <div>
                  <h4 className="font-bold text-sm">High Dwell Alerts</h4>
                  <p className="text-xs text-secondary">Get notified when a customer dwells in a zone for too long.</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle-checkbox" />
              </label>
              <label className="toggle-row flex justify-between items-center p-4 border border-gray-100 rounded-md">
                <div>
                  <h4 className="font-bold text-sm">Queue Length Alerts</h4>
                  <p className="text-xs text-secondary">Get notified when checkout queues exceed maximum capacity.</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle-checkbox" />
              </label>
              <label className="toggle-row flex justify-between items-center p-4 border border-gray-100 rounded-md">
                <div>
                  <h4 className="font-bold text-sm">Daily Summary Report</h4>
                  <p className="text-xs text-secondary">Receive an email summary of the store's daily performance.</p>
                </div>
                <input type="checkbox" className="toggle-checkbox" />
              </label>
            </div>
          </div>
        );
      case 'store':
        return (
          <div className="settings-section">
            <h3 className="text-xl font-bold mb-4">Store Configuration</h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="form-group">
                <label>Store ID</label>
                <input type="text" className="form-control bg-gray-50" defaultValue="402" disabled />
              </div>
              <div className="form-group">
                <label>Store Name</label>
                <input type="text" className="form-control" defaultValue="Store #402" />
              </div>
              <div className="form-group">
                <label>Region</label>
                <select className="form-control">
                  <option>North Region</option>
                  <option>South Region</option>
                  <option>East Region</option>
                  <option>West Region</option>
                </select>
              </div>
              <div className="form-group">
                <label>Operating Hours</label>
                <select className="form-control">
                  <option>08:00 AM - 10:00 PM</option>
                  <option>24 Hours</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary flex items-center gap-2"><Save size={16} /> Save Settings</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-view flex flex-col h-full gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">Settings</h2>
          <p className="text-secondary">Manage your account preferences and store configurations.</p>
        </div>
      </div>

      <div className="card flex flex-1 p-0 overflow-hidden">
        {/* Settings Navigation */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
          <ul className="flex flex-col gap-2">
            <li>
              <button 
                className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> Profile
              </button>
            </li>
            <li>
              <button 
                className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} /> Notifications
              </button>
            </li>
            <li>
              <button 
                className={`settings-tab ${activeTab === 'store' ? 'active' : ''}`}
                onClick={() => setActiveTab('store')}
              >
                <Store size={18} /> Store Config
              </button>
            </li>
            <li>
              <button 
                className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Shield size={18} /> Security
              </button>
            </li>
          </ul>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
