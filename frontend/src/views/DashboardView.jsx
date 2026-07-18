import React, { useState, useEffect, useRef, useContext } from 'react';
import { TrendingUp, TrendingDown, Clock, Users, Camera } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import './DashboardView.css';
import { DataContext } from '../components/DataContext';

const peakData = [
  { time: '9am', val: 0 },
  { time: '10am', val: 0 },
  { time: '11am', val: 0 },
  { time: '12pm', val: 0 },
  { time: '1pm', val: 12 },
  { time: '2pm', val: 15 },
  { time: '3pm', val: 0 },
  { time: '4pm', val: 0 },
  { time: '5pm', val: 0 },
  { time: '6pm', val: 0 },
];

export default function DashboardView() {
  const { totalVisitors, avgDwellTime, visitsByZone } = useContext(DataContext);
  const [webcamStream, setWebcamStream] = useState(null);
  const [processedFrame, setProcessedFrame] = useState(null);
  const videoRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));

  // Determine most visited and least visited zones dynamically
  let mostVisitedZone = "Beverages";
  let leastVisitedZone = "Stationery";
  
  if (visitsByZone && Object.keys(visitsByZone).length > 0) {
    const sortedZones = Object.entries(visitsByZone).sort((a, b) => b[1] - a[1]);
    mostVisitedZone = sortedZones[0][0];
    leastVisitedZone = sortedZones[sortedZones.length - 1][0];
  }

  // Detect if external camera/webcam is plugged in and switch to live feed
  useEffect(() => {
    let activeStream = null;

    async function setupWebcam() {
      try {
        let devices = await navigator.mediaDevices.enumerateDevices();
        const hasEmptyLabels = devices.some(d => d.kind === 'videoinput' && !d.label);
        if (hasEmptyLabels) {
          try {
            const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
            tempStream.getTracks().forEach(track => track.stop());
            devices = await navigator.mediaDevices.enumerateDevices();
          } catch (e) {
            console.warn("Permission denied for device labels query: ", e);
          }
        }

        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        // Find a device that is not an integrated/internal camera
        const externalDevice = videoDevices.find(device => {
          const label = (device.label || "").toLowerCase();
          return !label.includes("integrated") && 
                 !label.includes("built-in") && 
                 !label.includes("front") && 
                 !label.includes("internal");
        });

        if (externalDevice) {
          if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: externalDevice.deviceId }, width: 1280, height: 720 }
          });
          activeStream = stream;
          setWebcamStream(stream);
        } else {
          if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
            activeStream = null;
          }
          setWebcamStream(null);
        }
      } catch (err) {
        console.warn("Webcam access failed or denied: ", err);
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
          activeStream = null;
        }
        setWebcamStream(null);
      }
    }

    setupWebcam();

    const handleDeviceChange = () => {
      setupWebcam();
    };
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Bind stream to background webcam ref
  useEffect(() => {
    if (webcamStream && webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // WebSocket for real-time live YOLO annotations
  useEffect(() => {
    if (!webcamStream) {
      setProcessedFrame(null);
      return;
    }

    const ws = new WebSocket('ws://localhost:8001/api/v1/live-feed');
    ws.onmessage = (event) => {
      setProcessedFrame(event.data);
    };

    const intervalId = setInterval(() => {
      if (webcamVideoRef.current && ws.readyState === WebSocket.OPEN) {
        const video = webcamVideoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        ws.send(dataUrl);
      }
    }, 80); // ~12 fps

    return () => {
      clearInterval(intervalId);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [webcamStream]);

  // Bind fallback stream to video element
  useEffect(() => {
    if (videoRef.current && !processedFrame) {
      videoRef.current.srcObject = webcamStream || null;
    }
  }, [webcamStream, processedFrame]);

  return (
    <div className="dashboard-view flex flex-col gap-6">
      {/* Background webcam element for frame capture */}
      <video 
        ref={webcamVideoRef}
        style={{ display: 'none' }}
        autoPlay
        muted
        playsInline
      />
      
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-subtitle !mb-0">MOST VISITED</h3>
            <TrendingUp size={16} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{mostVisitedZone}</h2>
          <span className="badge badge-primary">High Engagement</span>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-subtitle !mb-0">LEAST VISITED</h3>
            <TrendingDown size={16} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{leastVisitedZone}</h2>
          <span className="badge badge-danger">Action Required</span>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-subtitle !mb-0">AVG DWELL TIME</h3>
            <Clock size={16} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{Math.round(avgDwellTime)}s</h2>
          <p className="text-sm text-secondary">On 09-02-2025</p>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-subtitle !mb-0">TOTAL VISITORS</h3>
            <Users size={16} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{totalVisitors}</h2>
          <p className="text-sm text-secondary">Date: 09-02-2025</p>
        </div>
      </div>

      {/* Row 2 */}
      <div className="dashboard-row-2">
        <div className="card live-camera-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title !mb-0">Live Camera Feed (09-02-2025)</h3>
            <span className="live-indicator">LIVE</span>
          </div>
          <div className="camera-placeholder" style={{ padding: 0 }}>
            {webcamStream ? (
              processedFrame ? (
                <img 
                  src={processedFrame} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Live YOLO Feed"
                />
              ) : (
                <video 
                  ref={videoRef}
                  autoPlay 
                  muted 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )
            ) : (
              <video 
                src="/picking_and_returning_tracked.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Peak Engagement Periods</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Area type="monotone" dataKey="val" stroke="#2563eb" fill="rgba(37, 99, 235, 0.1)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card heatmap-card flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title !mb-0">Traffic Heatmap</h3>
            <MapIcon size={16} className="text-secondary" />
          </div>
          <div className="heatmap-placeholder flex-1" style={{ position: 'relative', minHeight: '260px' }}>
             <div className="heat-spot spot-high" style={{ left: '50%', top: '65%', width: '100px', height: '80px', position: 'absolute' }}></div>
             <div className="heat-spot spot-medium" style={{ left: '35%', top: '35%', width: '70px', height: '100px', position: 'absolute' }}></div>
             <div className="heat-spot spot-low" style={{ left: '15%', top: '15%', width: '120px', height: '90px', position: 'absolute' }}></div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Shelf Popularity Comparison</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-secondary text-sm border-b">
                  <th className="pb-3">SHELF / ZONE</th>
                  <th className="pb-3 text-right">VISITS</th>
                  <th className="pb-3 text-right">SHARE (%)</th>
                  <th className="pb-3 text-center">ENGAGEMENT</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(visitsByZone)
                  .sort((a, b) => b[1] - a[1])
                  .map(([zoneName, visits]) => {
                    const share = Math.round((visits / (totalVisitors || 17)) * 100);
                    let badgeClass = "badge-primary";
                    let badgeLabel = "High";
                    if (visits < 3) {
                      badgeClass = "badge-danger";
                      badgeLabel = "Low";
                    } else if (visits < 8) {
                      badgeClass = "badge-success";
                      badgeLabel = "Medium";
                    }
                    return (
                      <tr key={zoneName} className="border-b last:border-b-0">
                        <td className="py-3 font-medium">{zoneName}</td>
                        <td className="py-3 text-right font-bold text-primary">{visits}</td>
                        <td className="py-3 text-right">{share}%</td>
                        <td className="py-3 text-center">
                          <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 4 */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title !mb-0">Shelf Performance Ranking</h3>
          <span className="text-secondary text-sm">Date: 09-02-2025</span>
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
              <td className="py-4">Beverages</td>
              <td className="py-4 text-right">{visitsByZone["Beverages"] || 8}</td>
              <td className="py-4 text-right">{Math.round(avgDwellTime * 1.15)}s</td>
              <td className="py-4 text-right">{Math.round((visitsByZone["Beverages"] || 8) * avgDwellTime * 1.15)}s</td>
              <td className="py-4 text-center"><span className="badge badge-success">High Traffic</span></td>
            </tr>
            <tr className="border-b">
              <td className="py-4 font-medium">2</td>
              <td className="py-4">Snacks</td>
              <td className="py-4 text-right">{visitsByZone["Snacks"] || 5}</td>
              <td className="py-4 text-right">{Math.round(avgDwellTime * 0.95)}s</td>
              <td className="py-4 text-right">{Math.round((visitsByZone["Snacks"] || 5) * avgDwellTime * 0.95)}s</td>
              <td className="py-4 text-center"><span className="badge badge-success">High Traffic</span></td>
            </tr>
            <tr className="border-b">
              <td className="py-4 font-medium">3</td>
              <td className="py-4">Cooking Oil (Back Wall)</td>
              <td className="py-4 text-right">{visitsByZone["Cooking Oil"] || 3}</td>
              <td className="py-4 text-right">{Math.round(avgDwellTime * 0.75)}s</td>
              <td className="py-4 text-right">{Math.round((visitsByZone["Cooking Oil"] || 3) * avgDwellTime * 0.75)}s</td>
              <td className="py-4 text-center"><span className="badge badge-primary">Normal</span></td>
            </tr>
            <tr>
              <td className="py-4 font-medium">4</td>
              <td className="py-4">Stationery</td>
              <td className="py-4 text-right">{visitsByZone["Stationery"] || 1}</td>
              <td className="py-4 text-right">{Math.round(avgDwellTime * 0.4)}s</td>
              <td className="py-4 text-right">{Math.round((visitsByZone["Stationery"] || 1) * avgDwellTime * 0.4)}s</td>
              <td className="py-4 text-center"><span className="badge badge-danger">Low Traffic</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

function MapIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}
