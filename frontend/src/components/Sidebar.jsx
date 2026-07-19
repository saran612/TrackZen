import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Map, Package, Users, Settings, HelpCircle, LogOut, Download, Video } from 'lucide-react';
import './Sidebar.css';
import { DataContext } from './DataContext';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/' },
  { id: 'engagement', label: 'Engagement', icon: BarChart2, path: '/analytics' },
  { id: 'live-view', label: 'Live View', icon: Video, path: '/live-view' },
  { id: 'heatmaps', label: 'Heatmaps', icon: Map, path: '/heatmaps' },
  { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory' },
  { id: 'staffing', label: 'Staffing', icon: Users, path: '/staffing' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const { totalVisitors, avgDwellTime, totalDwellTime, avgEngagement, visitsByZone } = useContext(DataContext);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      // Load jsPDF from CDN
      const jspdfModule = await new Promise((resolve, reject) => {
        if (window.jspdf) {
          resolve(window.jspdf);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => resolve(window.jspdf);
        script.onerror = (e) => reject(e);
        document.body.appendChild(script);
      });

      const { jsPDF } = jspdfModule;
      const doc = new jsPDF();

      // Page Header
      doc.setFillColor(37, 99, 235); // Blue
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('TrackZen Store Analytics', 15, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('RETAIL INTELLIGENCE REPORT', 15, 26);
      doc.text('REPORT DATE: 09-02-2025', 150, 18);
      doc.text('TIME SPAN: 13:00 - 15:00', 150, 24);

      // Section 1: Executive Overview
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Executive Overview', 15, 52);
      doc.setDrawColor(229, 231, 235);
      doc.line(15, 56, 195, 56);

      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('This report outlines customer traffic, dwell patterns, and shelf engagement indices compiled from the live tracking and pose estimation cameras.', 15, 62);

      // KPI Grid Boxes
      doc.setFillColor(243, 244, 246);
      doc.rect(15, 70, 85, 30, 'F');
      doc.rect(110, 70, 85, 30, 'F');
      doc.rect(15, 108, 85, 30, 'F');
      doc.rect(110, 108, 85, 30, 'F');

      // Box 1
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text('TOTAL VISITORS', 20, 78);
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text(`${totalVisitors}`, 20, 88);

      // Box 2
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('AVG DWELL TIME', 115, 78);
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text(`${Math.round(avgDwellTime)} seconds`, 115, 88);

      // Box 3
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('TOTAL DWELL TIME', 20, 116);
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text(`${Math.round(totalDwellTime)} seconds`, 20, 126);

      // Box 4
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('AVG ENGAGEMENT SCORE', 115, 116);
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text(`${avgEngagement}`, 115, 126);

      // Section 2: Shelf Popularity Table
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Shelf Popularity Comparison', 15, 154);
      doc.line(15, 158, 195, 158);

      // Table Headers
      doc.setFillColor(37, 99, 235);
      doc.rect(15, 164, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('SHELF / ZONE NAME', 18, 170);
      doc.text('VISIT COUNT', 100, 170);
      doc.text('POPULARITY SHARE', 150, 170);

      // Table Rows
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      let yOffset = 178;
      Object.entries(visitsByZone)
        .sort((a, b) => b[1] - a[1])
        .forEach(([zoneName, visits]) => {
          const share = Math.round((visits / (totalVisitors || 17)) * 100);
          doc.text(zoneName, 18, yOffset);
          doc.text(`${visits}`, 100, yOffset);
          doc.text(`${share}%`, 150, yOffset);
          
          doc.setDrawColor(243, 244, 246);
          doc.line(15, yOffset + 2, 195, yOffset + 2);
          yOffset += 8;
        });

      // Section 3: Legal Disclaimers
      doc.setFillColor(254, 242, 242);
      doc.rect(15, 235, 180, 20, 'F');
      doc.setDrawColor(248, 113, 113);
      doc.rect(15, 235, 180, 20);
      
      doc.setTextColor(153, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('BEHAVIORAL METRICS DISCLAIMER', 18, 241);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('All conversion metrics, shelf pick-ups, and dwell values are computed video proxies from the CV pipeline', 18, 246);
      doc.text('and are NOT verified against Point-of-Sale (POS) cashier databases.', 18, 250);

      // Save PDF
      doc.save('TrackZen_Analytics_Report_09_02_2025.pdf');
    } catch (error) {
      console.error("Failed to generate PDF: ", error);
      alert("Error generating PDF report. Please verify connection to jsPDF CDN.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside className="sidebar flex flex-col">
      <div className="sidebar-header flex items-center gap-4">
        <div className="store-logo">
          <span className="logo-text">402</span>
        </div>
        <div className="store-info">
          <h2 className="store-name">Store #402</h2>
          <p className="store-region">North Region</p>
        </div>
      </div>

      <nav className="sidebar-nav flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <NavLink 
                to={item.path} 
                end={item.path === '/'}
                className={({ isActive }) => `nav-item flex items-center gap-4 ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={handleExportReport}
          disabled={isExporting}
          className="btn btn-primary w-full flex items-center justify-center gap-2 mb-4"
        >
          <Download size={16} />
          <span className="btn-label">{isExporting ? "Exporting..." : "Export Report"}</span>
        </button>
        <ul className="footer-links">
          <li>
            <a href="#" className="nav-item flex items-center gap-4">
              <HelpCircle size={20} className="nav-icon" />
              <span className="nav-label">Help Center</span>
            </a>
          </li>
          <li>
            <a href="#" className="nav-item flex items-center gap-4">
              <LogOut size={20} className="nav-icon" />
              <span className="nav-label">Sign Out</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
