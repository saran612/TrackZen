import React, { useContext } from 'react';
import { Calendar, ChevronDown, Users, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './AnalyticsView.css';
import { DataContext } from '../components/DataContext';

const trafficData = [
  { name: '09-02-2025', traffic: 17, conversion: 5 },
  { name: 'Other Days', traffic: 0, conversion: 0 },
];

const conversionByCategoryData = [
  { name: 'Beverages', current: 62, previous: 58 },
  { name: 'Snacks', current: 48, previous: 45 },
  { name: 'Cooking Oil', current: 33, previous: 30 },
  { name: 'Stationery', current: 10, previous: 15 },
];

export default function AnalyticsView() {
  const { totalVisitors, avgDwellTime, totalDwellTime, avgEngagement } = useContext(DataContext);

  return (
    <div className="analytics-view flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">Engagement Analytics</h2>
          <p className="text-secondary">Deep dive into store traffic and customer interaction patterns.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline flex items-center gap-2 bg-white">
            <Calendar size={16} /> 09-02-2025
          </button>
          <button className="btn btn-outline flex items-center gap-2 bg-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> All Segments <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="analytics-grid-top">
        {/* Main Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="card-title !mb-0">Traffic Trends vs Conversion</h3>
            <div className="flex gap-4 text-sm font-medium">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span> Traffic</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Conversions</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="traffic" stroke="#2563eb" strokeWidth={2} dot={true} />
                <Line type="monotone" dataKey="conversion" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Stats */}
        <div className="flex flex-col gap-6">
          <div className="card flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-badge bg-primary-light text-primary">
                <Users size={24} />
              </div>
              <h3 className="card-subtitle !mb-0">Total Dwell Time</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-4xl font-bold">{Math.round(totalDwellTime)}</h2>
              <span className="text-secondary font-medium">seconds</span>
            </div>
            <div>
              <span className="badge badge-success">Date: 09-02-2025</span>
            </div>
          </div>
          
          <div className="card flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-badge bg-indigo-100 text-indigo-600">
                <ShoppingCart size={24} />
              </div>
              <h3 className="card-subtitle !mb-0">Avg. Engagement</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-4xl font-bold">{avgEngagement}</h2>
              <span className="text-secondary font-medium">score</span>
            </div>
            <div>
              <span className="badge badge-success">Date: 09-02-2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="analytics-grid-bottom">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title !mb-0">Engagement by Aisle & Hour (09-02-2025)</h3>
            <button className="text-primary font-medium text-sm flex items-center gap-1">Details &gt;</button>
          </div>
          <p className="text-xs text-secondary mb-4">Avg. customers per hour by zone (1 PM & 2 PM alone non-zero)</p>
          
          <div className="heatmap-table-wrapper">
            <table className="heatmap-grid-table">
              <thead>
                <tr>
                  <th className="heatmap-th-label"></th>
                  <th className="heatmap-th">11 AM</th>
                  <th className="heatmap-th">12 PM</th>
                  <th className="heatmap-th">1 PM</th>
                  <th className="heatmap-th">2 PM</th>
                  <th className="heatmap-th">3 PM</th>
                  <th className="heatmap-th">4 PM</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="heatmap-row-label">Beverages</td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-5">8</div></td>
                  <td><div className="hm-cell hm-4">6</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                </tr>
                <tr>
                  <td className="heatmap-row-label">Snacks</td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-4">5</div></td>
                  <td><div className="hm-cell hm-3">4</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                </tr>
                <tr>
                  <td className="heatmap-row-label">Cooking Oil</td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-2">3</div></td>
                  <td><div className="hm-cell hm-2">2</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                </tr>
                <tr>
                  <td className="heatmap-row-label">Stationery</td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-1">1</div></td>
                  <td><div className="hm-cell hm-1">1</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                  <td><div className="hm-cell hm-0" style={{backgroundColor: 'transparent'}}>0</div></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs text-secondary">Low</span>
            <div className="heatmap-legend-bar"></div>
            <span className="text-xs text-secondary">High</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="card-title !mb-0">Conversion by Category (09-02-2025)</h3>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Current</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200"></span> Previous</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionByCategoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `${value}%`} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="previous" fill="#e5e7eb" barSize={16} radius={[2, 2, 0, 0]} />
                <Bar dataKey="current" fill="#2563eb" barSize={16} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
