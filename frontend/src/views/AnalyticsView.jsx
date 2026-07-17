import React from 'react';
import { Calendar, ChevronDown, Users, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './AnalyticsView.css';

const trafficData = [
  { name: 'Oct 1', traffic: 2000, conversion: 800 },
  { name: 'Oct 8', traffic: 4500, conversion: 2000 },
  { name: 'Oct 15', traffic: 5000, conversion: 3000 },
  { name: 'Oct 22', traffic: 8000, conversion: 5500 },
  { name: 'Oct 31', traffic: 9000, conversion: 6000 },
];

const conversionByCategoryData = [
  { name: 'Electronics', current: 30, previous: 25 },
  { name: 'Apparel', current: 15, previous: 18 },
  { name: 'Home', current: 22, previous: 12 },
  { name: 'Seasonal', current: 35, previous: 33 },
];

export default function AnalyticsView() {
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
            <Calendar size={16} /> Oct 1 - Oct 31, 2023
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
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                <Tooltip />
                <Line type="monotone" dataKey="traffic" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversion" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
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
              <h2 className="text-4xl font-bold">1,402</h2>
              <span className="text-secondary font-medium">hours</span>
            </div>
            <div>
              <span className="badge badge-success">&uarr; 12.5% vs last mo</span>
            </div>
          </div>
          
          <div className="card flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-badge bg-indigo-100 text-indigo-600">
                <ShoppingCart size={24} />
              </div>
              <h3 className="card-subtitle !mb-0">Avg. Conversion Rate</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-4xl font-bold">24.8</h2>
              <span className="text-secondary font-medium">%</span>
            </div>
            <div>
              <span className="badge badge-danger">&darr; 2.1% vs last mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="analytics-grid-bottom">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title !mb-0">Engagement by Aisle & Hour</h3>
            <button className="text-primary font-medium text-sm flex items-center gap-1">Details &gt;</button>
          </div>
          <p className="text-xs text-secondary mb-4">Avg. customers per hour by zone</p>
          
          <div className="heatmap-table-wrapper">
            <table className="heatmap-grid-table">
              <thead>
                <tr>
                  <th className="heatmap-th-label"></th>
                  <th className="heatmap-th">8 AM</th>
                  <th className="heatmap-th">10 AM</th>
                  <th className="heatmap-th">12 PM</th>
                  <th className="heatmap-th">2 PM</th>
                  <th className="heatmap-th">4 PM</th>
                  <th className="heatmap-th">6 PM</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="heatmap-row-label">Electronics</td>
                  <td><div className="hm-cell hm-2">18</div></td>
                  <td><div className="hm-cell hm-3">34</div></td>
                  <td><div className="hm-cell hm-5">72</div></td>
                  <td><div className="hm-cell hm-4">56</div></td>
                  <td><div className="hm-cell hm-4">48</div></td>
                  <td><div className="hm-cell hm-3">31</div></td>
                </tr>
                <tr>
                  <td className="heatmap-row-label">Apparel</td>
                  <td><div className="hm-cell hm-1">8</div></td>
                  <td><div className="hm-cell hm-2">22</div></td>
                  <td><div className="hm-cell hm-3">38</div></td>
                  <td><div className="hm-cell hm-4">52</div></td>
                  <td><div className="hm-cell hm-5">65</div></td>
                  <td><div className="hm-cell hm-3">40</div></td>
                </tr>
                <tr>
                  <td className="heatmap-row-label">Home Goods</td>
                  <td><div className="hm-cell hm-2">15</div></td>
                  <td><div className="hm-cell hm-4">45</div></td>
                  <td><div className="hm-cell hm-2">20</div></td>
                  <td><div className="hm-cell hm-1">12</div></td>
                  <td><div className="hm-cell hm-2">19</div></td>
                  <td><div className="hm-cell hm-1">10</div></td>
                </tr>
                <tr>
                  <td className="heatmap-row-label">Seasonal</td>
                  <td><div className="hm-cell hm-1">5</div></td>
                  <td><div className="hm-cell hm-2">14</div></td>
                  <td><div className="hm-cell hm-5">68</div></td>
                  <td><div className="hm-cell hm-4">50</div></td>
                  <td><div className="hm-cell hm-3">35</div></td>
                  <td><div className="hm-cell hm-2">18</div></td>
                </tr>
                <tr>
                  <td className="heatmap-row-label">Checkout</td>
                  <td><div className="hm-cell hm-1">10</div></td>
                  <td><div className="hm-cell hm-2">20</div></td>
                  <td><div className="hm-cell hm-4">55</div></td>
                  <td><div className="hm-cell hm-3">42</div></td>
                  <td><div className="hm-cell hm-5">78</div></td>
                  <td><div className="hm-cell hm-5">70</div></td>
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
            <h3 className="card-title !mb-0">Conversion by Category</h3>
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
