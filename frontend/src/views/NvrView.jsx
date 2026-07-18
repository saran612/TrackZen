import React, { useState, useEffect, useRef } from 'react';
import { Camera, Grid, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import './NvrView.css';

export default function NvrView() {
    const [camCount, setCamCount] = useState(1);
    const [focusedCam, setFocusedCam] = useState(1);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [webcamStream, setWebcamStream] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [processedFrame, setProcessedFrame] = useState(null);

    const mainVideoRef = useRef(null);
    const sideVideoRef = useRef(null);
    const webcamVideoRef = useRef(null);
    const canvasRef = useRef(document.createElement('canvas'));

    // List of camera descriptions
    const cameraNames = [
        "CAM 01 - Main Entrance (Live Feed)",
        "CAM 02 - Electronics Display",
        "CAM 03 - Apparel Aisle A",
        "CAM 04 - Checkout Counters",
        "CAM 05 - Back Corridor",
        "CAM 06 - Parking Lot East",
        "CAM 07 - Loading Dock",
        "CAM 08 - Staff Lounge",
        "CAM 09 - Pharmacy Section",
        "CAM 10 - Fresh Produce Aisle",
        "CAM 11 - Bakery Counter",
        "CAM 12 - Beverage Coolers",
        "CAM 13 - Frozen Foods Shelf",
        "CAM 14 - Customer Service Desk",
        "CAM 15 - Warehouse Racks A",
        "CAM 16 - Warehouse Racks B",
        "CAM 17 - Side Exit Alley",
        "CAM 18 - Parking Lot West",
        "CAM 19 - Office Corridor",
        "CAM 20 - Server Room",
        "CAM 21 - Electronics Storage",
        "CAM 22 - Delivery Bay",
        "CAM 23 - Cash Vault Room",
        "CAM 24 - Main Lobby Elevator",
        "CAM 25 - Escalator Exit",
        "CAM 26 - Cosmetics Counter",
        "CAM 27 - Toy Aisle 5",
        "CAM 28 - Home Goods Corner",
        "CAM 29 - Sporting Goods Row",
        "CAM 30 - Grocery Aisle 7",
        "CAM 31 - Meat Department",
        "CAM 32 - Outdoor Garden Center"
    ];

    // Detect if external camera/webcam is plugged in and switch to live feed
    useEffect(() => {
        let activeStream = null;

        async function setupWebcam() {
            try {
                // Check list of devices
                let devices = await navigator.mediaDevices.enumerateDevices();
                
                // If permission is not yet granted, labels might be empty. Request temporarily to get labels.
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
                    // Stop any existing stream before creating a new one
                    if (activeStream) {
                        activeStream.getTracks().forEach(track => track.stop());
                    }

                    // Request external webcam access
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

        // Listen to changes (plugging/unplugging webcam)
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

    // Bind webcam stream to the background video element
    useEffect(() => {
        if (webcamStream && webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = webcamStream;
        }
    }, [webcamStream]);

    // WebSocket connection for real-time YOLO processing of the live stream
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
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
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

    // Bind webcam stream to main video element if focused (for fallback)
    useEffect(() => {
        if (focusedCam === 1 && mainVideoRef.current && !processedFrame) {
            mainVideoRef.current.srcObject = webcamStream || null;
        }
    }, [focusedCam, webcamStream, processedFrame]);

    // Bind webcam stream to side camera element if not focused but active (for fallback)
    useEffect(() => {
        if (focusedCam !== 1 && sideVideoRef.current && !processedFrame) {
            sideVideoRef.current.srcObject = webcamStream || null;
        }
    }, [focusedCam, webcamStream, processedFrame]);

    // Listen for spacebar press to play/pause
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                const activeEl = document.activeElement;
                if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
                    return;
                }
                e.preventDefault();
                handlePlayPause();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying]);

    const handlePlayPause = () => {
        if (mainVideoRef.current) {
            if (isPlaying) {
                mainVideoRef.current.pause();
            } else {
                mainVideoRef.current.play().catch(e => console.log(e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleMuteToggle = () => {
        if (mainVideoRef.current) {
            mainVideoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleScrubChange = (e) => {
        const val = parseFloat(e.target.value);
        if (mainVideoRef.current) {
            mainVideoRef.current.currentTime = val;
            setCurrentTime(val);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleCamSwap = (camId) => {
        setFocusedCam(camId);
    };

    // Calculate lists
    const activeCams = Array.from({ length: camCount }, (_, i) => i + 1);
    const sideCams = activeCams.filter(id => id !== focusedCam);

    return (
        <div className="nvr-view flex flex-col h-full gap-4">
            {/* Background webcam element for frame capture */}
            <video 
                ref={webcamVideoRef}
                style={{ display: 'none' }}
                autoPlay
                muted
                playsInline
            />

            {/* Control Header */}
            <div className="nvr-header flex justify-between items-center p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="nvr-pulse-dot"></div>
                    <h2 className="text-xl font-bold text-primary">NVR Security Video Wall</h2>
                    <span className="text-sm text-secondary">
                        {camCount} Feeds Connected &bull; {webcamStream ? "Real-time YOLO Live Feed" : "Pre-recorded Feed"}
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Camera Select Dropdown */}
                    <div className="flex items-center gap-2">
                        <Grid size={16} className="text-secondary" />
                        <select 
                            value={camCount} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setCamCount(val);
                                // Reset focus if current focus is out of range
                                if (focusedCam > val) {
                                    setFocusedCam(1);
                                }
                            }}
                            className="nvr-select"
                        >
                            <option value="1">1 Camera</option>
                            <option value="2">2 Cameras</option>
                            <option value="4">4 Cameras</option>
                            <option value="8">8 Cameras</option>
                            <option value="16">16 Cameras</option>
                            <option value="32">32 Cameras</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Video Wall Layout */}
            <div className="nvr-layout flex-1 overflow-hidden">
                
                {/* Left Section: Main Focused View (Large Camera) */}
                <div className={`main-cam-container ${camCount === 1 ? 'span-5' : 'span-4'} bg-black rounded-2xl relative overflow-hidden shadow-md flex items-center justify-center`}>
                    {focusedCam === 1 ? (
                        <>
                            {webcamStream && processedFrame ? (
                                <img 
                                    src={processedFrame} 
                                    className="w-full h-full object-cover" 
                                    alt="Live YOLO Feed"
                                />
                            ) : (
                                <video 
                                    ref={mainVideoRef}
                                    key={`main-video-focus-${focusedCam}-${!!webcamStream}`}
                                    src={webcamStream ? undefined : "/full_video.mp4"}
                                    autoPlay={isPlaying}
                                    loop={!webcamStream}
                                    muted={isMuted}
                                    playsInline
                                    onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            
                            {/* Video Control Overlay (Hidden if live cam is detected) */}
                            {!webcamStream && (
                                <div className="nvr-player-overlay">
                                    <div className="nvr-player-controls flex items-center gap-4">
                                        <button onClick={handlePlayPause} className="icon-btn text-white" title={isPlaying ? "Pause" : "Play"}>
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                        </button>
                                        <button onClick={handleMuteToggle} className="icon-btn text-white" title={isMuted ? "Unmute" : "Mute"}>
                                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </button>
                                        
                                        {/* Timeline Slider */}
                                        <div className="flex-1 flex items-center gap-3">
                                            <span className="time-display">{formatTime(currentTime)}</span>
                                            <input 
                                                type="range" 
                                                min={0} 
                                                max={duration || 0} 
                                                value={currentTime} 
                                                onChange={handleScrubChange} 
                                                className="timeline-slider"
                                            />
                                            <span className="time-display">{formatTime(duration)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500 font-bold gap-3">
                            <Camera size={48} className="text-gray-600" />
                            <span className="text-lg">No camera found</span>
                            <span className="text-xs text-gray-500 font-normal">This channel has no active feed connected</span>
                        </div>
                    )}
                </div>

                {/* Right Section: Scrollable List of Small Camera Feeds */}
                {camCount > 1 && (
                    <div className="side-cams-container overflow-y-auto pr-2">
                        {sideCams.map((camId) => (
                            <div 
                                key={`side-cam-${camId}`}
                                onClick={() => handleCamSwap(camId)}
                                className="side-cam-card bg-black aspect-video rounded-xl relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-sm flex items-center justify-center"
                            >
                                {camId === 1 ? (
                                    webcamStream && processedFrame ? (
                                        <img 
                                            src={processedFrame} 
                                            className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" 
                                            alt="Live YOLO Feed"
                                        />
                                    ) : (
                                        <video 
                                            ref={sideVideoRef}
                                            key={`side-video-${camId}-${isPlaying}-${!!webcamStream}`}
                                            src={webcamStream ? undefined : "/full_video.mp4"}
                                            autoPlay={isPlaying}
                                            loop={!webcamStream}
                                            muted 
                                            playsInline 
                                            className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                                        />
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-2 text-gray-600 text-xs font-bold gap-1">
                                        <Camera size={18} />
                                        <span>No camera found</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
