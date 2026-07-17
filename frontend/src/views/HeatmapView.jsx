import React from 'react';
import { Calendar, Filter, ChevronDown, Flame, Snowflake, GitMerge, Clock } from 'lucide-react';
import './HeatmapView.css';

export default function HeatmapView() {
  return (
    <div className="heatmap-view flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">Traffic Heatmaps</h2>
          <p className="text-secondary">Visualize customer flow and engagement density across the floor plan.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline flex items-center gap-2 bg-white">
            <Calendar size={16} /> Last 7 Days <ChevronDown size={16} />
          </button>
          <button className="btn btn-outline flex items-center gap-2 bg-white">
            <Filter size={16} /> All Zones <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="heatmap-grid">
        
        {/* Left Column: Heatmap */}
        <div className="card flex flex-col p-0 overflow-hidden">
          {/* Heatmap Card Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
            <div className="toggle-group flex bg-primary-light p-1 rounded-md">
              <button className="toggle-btn active">Traffic Volume</button>
              <button className="toggle-btn text-secondary">Avg Dwell Time</button>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-danger"></span> High</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-warning"></span> Med</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-success"></span> Low</div>
            </div>
          </div>
          
          {/* Heatmap Area */}
          <div className="heatmap-area flex-1 relative bg-gray-100">
             {/* Simulating the floor plan with a simple background for mockup purposes */}
             <div className="floorplan-mockup w-full h-full absolute inset-0 opacity-20"></div>
             
             {/* Heat spots */}
             <div className="heat-spot spot-high" style={{ left: '50%', top: '70%', width: '180px', height: '140px' }}></div>
             <div className="heat-spot spot-medium" style={{ left: '40%', top: '40%', width: '120px', height: '180px' }}></div>
             <div className="heat-spot spot-low" style={{ left: '20%', top: '20%', width: '200px', height: '150px' }}></div>
             <div className="heat-spot spot-high" style={{ left: '60%', top: '80%', width: '250px', height: '100px' }}></div>
             <div className="heat-spot spot-medium" style={{ left: '70%', top: '30%', width: '140px', height: '140px' }}></div>
             <div className="heat-spot spot-low" style={{ left: '15%', top: '60%', width: '100px', height: '100px' }}></div>
             
             {/* Icons over heatmap */}
             <div className="heatmap-icon" style={{ left: '35%', top: '45%' }}><Clock size={16} /></div>
             <div className="heatmap-icon" style={{ left: '65%', top: '35%' }}><Clock size={16} /></div>
             <div className="heatmap-icon" style={{ left: '55%', top: '75%' }}><Clock size={16} /></div>
          </div>
        </div>

        {/* Right Column: Stats Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Busiest Aisle Card */}
          <div className="card border-t-4 border-t-primary">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={20} className="text-primary" />
              <h3 className="font-bold text-primary-dark text-lg">Busiest Aisle</h3>
            </div>
            <h2 className="text-2xl font-bold mb-2">Aisle 4 - Snacks</h2>
            <p className="text-sm text-secondary mb-6">Accounts for 22% of total store foot traffic today.</p>
            <div className="progress-bar-container">
              <div className="progress-bar-fill bg-orange-600" style={{ width: '22%' }}></div>
            </div>
          </div>

          {/* Dead Zones Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Snowflake size={20} className="text-secondary" />
                <h3 className="font-bold text-lg">Dead Zones</h3>
              </div>
              <span className="badge badge-danger text-xs">&lt; 5% Engaged</span>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-secondary text-sm">Aisle 12 - Spices</span>
                <span className="font-bold text-sm">3.2%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-secondary text-sm">Endcap B - Seasonal</span>
                <span className="font-bold text-sm">4.1%</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-secondary text-sm">Rear Promo Display</span>
                <span className="font-bold text-sm">4.8%</span>
              </div>
            </div>
          </div>

          {/* Top Pathing Trends Card */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <GitMerge size={20} className="text-secondary" />
              <h3 className="font-bold text-lg">Top Pathing Trends</h3>
            </div>
            
            <div className="pathing-list flex flex-col gap-6">
              {/* Path 1 */}
              <div className="path-item relative pl-4 border-l-2 border-dashed border-gray-300">
                <div className="path-node"></div>
                <div className="text-sm font-bold mb-2">Entrance</div>
                <div className="path-node" style={{ top: '30px' }}></div>
                <div className="text-sm text-secondary mb-2">Produce</div>
                <div className="path-node" style={{ top: '60px' }}></div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-bold">Bakery</div>
                  <span className="text-xs font-bold text-primary bg-primary-light px-2 py-1 rounded-md">34% of paths</span>
                </div>
              </div>

              {/* Path 2 */}
              <div className="path-item relative pl-4 border-l-2 border-dashed border-gray-300">
                <div className="path-node"></div>
                <div className="text-sm font-bold mb-2">Entrance</div>
                <div className="path-node" style={{ top: '30px' }}></div>
                <div className="text-sm text-secondary">Pharmacy</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
