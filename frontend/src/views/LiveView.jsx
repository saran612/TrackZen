import React from 'react';
import { ChevronDown, Filter, AlertTriangle, LogIn, Repeat, LogOut } from 'lucide-react';
import './LiveView.css';

const events = [
  {
    id: 1,
    type: 'alert',
    title: 'High Dwell Alert',
    time: 'Just now',
    desc: 'Subject ID 842 has exceeded 4m dwell time in Electronics.',
    icon: AlertTriangle,
    iconBg: 'bg-danger-light',
    iconColor: 'text-danger',
    link: 'View Clip'
  },
  {
    id: 2,
    type: 'entry',
    title: 'Group Entry',
    time: '2m ago',
    desc: 'Group of 3 entered via Main Entrance.',
    icon: LogIn,
    iconBg: 'bg-gray-100',
    iconColor: 'text-secondary'
  },
  {
    id: 3,
    type: 'transfer',
    title: 'Zone Transfer',
    time: '5m ago',
    desc: 'Significant movement from Apparel A to Checkout.',
    icon: Repeat,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500'
  },
  {
    id: 4,
    type: 'exit',
    title: 'Exit',
    time: '8m ago',
    desc: 'Subject ID 820 exited. Duration: 14m.',
    icon: LogOut,
    iconBg: 'bg-gray-100',
    iconColor: 'text-secondary'
  }
];

export default function LiveView() {
  return (
    <div className="live-view flex h-full gap-6">
      
      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="live-dot"></div>
            <h2 className="text-2xl font-bold text-primary">Live Monitoring</h2>
            <span className="text-secondary text-sm ml-2">4 Active Feeds &bull; High Quality</span>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-outline flex items-center gap-2 bg-white">
              All Zones <ChevronDown size={16} />
            </button>
            <button className="btn btn-outline flex items-center gap-2 bg-white">
              1080p (HQ) <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Camera Grid */}
        <div className="camera-grid">
          {/* Cam 1 */}
          <div className="cam-feed">
            <div className="cam-header">
              <span className="cam-title">CAM 01 - Entrance</span>
              <span className="badge badge-primary">12 Active</span>
            </div>
            <div className="cam-content bg-gray-200">
              {/* Bounding box mockup */}
              <div className="bounding-box box-blue" style={{top: '30%', left: '20%', width: '15%', height: '50%'}}>
                <span className="box-label">ID: 850</span>
              </div>
              <div className="bounding-box box-blue" style={{top: '40%', left: '50%', width: '15%', height: '40%'}}>
                <span className="box-label">ID: 849 (Entry)</span>
              </div>
            </div>
            <div className="cam-controls">
              <div className="scrubber"><div className="scrubber-thumb"></div></div>
              <div className="flex justify-center gap-4 mt-2">
                <button className="icon-btn text-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L4 12l7 7v-3.5c4.6 0 8 1.4 10 4.5-1-5-4-9.5-10-10.5V5z"/></svg></button>
                <button className="icon-btn text-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
                <button className="icon-btn text-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 5v5.5c6 1 9 5.5 10 10.5-2-3.1-5.4-4.5-10-4.5V20l-7-7 7-7z"/></svg></button>
              </div>
            </div>
          </div>

          {/* Cam 2 */}
          <div className="cam-feed">
            <div className="cam-header">
              <span className="cam-title">CAM 02 - Electronics</span>
              <span className="badge badge-danger">High Dwell</span>
            </div>
            <div className="cam-content bg-gray-300">
              <div className="bounding-box box-red" style={{top: '25%', left: '70%', width: '20%', height: '60%'}}>
                <span className="box-label bg-danger text-white">ID: 842 (Dwell: 4m)</span>
              </div>
            </div>
          </div>

          {/* Cam 3 */}
          <div className="cam-feed">
            <div className="cam-header">
              <span className="cam-title">CAM 03 - Apparel A</span>
            </div>
            <div className="cam-content bg-gray-200">
               <div className="bounding-box box-blue" style={{top: '45%', left: '45%', width: '12%', height: '45%'}}>
                <span className="box-label">ID: 835</span>
              </div>
            </div>
          </div>

          {/* Cam 4 */}
          <div className="cam-feed">
            <div className="cam-header">
              <span className="cam-title">CAM 04 - Checkout</span>
              <span className="badge badge-warning">Wait: 1m 20s</span>
            </div>
            <div className="cam-content bg-gray-300 relative border-b-2 border-danger pb-6">
              <div className="bounding-box box-blue border-dashed" style={{top: '60%', left: '20%', width: '60%', height: '35%'}}>
                <span className="box-label bg-white text-primary">Queue Zone: 3 People</span>
              </div>
              <div className="absolute bottom-1 left-0 w-full text-center text-xs font-bold text-danger">RECORDING ACTIVE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Event Feed */}
      <div className="event-feed-sidebar bg-white border-l border-gray-200 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Live Event Feed</h3>
          <button className="icon-btn"><Filter size={16} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
          {events.map(event => (
            <div key={event.id} className="event-item card p-4 flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${event.iconBg} ${event.iconColor}`}>
                <event.icon size={20} />
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold text-sm ${event.type === 'alert' ? 'text-danger' : ''}`}>{event.title}</h4>
                  <span className="text-xs text-secondary whitespace-nowrap ml-2">{event.time}</span>
                </div>
                <p className="text-sm text-secondary mb-2">{event.desc}</p>
                {event.link && (
                  <a href="#" className="text-primary text-sm font-medium">{event.link}</a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 mt-4 text-center">
          <button className="text-primary font-medium text-sm">Pause Feed</button>
        </div>
      </div>

    </div>
  );
}
