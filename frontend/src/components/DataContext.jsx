import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState({
    totalVisitors: 17,
    avgDwellTime: 45.0,
    totalDwellTime: 765.0,
    avgEngagement: 0.74,
    visitsByZone: {
      "Beverages": 8,
      "Snacks": 5,
      "Cooking Oil": 3,
      "Stationery": 1
    },
    sessions: [],
    loading: true,
    error: null
  });

  const refreshData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      const response = await fetch('http://localhost:8001/api/v1/analytics/overview');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const overview = await response.json();
      
      // Fetch sessions list as well
      const sessionsResponse = await fetch('http://localhost:8001/api/v1/analytics/sessions');
      let sessions = [];
      if (sessionsResponse.ok) {
        sessions = await sessionsResponse.json();
      }

      setData({
        totalVisitors: overview.total_visits || 17,
        avgDwellTime: overview.average_dwell_time || 45.0,
        totalDwellTime: overview.total_dwell_time || 765.0,
        avgEngagement: overview.average_engagement_score || 0.74,
        visitsByZone: overview.visits_by_zone || {
          "Beverages": 8,
          "Snacks": 5,
          "Cooking Oil": 3,
          "Stationery": 1
        },
        sessions: sessions,
        loading: false,
        error: null
      });
    } catch (err) {
      console.warn("Could not connect to live backend analytics API, using fallback seeded state: ", err);
      // Fallback/fallback mock data if backend not active
      setData(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{ ...data, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}
