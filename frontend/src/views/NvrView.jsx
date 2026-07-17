import React, { useState, useEffect, useRef } from 'react';
import { Camera, Grid, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import './NvrView.css';

export default function NvrView() {
    const [camCount, setCamCount] = useState(1);
    const [focusedCam, setFocusedCam] = useState(1);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [webcamStream, setWebcamStream] = useState(null);

    const mainVideoRef = useRef(null);
    const sideVideoRef = useRef(null);

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

    // Bind webcam stream to main video element if focused
    useEffect(() => {
        if (focusedCam === 1 && mainVideoRef.current) {
            mainVideoRef.current.srcObject = webcamStream || null;
        }
    }, [focusedCam, webcamStream]);

    // Bind webcam stream to side camera element if not focused but active
    useEffect(() => {
        if (focusedCam !== 1 && sideVideoRef.current) {
            sideVideoRef.current.srcObject = webcamStream || null;
        }
    }, [focusedCam, webcamStream]);

    const handleCamSwap = (camId) => {
        setFocusedCam(camId);
    };

    // Calculate lists
    const activeCams = Array.from({ length: camCount }, (_, i) => i + 1);
    const sideCams = activeCams.filter(id => id !== focusedCam);

    return (
        <div className="nvr-view flex flex-col h-full gap-4">
            {/* Control Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="nvr-pulse-dot"></div>
                    <h2 className="text-xl font-bold text-primary">NVR Security Video Wall</h2>
                    <span className="text-sm text-secondary">
                        {camCount} Feeds Connected &bull; {webcamStream ? "Webcam Live Stream" : "Pre-recorded Feed"}
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Control Buttons */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)} 
                            className="icon-btn-nvr" 
                            title={isPlaying ? "Pause All" : "Play All"}
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button 
                            onClick={() => setIsMuted(!isMuted)} 
                            className="icon-btn-nvr"
                            title={isMuted ? "Unmute Main" : "Mute Main"}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>

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
                        <video 
                            ref={mainVideoRef}
                            key={`main-video-focus-${focusedCam}-${isPlaying}-${isMuted}-${!!webcamStream}`}
                            src={webcamStream ? undefined : "/test_tracked.mp4"}
                            autoPlay={isPlaying}
                            loop={!webcamStream}
                            muted={isMuted}
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500 font-bold gap-3">
                            <Camera size={48} className="text-gray-600" />
                            <span className="text-lg">No camera found</span>
                            <span className="text-xs text-gray-500 font-normal">This channel has no active feed connected</span>
                        </div>
                    )}
                    
                    {/* Overlay Details */}
                    <div className="cam-overlay-nvr cam-overlay-large">
                        <div className="flex justify-between items-end w-full mt-auto">
                            <span className="text-xs text-white/70 font-mono bg-black/40 px-2 py-1 rounded">
                                FPS: {focusedCam === 1 ? '30' : '0'} &bull; BPS: {focusedCam === 1 ? '4.8 Mbps' : '0 Kbps'} &bull; Codec: H.264
                            </span>
                            <span className="text-xs text-white/70 font-mono bg-black/40 px-2 py-1 rounded">
                                Focus View Active
                            </span>
                        </div>
                    </div>
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
                                    <video 
                                        ref={sideVideoRef}
                                        key={`side-video-${camId}-${isPlaying}-${!!webcamStream}`}
                                        src={webcamStream ? undefined : "/test_tracked.mp4"}
                                        autoPlay={isPlaying}
                                        loop={!webcamStream}
                                        muted 
                                        playsInline 
                                        className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                                    />
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
