import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardView from './views/DashboardView';
import AnalyticsView from './views/AnalyticsView';
import LiveView from './views/LiveView';
import InventoryView from './views/InventoryView';

import HeatmapView from './views/HeatmapView';
import SettingsView from './views/SettingsView';
import StaffingView from './views/StaffingView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="live-view" element={<LiveView />} />
          <Route path="inventory" element={<InventoryView />} />
          <Route path="heatmaps" element={<HeatmapView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="staffing" element={<StaffingView />} />
          {/* Catch-all for non-implemented sidebar links */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
