import React from 'react';
import { Users, AlertTriangle, Clock, Briefcase, Map, ChevronRight } from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './StaffingView.css';

const laborForecastData = [
  { time: '08:00', traffic: 20, labor: 20 },
  { time: '09:00', traffic: 35, labor: 20 },
  { time: '10:00', traffic: 45, labor: 50 },
  { time: '11:00', traffic: 55, labor: 50 },
  { time: '12:00', traffic: 80, labor: 50 },
  { time: '13:00', traffic: 70, labor: 70 },
  { time: '14:00', traffic: 65, labor: 70 },
  { time: '15:00', traffic: 60, labor: 70 },
  { time: '16:00', traffic: 85, labor: 70 },
  { time: '17:00', traffic: 95, labor: 90 },
  { time: '18:00', traffic: 80, labor: 90 },
  { time: '19:00', traffic: 50, labor: 50 },
];

const shiftData = [
  { id: 1, initials: 'JD', name: 'John Doe', zone: 'Electronics', shift: '08:00 - 16:00', task: 'Assisting Customer', score: '92/100', color: 'bg-primary-light text-primary-dark' },
  { id: 2, initials: 'SM', name: 'Sarah Miller', zone: 'Electronics', shift: '10:00 - 18:00', task: 'Restocking', score: '88/100', color: 'bg-primary-light text-primary-dark' },
  { id: 3, initials: 'MT', name: 'Mike Thomas', zone: 'Apparel', shift: '09:00 - 17:00', task: 'Zone Patrol', score: '95/100', color: 'bg-primary text-white' },
];

export default function StaffingView() {
  return (
    <div className="staffing-view flex flex-col h-full gap-6 overflow-y-auto pr-2 pb-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-primary mb-1">Staffing Optimization</h2>
        <p className="text-secondary">Align labor with real-time customer traffic patterns.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-4 gap-6">
        
        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-secondary">Staff-to-Customer<br/>Ratio</span>
            <Users size={20} className="text-secondary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">1:12</h2>
          <span className="badge badge-primary bg-primary-light text-primary-dark font-bold text-xs inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-dark"></span> Balanced
          </span>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-secondary">Peak Gap Probability</span>
            <AlertTriangle size={20} className="text-secondary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">15%</h2>
          <span className="badge badge-primary bg-primary-light text-primary-dark font-bold text-xs inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-dark"></span> Low Risk
          </span>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-secondary">Avg Response Time</span>
            <Clock size={20} className="text-secondary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">2m 14s</h2>
          <p className="text-sm text-secondary">-12s vs yesterday</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-secondary">Active Staff</span>
            <Briefcase size={20} className="text-secondary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">18/22</h2>
          <p className="text-sm text-secondary">On floor</p>
        </div>

      </div>

      {/* Middle Row */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Forecast Chart */}
        <div className="card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="card-title !mb-0">Labor vs. Traffic Forecast</h3>
            <button className="text-primary font-bold text-sm">Details</button>
          </div>
          <div className="flex-1 relative" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={laborForecastData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e5e7eb" />
                <XAxis dataKey="time" hide={true} />
                <YAxis hide={true} />
                <Tooltip />
                <Area type="monotone" dataKey="traffic" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
                <Line type="stepAfter" dataKey="labor" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="bg-white/80 px-4 py-1 rounded-md text-sm text-secondary font-medium backdrop-blur-sm shadow-sm border border-gray-100">Chart Visualization Area</span>
            </div>
          </div>
        </div>

        {/* Coverage Map */}
        <div className="card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="card-title !mb-0">Zone Coverage Map</h3>
            <Map size={20} className="text-secondary" />
          </div>
          <div className="coverage-map-area flex-1 rounded-lg relative">
             
             {/* Map Container */}
             <div className="zone-map-container">
                
                <div className="flex gap-4">
                   <div className="zone-block flex-1">
                     <span className="zone-label">Electronics</span>
                     <div className="flex justify-center gap-2">
                       <span className="staff-dot staff-dot-primary">JD</span>
                       <span className="staff-dot staff-dot-primary">SM</span>
                     </div>
                   </div>
                   
                   <div className="zone-block" style={{ width: '80px' }}>
                     <span className="zone-label">Checkouts</span>
                     <div className="flex flex-col items-center gap-2">
                       <span className="staff-dot-sm staff-dot-primary">A</span>
                       <span className="staff-dot-sm staff-dot-primary">B</span>
                       <span className="staff-dot-sm staff-dot-primary">C</span>
                     </div>
                   </div>
                </div>

                <div className="zone-block" style={{ marginTop: 'auto' }}>
                   <span className="zone-label">Apparel</span>
                   <div className="flex justify-center gap-2">
                     <span className="staff-dot staff-dot-primary">MT</span>
                     <span className="staff-dot staff-dot-muted">EW</span>
                   </div>
                </div>

             </div>

          </div>
        </div>

      </div>

      {/* Shift Management Table */}
      <div className="card p-0 overflow-hidden mt-2">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h3 className="card-title !mb-0">Shift Management</h3>
          <button className="btn btn-outline bg-white text-sm py-1.5">Manage Shifts</button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-xs font-bold text-secondary uppercase tracking-wider">Staff Member</th>
              <th className="py-4 px-6 text-xs font-bold text-secondary uppercase tracking-wider">Assigned Zone</th>
              <th className="py-4 px-6 text-xs font-bold text-secondary uppercase tracking-wider">Shift Time</th>
              <th className="py-4 px-6 text-xs font-bold text-secondary uppercase tracking-wider">Current Task</th>
              <th className="py-4 px-6 text-xs font-bold text-secondary uppercase tracking-wider text-right">Performance Score</th>
            </tr>
          </thead>
          <tbody>
            {shiftData.map((staff, idx) => (
              <tr key={staff.id} className={idx !== shiftData.length - 1 ? 'border-b border-gray-100' : ''}>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${staff.color}`}>
                      {staff.initials}
                    </span>
                    <span className="font-bold text-sm">{staff.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-secondary">{staff.zone}</td>
                <td className="py-4 px-6 text-sm text-secondary">{staff.shift}</td>
                <td className="py-4 px-6">
                  <span className="bg-primary-light text-primary-dark text-xs font-bold px-2 py-1 rounded-md">{staff.task}</span>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-right">{staff.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
