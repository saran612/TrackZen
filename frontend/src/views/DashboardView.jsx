import React from 'react';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import './DashboardView.css';

const peakData = [
  { time: '8am', val: 20 },
  { time: '12pm', val: 50 },
  { time: '4pm', val: 80 },
  { time: '8pm', val: 30 },
  { time: '10pm', val: 60 },
];

export default function DashboardView() {
  return (
    <div className="dashboard-view flex flex-col gap-6">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-subtitle !mb-0">MOST VISITED</h3>
            <TrendingUp size={16} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Beverages</h2>
          <span className="badge badge-primary">High Engagement</span>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-subtitle !mb-0">LEAST VISITED</h3>
            <TrendingDown size={16} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Stationery</h2>
          <span className="badge badge-danger">Action Required</span>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-subtitle !mb-0">AVG DWELL TIME</h3>
            <Clock size={16} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">45s</h2>
          <p className="text-sm text-secondary">+12% vs last week</p>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-subtitle !mb-0">TOTAL VISITORS</h3>
            <Users size={16} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">1,248</h2>
          <p className="text-sm text-secondary">Today so far</p>
        </div>
      </div>

      {/* Row 2 */}
      <div className="dashboard-row-2">
        <div className="card live-camera-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title !mb-0">Live Camera Feed</h3>
            <span className="live-indicator">LIVE</span>
          </div>
          <div className="camera-placeholder">
            {/* Using a solid color or gradient for mockup */}
            <div className="camera-zone zone-a">ZONE A</div>
            <div className="camera-zone zone-b">ZONE B</div>
          </div>
        </div>

        <div className="card heatmap-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title !mb-0">Traffic Heatmap</h3>
            <MapIcon size={16} className="text-secondary" />
          </div>
          <div className="heatmap-placeholder">
            <div className="aisle">
              <div className="heat hot"></div>
            </div>
            <div className="aisle">
              <div className="heat mild"></div>
              <div className="heat warm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="card-title">Shelf Popularity Comparison</h3>
          <div className="h-64 mt-4 border-b border-l border-dashed border-gray-200">
             {/* Empty chart placeholder */}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Peak Engagement Periods</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakData}>
                <Area type="monotone" dataKey="val" stroke="#2563eb" fill="rgba(37, 99, 235, 0.1)" strokeWidth={8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4 */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title !mb-0">Shelf Performance Ranking</h3>
          <button className="text-primary font-medium text-sm">View Full Report &rarr;</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-secondary text-sm border-b">
              <th className="pb-4">RANK</th>
              <th className="pb-4">ZONE</th>
              <th className="pb-4 text-right">VISITORS</th>
              <th className="pb-4 text-right">AVG DWELL</th>
              <th className="pb-4 text-right">TOTAL DWELL</th>
              <th className="pb-4 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4 font-medium">1</td>
              <td className="py-4">Beverages (Aisle 3)</td>
              <td className="py-4 text-right">842</td>
              <td className="py-4 text-right">52s</td>
              <td className="py-4 text-right">12.1h</td>
              <td className="py-4 text-center"><span className="badge badge-success">High Traffic</span></td>
            </tr>
            <tr className="border-b">
              <td className="py-4 font-medium">2</td>
              <td className="py-4">Snacks (Aisle 2)</td>
              <td className="py-4 text-right">756</td>
              <td className="py-4 text-right">48s</td>
              <td className="py-4 text-right">10.0h</td>
              <td className="py-4 text-center"><span className="badge badge-success">High Traffic</span></td>
            </tr>
            <tr className="border-b">
              <td className="py-4 font-medium">3</td>
              <td className="py-4">Dairy (Back Wall)</td>
              <td className="py-4 text-right">512</td>
              <td className="py-4 text-right">30s</td>
              <td className="py-4 text-right">4.2h</td>
              <td className="py-4 text-center"><span className="badge badge-primary">Average</span></td>
            </tr>
            <tr>
              <td className="py-4 font-medium">4</td>
              <td className="py-4">Stationery (Aisle 7)</td>
              <td className="py-4 text-right">124</td>
              <td className="py-4 text-right">15s</td>
              <td className="py-4 text-right">0.5h</td>
              <td className="py-4 text-center"><span className="badge badge-danger">Underperforming</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

function MapIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
      <line x1="9" y1="3" x2="9" y2="21"></line>
      <line x1="15" y1="3" x2="15" y2="21"></line>
    </svg>
  );
}
